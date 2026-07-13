import { makeAutoObservable, observable, runInAction } from 'mobx'
import { Platform } from 'react-native'

import { NIMConfig } from '@/constants/NIMConfig'
import { friendGroupByPy } from '@/src/NEUIKit/common/utils/friend'
import { translateCurrentApp } from '@/utils/app-language'
import { ensureNetworkAvailable } from '@/utils/network'
import {
  V2NIMFriend,
  V2NIMFriendAddApplication,
  V2NIMFriendAddApplicationStatus,
  V2NIMFriendAddApplicationType,
  V2NIMFriendAddMode
} from '@/utils/nim-sdk'
import { storage } from '@/utils/storage'

import { conversationStore } from './ConversationStore'
import { imStoreV2Bridge } from './ImStoreV2Bridge'
import { messageStore } from './MessageStore'
import { nimStore } from './NIMStore'

type FriendApplicationRecord = V2NIMFriendAddApplication & {
  isRead?: boolean
}

const GLOBAL_FRIEND_STATUS_SCOPE_ID = 'global-friends'
const GLOBAL_FRIEND_STATUS_MAX_ACCOUNT_COUNT = 3000
const GLOBAL_FRIEND_STATUS_SUBSCRIBE_DELAY_MS = 15_000
const GLOBAL_FRIEND_STATUS_ANDROID_ENABLED = false

type UserStatusScopeApi = {
  clearUIKitUserStatusSubscriptionScope: (scopeId: string) => void
  setUIKitUserStatusSubscriptionScope: (scopeId: string, accountIds: string[]) => void
}

export type FriendDirectoryItem = {
  accountId: string
  appellation: string
  avatar?: string
}

export type FriendDirectorySection = {
  key: string
  title: string
  data: FriendDirectoryItem[]
}

function getUserStatusScopeApi(): UserStatusScopeApi {
  return require('@/src/NEUIKit/rn/user-status') as UserStatusScopeApi
}

class FriendStore {
  friends = observable.map<string, V2NIMFriend>({})
  sortedFriendList: V2NIMFriend[] = []
  friendDirectorySections: FriendDirectorySection[] = []
  friendListVersion = 0
  applicationMap = observable.map<string, FriendApplicationRecord>({})
  unreadApplicationCount = 0
  blockList: string[] = []
  hasLoadedApplications = false
  isApplicationSyncing = false
  clearedApplicationTimestamp = 0
  clearedApplicationStateAccountId = ''
  private globalFriendStatusSubscriptionKey = ''
  private globalFriendStatusSubscriptionTimer: ReturnType<typeof setTimeout> | null = null

  constructor() {
    makeAutoObservable(
      this,
      {
        sortedFriendList: observable.ref,
        friendDirectorySections: observable.ref,
        globalFriendStatusSubscriptionKey: false,
        globalFriendStatusSubscriptionTimer: false
      } as never,
      { autoBind: true }
    )
  }

  resetState() {
    this.friends.clear()
    this.sortedFriendList = []
    this.friendDirectorySections = []
    this.friendListVersion += 1
    this.clearGlobalFriendStatusSubscriptionTimer()
    this.syncGlobalFriendStatusSubscription()
    this.applicationMap.clear()
    this.unreadApplicationCount = 0
    this.blockList = []
    this.hasLoadedApplications = false
    this.isApplicationSyncing = false
    this.clearedApplicationTimestamp = 0
    this.clearedApplicationStateAccountId = ''
  }

  markApplicationSyncPending() {
    this.hasLoadedApplications = false
    this.isApplicationSyncing = true
  }

  private canQueryFriends() {
    const nim = nimStore.nim

    if (!nim || !nimStore.getLoginUser()) {
      return false
    }

    try {
      return nim.V2NIMLoginService.getLoginStatus() === 1
    } catch {
      return false
    }
  }

  private getApplicationKey(application: FriendApplicationRecord) {
    return application.serverId
      ? `server:${application.serverId}`
      : `${application.applicantAccountId}:${application.recipientAccountId}:${application.timestamp}`
  }

  private getApplicationClearStorageKey(accountId: string) {
    return `${NIMConfig.storageKeys.friendApplicationClearTimestamp}.${accountId}`
  }

  private getApplicantThreadKey(application: FriendApplicationRecord) {
    return `${application.applicantAccountId}_${application.recipientAccountId}`
  }

  private isApplicationRead(application: FriendApplicationRecord) {
    return application.read ?? application.isRead ?? false
  }

  private normalizeApplication(application: V2NIMFriendAddApplication | FriendApplicationRecord) {
    const isRead = this.isApplicationRead(application)

    return {
      ...application,
      read: isRead,
      isRead
    } as FriendApplicationRecord
  }

  private getLatestApplicationTimestamp(
    applications: Pick<V2NIMFriendAddApplication, 'timestamp'>[]
  ) {
    return applications.reduce((latest, item) => Math.max(latest, item.timestamp || 0), 0)
  }

  private filterClearedApplications(applications: V2NIMFriendAddApplication[]) {
    if (!this.clearedApplicationTimestamp) {
      return applications
    }

    return applications.filter((item) => item.timestamp > this.clearedApplicationTimestamp)
  }

  private async ensureApplicationClearStateLoaded() {
    const accountId = nimStore.getLoginUser()

    if (!accountId) {
      if (this.clearedApplicationStateAccountId || this.clearedApplicationTimestamp) {
        runInAction(() => {
          this.clearedApplicationStateAccountId = ''
          this.clearedApplicationTimestamp = 0
        })
      }
      return
    }

    if (this.clearedApplicationStateAccountId === accountId) {
      return
    }

    const storedValue = await storage.getString(this.getApplicationClearStorageKey(accountId))
    const parsedTimestamp = Number.parseInt(storedValue || '', 10)

    runInAction(() => {
      this.clearedApplicationStateAccountId = accountId
      this.clearedApplicationTimestamp = Number.isFinite(parsedTimestamp) ? parsedTimestamp : 0
    })
  }

  private async persistClearedApplicationTimestamp(timestamp: number) {
    const accountId = nimStore.getLoginUser()

    if (!accountId) {
      return
    }

    runInAction(() => {
      this.clearedApplicationStateAccountId = accountId
      this.clearedApplicationTimestamp = timestamp
    })

    if (timestamp > 0) {
      await storage.setString(this.getApplicationClearStorageKey(accountId), String(timestamp))
      return
    }

    await storage.remove(this.getApplicationClearStorageKey(accountId))
  }

  private isPendingUnreadApplication(application: FriendApplicationRecord) {
    return (
      !this.isApplicationRead(application) &&
      this.isInboundApplication(application) &&
      application.status ===
        V2NIMFriendAddApplicationStatus.V2NIM_FRIEND_ADD_APPLICATION_STATUS_INIT
    )
  }

  private isInboundApplication(application: FriendApplicationRecord) {
    const currentAccountId = nimStore.getLoginUser()

    return (
      !!currentAccountId &&
      application.recipientAccountId === currentAccountId &&
      application.applicantAccountId !== currentAccountId
    )
  }

  private selectPreferredApplication(
    current: FriendApplicationRecord,
    next: FriendApplicationRecord
  ) {
    const normalizedCurrent = this.normalizeApplication(current)
    const normalizedNext = this.normalizeApplication(next)
    const currentPendingUnread = this.isPendingUnreadApplication(normalizedCurrent)
    const nextPendingUnread = this.isPendingUnreadApplication(normalizedNext)
    const sameApplication =
      this.getApplicationKey(normalizedCurrent) === this.getApplicationKey(normalizedNext)

    if (currentPendingUnread && nextPendingUnread) {
      return normalizedNext.timestamp >= normalizedCurrent.timestamp
        ? { ...normalizedCurrent, ...normalizedNext }
        : { ...normalizedNext, ...normalizedCurrent }
    }

    if (currentPendingUnread && !nextPendingUnread) {
      return sameApplication ? { ...normalizedCurrent, ...normalizedNext } : normalizedCurrent
    }

    if (!currentPendingUnread && nextPendingUnread) {
      return { ...normalizedCurrent, ...normalizedNext }
    }

    return normalizedNext.timestamp >= normalizedCurrent.timestamp
      ? { ...normalizedCurrent, ...normalizedNext }
      : normalizedCurrent
  }

  private upsertApplications(
    applications: V2NIMFriendAddApplication[],
    options?: { preserveLocalApplications?: boolean }
  ) {
    const nextMap: Map<string, FriendApplicationRecord> =
      options?.preserveLocalApplications === false
        ? new Map<string, FriendApplicationRecord>()
        : new Map<string, FriendApplicationRecord>(this.applicationMap.entries())

    applications.forEach((application) => {
      const normalizedApplication = this.normalizeApplication(application)
      const threadKey = this.getApplicantThreadKey(normalizedApplication)
      const current = nextMap.get(threadKey)

      if (!current) {
        nextMap.set(threadKey, normalizedApplication)
        return
      }

      nextMap.set(threadKey, this.selectPreferredApplication(current, normalizedApplication))
    })

    this.applicationMap.replace(nextMap)
  }

  private getFriendSortName(friend: V2NIMFriend) {
    return (friend.alias || friend.userProfile?.name || friend.accountId).toLowerCase()
  }

  private compareNormalizedText(left: string, right: string) {
    if (left === right) {
      return 0
    }

    return left > right ? 1 : -1
  }

  private sortFriendList(friends: V2NIMFriend[]) {
    return friends
      .map((friend) => ({
        friend,
        sortName: this.getFriendSortName(friend)
      }))
      .sort((left, right) => this.compareNormalizedText(left.sortName, right.sortName))
      .map((item) => item.friend)
  }

  private rebuildSortedFriendList(sortedFriendList?: V2NIMFriend[]) {
    this.sortedFriendList =
      sortedFriendList || this.sortFriendList(Array.from(this.friends.values()))
    this.friendDirectorySections = this.buildFriendDirectorySections(this.sortedFriendList)
    this.friendListVersion += 1
    this.syncGlobalFriendStatusSubscription()
  }

  private buildFriendDirectorySections(sourceFriends = this.sortedFriendList) {
    const blockedAccountIds = new Set(this.blockList)
    const items = sourceFriends
      .filter((friend) => !blockedAccountIds.has(friend.accountId))
      .map((friend) => {
        const appellation = friend.alias || friend.userProfile?.name || friend.accountId

        return {
          accountId: friend.accountId,
          appellation,
          avatar: friend.userProfile?.avatar,
          sortName: appellation.toLowerCase()
        }
      })
      .sort((left, right) => this.compareNormalizedText(left.sortName, right.sortName))

    return friendGroupByPy(
      items,
      {
        firstKey: 'appellation',
        secondKey: 'accountId'
      },
      false
    ).map((section) => ({
      key: section.key,
      title: section.key,
      data: section.data.map(({ sortName, ...item }) => item)
    }))
  }

  private syncGlobalFriendStatusSubscription() {
    if (Platform.OS === 'android' && !GLOBAL_FRIEND_STATUS_ANDROID_ENABLED) {
      this.globalFriendStatusSubscriptionKey = ''
      this.clearGlobalFriendStatusSubscriptionTimer()
      getUserStatusScopeApi().clearUIKitUserStatusSubscriptionScope(GLOBAL_FRIEND_STATUS_SCOPE_ID)
      return
    }

    const accountIds = this.sortedFriendList
      .map((friend) => friend.accountId)
      .filter(Boolean)
      .slice(0, GLOBAL_FRIEND_STATUS_MAX_ACCOUNT_COUNT)
    const nextKey = accountIds.join('|')

    if (nextKey === this.globalFriendStatusSubscriptionKey) {
      return
    }

    this.globalFriendStatusSubscriptionKey = nextKey

    const userStatusApi = getUserStatusScopeApi()

    if (!accountIds.length) {
      this.clearGlobalFriendStatusSubscriptionTimer()
      userStatusApi.clearUIKitUserStatusSubscriptionScope(GLOBAL_FRIEND_STATUS_SCOPE_ID)
      return
    }

    this.clearGlobalFriendStatusSubscriptionTimer()
    this.globalFriendStatusSubscriptionTimer = setTimeout(() => {
      this.globalFriendStatusSubscriptionTimer = null
      getUserStatusScopeApi().setUIKitUserStatusSubscriptionScope(
        GLOBAL_FRIEND_STATUS_SCOPE_ID,
        accountIds
      )
    }, GLOBAL_FRIEND_STATUS_SUBSCRIBE_DELAY_MS)
  }

  private clearGlobalFriendStatusSubscriptionTimer() {
    if (!this.globalFriendStatusSubscriptionTimer) {
      return
    }

    clearTimeout(this.globalFriendStatusSubscriptionTimer)
    this.globalFriendStatusSubscriptionTimer = null
  }

  get applications() {
    return Array.from(this.applicationMap.values() as Iterable<FriendApplicationRecord>).sort(
      (a, b) => b.timestamp - a.timestamp
    )
  }

  async refreshAll(options?: { preserveLocalApplications?: boolean }) {
    if (!this.canQueryFriends()) {
      return
    }

    const nim = nimStore.nim

    if (!nim) {
      return
    }

    await this.ensureApplicationClearStateLoaded()

    const [friends, applicationsResult, unreadCount, blockList] = await Promise.all([
      nim.V2NIMFriendService.getFriendList(),
      nim.V2NIMFriendService.getAddApplicationList({
        status: [],
        type: V2NIMFriendAddApplicationType?.V2NIM_FRIEND_ADD_APPLICATION_TYPE_ALL ?? 3,
        offset: 0,
        limit: 100
      } as never),
      nim.V2NIMFriendService.getAddApplicationUnreadCount(),
      nim.V2NIMUserService.getBlockList()
    ])
    const visibleApplications = this.filterClearedApplications(applicationsResult.infos)

    const nextFriends = new Map(friends.map((friend) => [friend.accountId, friend] as const))
    const sortedFriendList = this.sortFriendList(friends)

    runInAction(() => {
      this.friends.replace(nextFriends)
      this.blockList = blockList
      this.rebuildSortedFriendList(sortedFriendList)
      this.upsertApplications(visibleApplications, options)
      this.unreadApplicationCount = this.derivedUnreadApplicationCount
      this.hasLoadedApplications = true
      this.isApplicationSyncing = false
    })
  }

  async refreshApplications(options?: { preserveLocalApplications?: boolean }) {
    if (!this.canQueryFriends()) {
      return
    }

    const nim = nimStore.nim

    if (!nim) {
      return
    }

    await this.ensureApplicationClearStateLoaded()

    const [applicationsResult, unreadCount] = await Promise.all([
      nim.V2NIMFriendService.getAddApplicationList({
        status: [],
        type: V2NIMFriendAddApplicationType?.V2NIM_FRIEND_ADD_APPLICATION_TYPE_ALL ?? 3,
        offset: 0,
        limit: 100
      } as never),
      nim.V2NIMFriendService.getAddApplicationUnreadCount()
    ])
    const visibleApplications = this.filterClearedApplications(applicationsResult.infos)

    runInAction(() => {
      this.upsertApplications(visibleApplications, options)
      this.unreadApplicationCount = this.derivedUnreadApplicationCount
      this.hasLoadedApplications = true
      this.isApplicationSyncing = false
    })
  }

  get friendList() {
    return this.sortedFriendList
  }

  get friendSections() {
    return this.friendDirectorySections
  }

  get derivedUnreadApplicationCount() {
    return this.applications.filter((item) => this.isPendingUnreadApplication(item)).length
  }

  get deduplicatedApplications() {
    return this.applications.filter((item) => this.isInboundApplication(item))
  }

  get displayUnreadApplicationCount() {
    if (this.isApplicationSyncing) {
      return Math.max(this.derivedUnreadApplicationCount, this.unreadApplicationCount)
    }

    if (this.hasLoadedApplications) {
      return this.derivedUnreadApplicationCount
    }

    return this.derivedUnreadApplicationCount || this.unreadApplicationCount
  }

  applyApplication(application: V2NIMFriendAddApplication) {
    runInAction(() => {
      if (application.timestamp <= this.clearedApplicationTimestamp) {
        this.unreadApplicationCount = this.derivedUnreadApplicationCount
        this.hasLoadedApplications = true
        this.isApplicationSyncing = false
        return
      }

      if (!this.isInboundApplication(this.normalizeApplication(application))) {
        this.unreadApplicationCount = this.derivedUnreadApplicationCount
        this.hasLoadedApplications = true
        this.isApplicationSyncing = false
        return
      }

      this.upsertApplications([application])
      this.unreadApplicationCount = this.derivedUnreadApplicationCount
      this.hasLoadedApplications = true
      this.isApplicationSyncing = false
    })
  }

  applyFriendDeleted(accountId: string) {
    if (!accountId) {
      return
    }

    const conversationId = nimStore.nim?.V2NIMConversationIdUtil.p2pConversationId(accountId)

    runInAction(() => {
      this.friends.delete(accountId)
      this.rebuildSortedFriendList()
    })

    if (conversationId) {
      conversationStore.updateConversation(conversationId, {
        name: accountId
      })
    }
  }

  applyFriendChanged(friend: V2NIMFriend) {
    if (!friend?.accountId) {
      return
    }

    runInAction(() => {
      const current = this.friends.get(friend.accountId)

      this.friends.set(friend.accountId, {
        ...current,
        ...friend,
        userProfile: friend.userProfile || current?.userProfile
      })
      this.rebuildSortedFriendList()
    })
  }

  async ensureFriendRelationFresh(accountId: string) {
    const nim = nimStore.nim

    if (!accountId || !nim || nimStore.getLoginUser() === accountId) {
      return this.friends.get(accountId) || null
    }

    const result = await nim.V2NIMFriendService.checkFriend([accountId])
    const isFriend = !!result?.[accountId]

    if (!isFriend) {
      imStoreV2Bridge.applyFriendDeleted(accountId)
      this.applyFriendDeleted(accountId)
      return null
    }

    const current = this.friends.get(accountId)

    if (current) {
      return current
    }

    const friends = await nim.V2NIMFriendService.getFriendByIds([accountId]).catch(() => [])
    const friend = friends.find((item) => item.accountId === accountId)

    if (friend) {
      imStoreV2Bridge.applyFriendAdded(friend)
      this.applyFriendChanged(friend)
    }

    return friend || this.friends.get(accountId) || null
  }

  async addFriend(accountId: string, postscript: string) {
    const nim = nimStore.nim

    if (!nim) {
      return
    }

    const blockListBeforeAdd = await nim.V2NIMUserService.getBlockList().catch(() => this.blockList)
    const shouldRemoveFromBlockList = blockListBeforeAdd.includes(accountId)

    await nim.V2NIMFriendService.addFriend(accountId, {
      addMode: V2NIMFriendAddMode.V2NIM_FRIEND_MODE_TYPE_APPLY,
      postscript
    })

    if (shouldRemoveFromBlockList) {
      await nim.V2NIMUserService.removeUserFromBlockList(accountId)
    }

    await this.refreshAll()
  }

  async accept(application: V2NIMFriendAddApplication) {
    const nim = nimStore.nim

    if (!nim) {
      return
    }

    await ensureNetworkAvailable()
    await nim.V2NIMFriendService.acceptAddApplication(application)
    runInAction(() => {
      const updatedApplication: FriendApplicationRecord = {
        ...application,
        read: true,
        isRead: true,
        status: V2NIMFriendAddApplicationStatus.V2NIM_FRIEND_ADD_APPLICATION_STATUS_AGREED
      }

      this.upsertApplications([updatedApplication])
      this.unreadApplicationCount = this.derivedUnreadApplicationCount
    })

    const conversationId = application.applicantAccountId
      ? nim.V2NIMConversationIdUtil.p2pConversationId(application.applicantAccountId)
      : ''

    if (conversationId) {
      await messageStore
        .sendMessage(conversationId, translateCurrentApp('friendAcceptGreetingText'))
        .catch((error) => {
          console.warn('[friendStore] send accept greeting failed', error)
        })
    }

    await this.refreshAll({ preserveLocalApplications: false })
  }

  async reject(application: V2NIMFriendAddApplication, postscript?: string) {
    if (!nimStore.nim) {
      return
    }

    await ensureNetworkAvailable()
    await nimStore.nim.V2NIMFriendService.rejectAddApplication(application, postscript)
    runInAction(() => {
      const updatedApplication: FriendApplicationRecord = {
        ...application,
        read: true,
        isRead: true,
        status: V2NIMFriendAddApplicationStatus.V2NIM_FRIEND_ADD_APPLICATION_STATUS_REJECTED
      }

      this.upsertApplications([updatedApplication])
      this.unreadApplicationCount = this.derivedUnreadApplicationCount
    })
    await this.refreshAll({ preserveLocalApplications: false })
  }

  async markApplicationsRead() {
    if (!nimStore.nim) {
      return
    }

    runInAction(() => {
      this.unreadApplicationCount = 0
      this.upsertApplications(
        this.applications.map<FriendApplicationRecord>((item) => ({
          ...item,
          read: true,
          isRead: true
        })),
        {
          preserveLocalApplications: false
        }
      )
      this.hasLoadedApplications = true
      this.isApplicationSyncing = false
    })

    await nimStore.nim.V2NIMFriendService.setAddApplicationRead()
  }

  async clearApplications() {
    await this.ensureApplicationClearStateLoaded()
    const clearBeforeTimestamp = Math.max(
      Date.now(),
      this.getLatestApplicationTimestamp(this.applications)
    )

    await this.persistClearedApplicationTimestamp(clearBeforeTimestamp)
    runInAction(() => {
      this.applicationMap.clear()
      this.unreadApplicationCount = 0
      this.hasLoadedApplications = true
      this.isApplicationSyncing = false
    })

    const nim = nimStore.nim

    if (!nim) {
      return
    }

    try {
      await nim.V2NIMFriendService.clearAllAddApplication()
      await this.refreshAll({ preserveLocalApplications: false })
    } catch (error) {
      console.warn('[friendStore] clearApplications remote clear failed after local clear', error)
    }
  }

  async deleteApplication(application: V2NIMFriendAddApplication) {
    if (!nimStore.nim) {
      return
    }

    await nimStore.nim.V2NIMFriendService.deleteAddApplication(application)
    runInAction(() => {
      this.applicationMap.delete(this.getApplicantThreadKey(application))
      this.unreadApplicationCount = this.derivedUnreadApplicationCount
    })
    await this.refreshAll({ preserveLocalApplications: false })
  }

  async updateAlias(accountId: string, alias: string) {
    if (!nimStore.nim) {
      return
    }

    await nimStore.nim.V2NIMFriendService.setFriendInfo(accountId, { alias })
    await this.refreshAll()
  }

  async deleteFriend(accountId: string) {
    const nim = nimStore.nim

    if (!nim) {
      return
    }

    await nim.V2NIMFriendService.deleteFriend(accountId, {
      deleteAlias: true
    })

    this.applyFriendDeleted(accountId)

    try {
      await this.refreshAll()
    } catch (error) {
      console.warn('[friendStore] refreshAll failed after deleteFriend', error)
    }
  }

  async addToBlockList(accountId: string) {
    if (!nimStore.nim) {
      return
    }

    await nimStore.nim.V2NIMUserService.addUserToBlockList(accountId)
    await this.refreshAll()
  }

  async removeFromBlockList(accountId: string) {
    if (!nimStore.nim) {
      return
    }

    await nimStore.nim.V2NIMUserService.removeUserFromBlockList(accountId)
    await this.refreshAll()
  }

  getApplicationStatusLabel(status: V2NIMFriendAddApplicationStatus) {
    switch (status) {
      case V2NIMFriendAddApplicationStatus.V2NIM_FRIEND_ADD_APPLICATION_STATUS_AGREED:
        return translateCurrentApp('commonStatusAgreed')
      case V2NIMFriendAddApplicationStatus.V2NIM_FRIEND_ADD_APPLICATION_STATUS_REJECTED:
        return translateCurrentApp('commonStatusRejected')
      case V2NIMFriendAddApplicationStatus.V2NIM_FRIEND_ADD_APPLICATION_STATUS_EXPIRED:
        return translateCurrentApp('commonStatusExpired')
      case V2NIMFriendAddApplicationStatus.V2NIM_FRIEND_ADD_APPLICATION_STATUS_DIRECT_ADD:
        return translateCurrentApp('commonStatusDirectAdded')
      default:
        return translateCurrentApp('commonStatusPending')
    }
  }
}

export const friendStore = new FriendStore()
