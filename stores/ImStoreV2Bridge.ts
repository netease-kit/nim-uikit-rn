import IMRootStore, {
  ConnectStore,
  ConversationStore as IMConversationStore,
  LocalConversationStore as IMLocalConversationStore
} from '@xkit-yx/im-store-v2'
import type { LocalOptions } from '@xkit-yx/im-store-v2/dist/types/types'
import { makeAutoObservable, runInAction } from 'mobx'

import { getDisplayErrorMessage } from '@/utils/error-message'
import {
  type V2NIM,
  V2NIMConversationType,
  type V2NIMFriend,
  type V2NIMLocalConversation
} from '@/utils/nim-sdk'

import {
  conversationStore as localConversationStore,
  type ConversationUnreadLike
} from './ConversationStore'

let imStoreV2Patched = false
const CLOUD_CONVERSATION_ID_QUERY_CHUNK_SIZE = 100

type ConnectStoreModule = {
  ConnectStore?: unknown
}

type RNPushEvent = {
  account?: string
  clientType?: number
  ext?: string
  time?: number
  type?: number
  value?: number
}

type ConversationListResult = {
  offset: number
  finished: boolean
  conversationList: Array<{ conversationId?: string }>
}

type ConversationStoreLike = {
  conversations?: Map<string, unknown>
  deleteConversationActive?: (conversationId: string) => Promise<void>
  getConversationListActive?: (offset: number, limit: number) => Promise<ConversationListResult>
  removeConversation?: (conversationIds: string[]) => void
  stickTopConversationActive?: (conversationId: string, stickTop: boolean) => Promise<void>
  updateConversation?: (conversations: any[]) => void
}

type BridgeConversationLike = {
  conversationId?: string
  stickTop?: boolean
  sortOrder?: number
  lastMessage?: { messageRefer?: { createTime?: number } } | null
  unreadCount?: number
  mute?: boolean
  aitMsgs?: unknown[]
}

type TeamStoreLike = {
  getTeam: (teamId: string) => { isValidTeam?: boolean; isTeamEffective?: boolean } | null
}

function getTeamStore(): TeamStoreLike {
  return require('./TeamStore').teamStore as TeamStoreLike
}

function isConversationNotExistError(error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : typeof error === 'object' && error && 'message' in error
          ? String((error as { message?: unknown }).message || '')
          : ''

  return /conversation (does )?not exist/i.test(message)
}

function isResourceAlreadyExistError(error: unknown) {
  const errorLike = error as { code?: unknown; errCode?: unknown; errorCode?: unknown }
  const code = errorLike?.code ?? errorLike?.errCode ?? errorLike?.errorCode
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : typeof error === 'object' && error && 'message' in error
          ? String((error as { message?: unknown }).message || '')
          : ''

  return String(code || '').trim() === '191007' || /resource already exist/i.test(message)
}

function patchConnectStoreModule(moduleLike: ConnectStoreModule | null | undefined) {
  const connectStorePrototype = (moduleLike?.ConnectStore as any)?.prototype

  if (!connectStorePrototype) {
    return
  }

  const originalOnConnectStatus = connectStorePrototype._onConnectStatus
  if (originalOnConnectStatus && !('___rnGuardPatched' in originalOnConnectStatus)) {
    const patchedOnConnectStatus = function patchedOnConnectStatus(this: unknown, status: number) {
      const self = this as {
        rootStore?: {
          subscriptionStore?: {
            resetState?: () => void
          }
        }
      }

      if (status === 1 && typeof self.rootStore?.subscriptionStore?.resetState !== 'function') {
        return
      }

      originalOnConnectStatus.call(this, status)
    }

    Object.defineProperty(patchedOnConnectStatus, '___rnGuardPatched', {
      value: true,
      configurable: false,
      enumerable: false,
      writable: false
    })
    connectStorePrototype._onConnectStatus = patchedOnConnectStatus
  }

  const originalOnDataSync = connectStorePrototype._onDataSync
  if (originalOnDataSync && !('___rnGuardPatched' in originalOnDataSync)) {
    const patchedOnDataSync = function patchedOnDataSync(
      this: unknown,
      type: number,
      state: number,
      error?: unknown
    ) {
      const self = this as {
        rootStore?: {
          userStore?: {
            getMyUserInfoActive?: () => void
          }
          relationStore?: {
            getBlockListActive?: () => void
            getP2PMuteListActive?: () => void
          }
        }
      }

      if (
        typeof self.rootStore?.userStore?.getMyUserInfoActive !== 'function' ||
        typeof self.rootStore?.relationStore?.getBlockListActive !== 'function' ||
        typeof self.rootStore?.relationStore?.getP2PMuteListActive !== 'function'
      ) {
        return
      }

      originalOnDataSync.call(this, type, state, error)
    }

    Object.defineProperty(patchedOnDataSync, '___rnGuardPatched', {
      value: true,
      configurable: false,
      enumerable: false,
      writable: false
    })
    connectStorePrototype._onDataSync = patchedOnDataSync
  }
}

function patchImStoreV2LifecycleGuards() {
  if (imStoreV2Patched) {
    return
  }

  imStoreV2Patched = true

  patchConnectStoreModule({ ConnectStore })
  patchConnectStoreModule(require('@xkit-yx/im-store-v2/dist/index.cjs.js') as any)
  patchConnectStoreModule(require('@xkit-yx/im-store-v2/dist/index.esm.js') as any)
}

function disableImStoreV2DebugLogging(rootStore: IMRootStore | null | undefined) {
  if (!rootStore) {
    return
  }

  const rootStoreLike = rootStore as unknown as {
    logger?: unknown
    localOptions?: { debug?: string }
    [key: string]: unknown
  }

  rootStoreLike.logger = null
  rootStoreLike.localOptions = {
    ...rootStoreLike.localOptions,
    debug: 'off'
  }

  for (const storeKey of [
    'connectStore',
    'friendStore',
    'msgStore',
    'relationStore',
    'teamStore',
    'teamMemberStore',
    'conversationStore',
    'localConversationStore',
    'subscriptionStore',
    'aiUserStore',
    'userStore',
    'uiStore'
  ]) {
    const childStore = rootStoreLike[storeKey] as { logger?: unknown } | null | undefined
    if (childStore && 'logger' in childStore) {
      childStore.logger = null
    }
  }
}

class ImStoreV2Bridge {
  rootStore: IMRootStore | null = null
  bindError: string | null = null
  isLoadingMore = false
  hasMoreConversations = true
  nextConversationOffset = 0
  friendListVersion = 0

  private nim: V2NIM | null = null
  private loadingAIUsersPromise: Promise<void> | null = null
  private cloudConversationDeletedHandler: ((conversationIds: string[]) => void) | null = null
  private confirmedCloudConversationIds = new Set<string>()
  private cloudUnreadReconcilePromise: Promise<void> | null = null
  private cachedFriendMap: Map<string, V2NIMFriend> | null = null
  private cachedFriendSize = -1
  private cachedFriendListVersion = -1
  private cachedFriendList: V2NIMFriend[] = []
  private cachedConversationSource: unknown = null
  private cachedLocalConversationSource: V2NIMLocalConversation[] | null = null
  private cachedConversationSize = -1
  private cachedConfirmedCloudConversationSize = -1
  private cachedPreferCloudConversation = false
  private cachedConversationTotalUnread = -1
  private cachedHiddenConversationVersion = -1
  private cachedDisplayTotalUnread = -1
  private cachedDisplayConversationsInput: BridgeConversationLike[] | null = null
  private cachedConversations: BridgeConversationLike[] = []
  private cachedDisplayConversations: BridgeConversationLike[] = []

  constructor() {
    makeAutoObservable(
      this,
      {
        cachedFriendMap: false,
        cachedFriendSize: false,
        cachedFriendListVersion: false,
        cachedFriendList: false,
        cachedConversationSource: false,
        cachedLocalConversationSource: false,
        cachedConversationSize: false,
        cachedConfirmedCloudConversationSize: false,
        cachedPreferCloudConversation: false,
        cachedConversationTotalUnread: false,
        cachedHiddenConversationVersion: false,
        cachedDisplayTotalUnread: false,
        cachedDisplayConversationsInput: false,
        cachedConversations: false,
        cachedDisplayConversations: false
      } as never,
      { autoBind: true }
    )
  }

  get hasBoundStore() {
    return !!this.rootStore
  }

  get preferCloudConversation() {
    return !!this.rootStore?.sdkOptions?.enableV2CloudConversation
  }

  private getActiveConversationStore(): ConversationStoreLike | null {
    const localConversationStore = this.rootStore?.localConversationStore
    const cloudConversationStore = this.rootStore?.conversationStore

    if (this.preferCloudConversation && cloudConversationStore) {
      return cloudConversationStore
    }

    return localConversationStore || null
  }

  private removeConversationsFromActiveSources(conversationIds: string[]) {
    const validConversationIds = conversationIds.filter(Boolean)

    if (!validConversationIds.length) {
      return
    }

    this.removeConfirmedCloudConversationIds(validConversationIds)
    this.getActiveConversationStore()?.removeConversation?.(validConversationIds)
    validConversationIds.forEach((conversationId) => {
      localConversationStore.removeConversationLocally(conversationId)
    })
  }

  private setConfirmedCloudConversationIds(conversationIds: string[]) {
    this.confirmedCloudConversationIds = new Set(conversationIds.filter(Boolean))
    this.resetConversationCaches()
  }

  private addConfirmedCloudConversationIds(conversationIds: string[]) {
    if (!conversationIds.length) {
      return
    }

    this.confirmedCloudConversationIds = new Set([
      ...this.confirmedCloudConversationIds,
      ...conversationIds.filter(Boolean)
    ])
    this.resetConversationCaches()
  }

  private removeConfirmedCloudConversationIds(conversationIds: string[]) {
    if (!conversationIds.length) {
      return
    }

    const removedConversationIds = new Set(conversationIds)
    this.confirmedCloudConversationIds = new Set(
      Array.from(this.confirmedCloudConversationIds).filter(
        (conversationId) => !removedConversationIds.has(conversationId)
      )
    )
    this.resetConversationCaches()
  }

  private unbindCloudConversationDeletedListener() {
    if (!this.nim || !this.cloudConversationDeletedHandler) {
      this.cloudConversationDeletedHandler = null
      return
    }

    this.nim.V2NIMConversationService?.off?.(
      'onConversationDeleted',
      this.cloudConversationDeletedHandler
    )
    this.cloudConversationDeletedHandler = null
  }

  private bindCloudConversationDeletedListener(nim: V2NIM) {
    this.unbindCloudConversationDeletedListener()

    const handler = (conversationIds: string[]) => {
      if (!this.preferCloudConversation) {
        return
      }

      this.removeConversationsFromActiveSources(conversationIds)
    }

    nim.V2NIMConversationService?.on?.('onConversationDeleted', handler)
    this.cloudConversationDeletedHandler = handler
  }

  private pruneMissingCloudConversationsAfterRefresh(
    refreshedConversationIds: string[],
    limit: number,
    conversationStore: ConversationStoreLike,
    options?: { refreshedPageCoversCurrentMemory?: boolean }
  ) {
    if (!this.preferCloudConversation || !conversationStore.conversations) {
      return
    }

    const refreshedConversationIdSet = new Set(refreshedConversationIds)
    const currentConversationIds = Array.from(conversationStore.conversations.keys())

    if (
      !options?.refreshedPageCoversCurrentMemory &&
      refreshedConversationIds.length < currentConversationIds.length
    ) {
      return
    }

    const staleConversationIds = currentConversationIds.filter(
      (conversationId) => !refreshedConversationIdSet.has(conversationId)
    )

    if (!staleConversationIds.length) {
      return
    }

    this.removeConfirmedCloudConversationIds(staleConversationIds)
    conversationStore.removeConversation?.(staleConversationIds)
    staleConversationIds.forEach((conversationId) => {
      if (!this.getCloudConversationFallback(conversationId)) {
        localConversationStore.removeConversationLocally(conversationId)
      }
    })
  }

  private async getExistingCloudConversationIds(conversationIds: string[]) {
    if (!conversationIds.length || !this.nim?.V2NIMConversationService?.getConversationListByIds) {
      return []
    }

    const conversations: Array<{ conversationId?: string }> = []

    for (
      let index = 0;
      index < conversationIds.length;
      index += CLOUD_CONVERSATION_ID_QUERY_CHUNK_SIZE
    ) {
      const chunk = conversationIds.slice(index, index + CLOUD_CONVERSATION_ID_QUERY_CHUNK_SIZE)
      const chunkConversations =
        await this.nim.V2NIMConversationService.getConversationListByIds(chunk)
      conversations.push(...chunkConversations)
    }

    return conversations
      .map((conversation: { conversationId?: string }) => conversation.conversationId)
      .filter((conversationId): conversationId is string => !!conversationId)
  }

  private async verifyExistingCloudConversation(conversationId: string) {
    if (!conversationId || !this.preferCloudConversation) {
      return false
    }

    const [existingConversationId] = await this.getExistingCloudConversationIds([conversationId])
    const exists = existingConversationId === conversationId

    if (exists) {
      this.addConfirmedCloudConversationIds([conversationId])
    } else {
      this.removeConfirmedCloudConversationIds([conversationId])
    }

    return exists
  }

  private isLoginReady() {
    try {
      return this.nim?.V2NIMLoginService.getLoginStatus() === 1
    } catch {
      return false
    }
  }

  private patchNIMOptions(
    nim: V2NIM,
    enableV2CloudConversation?: boolean
  ): V2NIM & {
    getOptions?: () => Record<string, unknown>
    __im2OriginalGetOptions__?: () => Record<string, unknown>
    V2NIMSubscriptionService?: unknown
  } {
    const patchedNIM = nim as V2NIM & {
      getOptions?: () => Record<string, unknown>
      __im2OriginalGetOptions__?: () => Record<string, unknown>
      V2NIMSubscriptionService?: unknown
      on?: (eventName: 'pushEvents', handler: (events: RNPushEvent[]) => void) => void
    }

    const subscriptionService = (patchedNIM.V2NIMSubscriptionService ?? {}) as unknown as Record<
      string,
      unknown
    >
    const needsSubscriptionPatch =
      typeof subscriptionService.on !== 'function' ||
      typeof subscriptionService.off !== 'function' ||
      typeof subscriptionService.subscribeUserStatus !== 'function'

    if (needsSubscriptionPatch) {
      const statusHandlers = new Set<(userStatusList: unknown[]) => void>()
      const handlePushEvents = (events: RNPushEvent[]) => {
        const userStatusList = events
          .filter((event) => event.account && event.type === 1 && typeof event.value === 'number')
          .map((event) => ({
            accountId: event.account,
            statusType: event.value,
            clientType: event.clientType,
            publishTime: event.time,
            extension: event.ext
          }))

        if (!userStatusList.length) {
          return
        }

        statusHandlers.forEach((handler) => handler(userStatusList))
      }

      patchedNIM.V2NIMSubscriptionService = {
        ...subscriptionService,
        on: (eventName: string, handler: (userStatusList: unknown[]) => void) => {
          if (eventName === 'onUserStatusChanged') {
            statusHandlers.add(handler)
          }
        },
        off: (eventName: string, handler: (userStatusList: unknown[]) => void) => {
          if (eventName === 'onUserStatusChanged') {
            statusHandlers.delete(handler)
          }
        },
        once: () => undefined,
        removeAllListeners: () => statusHandlers.clear(),
        getUserStatus:
          typeof subscriptionService.getUserStatus === 'function'
            ? (accountIds: string[]) =>
                (subscriptionService.getUserStatus as (accountIds: string[]) => Promise<unknown>)(
                  accountIds
                )
            : undefined,
        subscribeUserStatus: async (option?: {
          accountIds?: string[]
          duration?: number
          immediateSync?: boolean
        }) => {
          const accountIds = option?.accountIds || []
          const result = await patchedNIM.event?.subscribeEvent?.({
            type: 1,
            accounts: accountIds,
            subscribeTime: option?.duration,
            sync: option?.immediateSync
          })
          const subscribeResult = (result || {}) as {
            failedAccounts?: unknown[]
            failedAccountIds?: unknown[]
            userStatusList?: unknown[]
            statuses?: unknown[]
            data?: unknown
          }

          return {
            failedAccounts:
              subscribeResult.failedAccounts || subscribeResult.failedAccountIds || [],
            userStatusList: subscribeResult.userStatusList || subscribeResult.statuses || [],
            data: subscribeResult.data
          }
        },
        unsubscribeUserStatus: async (option?: { accountIds?: string[] }) => {
          const result = await patchedNIM.event?.unSubscribeEvents?.({
            type: 1,
            accounts: option?.accountIds || []
          })
          const unsubscribeResult = (result || {}) as {
            failedAccounts?: unknown[]
            failedAccountIds?: unknown[]
          }

          return {
            failedAccounts:
              unsubscribeResult.failedAccounts || unsubscribeResult.failedAccountIds || []
          }
        },
        publishCustomUserStatus: async () => undefined,
        queryUserStatusSubscriptions: async (accountIds?: string[]) => {
          const subscriptions = await patchedNIM.event?.querySubscribeEvents?.({
            type: 1,
            accounts: accountIds
          })

          return (subscriptions || []).map((subscription: any) => ({
            accountId: subscription.to,
            duration: subscription.validTime,
            subscribeTime: subscription.time
          }))
        },
        __im2RNPatchedEmptySubscriptionService: true
      } as any

      patchedNIM.on?.('pushEvents', handlePushEvents)
    }

    if (typeof enableV2CloudConversation === 'undefined') {
      return patchedNIM
    }

    if (!patchedNIM.__im2OriginalGetOptions__) {
      patchedNIM.__im2OriginalGetOptions__ =
        typeof patchedNIM.getOptions === 'function'
          ? patchedNIM.getOptions.bind(patchedNIM)
          : () => ({})
    }

    patchedNIM.getOptions = () => ({
      ...patchedNIM.__im2OriginalGetOptions__?.(),
      enableV2CloudConversation
    })

    return patchedNIM
  }

  bindNIM(
    nim: V2NIM,
    localOptions: Partial<LocalOptions> = {},
    enableV2CloudConversation?: boolean
  ) {
    const currentCloudConversationEnabled =
      this.rootStore?.sdkOptions?.enableV2CloudConversation ?? false
    const requestedCloudConversationEnabled = !!enableV2CloudConversation

    if (
      this.nim === nim &&
      this.rootStore &&
      currentCloudConversationEnabled === requestedCloudConversationEnabled
    ) {
      disableImStoreV2DebugLogging(this.rootStore)
      return this.rootStore
    }

    this.destroy()
    patchImStoreV2LifecycleGuards()

    try {
      const patchedNIM = this.patchNIMOptions(nim, enableV2CloudConversation)
      const rootStore = new IMRootStore(
        patchedNIM as unknown as ConstructorParameters<typeof IMRootStore>[0],
        {
          debug: 'off',
          enableTeam: true,
          needMention: true,
          p2pMsgReceiptVisible: true,
          teamMsgReceiptVisible: true,
          teamManagerVisible: true,
          ...localOptions
        },
        'RN'
      )

      if (
        requestedCloudConversationEnabled &&
        !rootStore.sdkOptions?.enableV2CloudConversation &&
        !rootStore.conversationStore
      ) {
        rootStore.localConversationStore?.destroy()
        rootStore.localConversationStore = null
        rootStore.sdkOptions = {
          ...rootStore.sdkOptions,
          enableV2CloudConversation: true
        }
        rootStore.conversationStore = new IMConversationStore(
          rootStore as unknown as ConstructorParameters<typeof IMConversationStore>[0],
          nim as unknown as ConstructorParameters<typeof IMConversationStore>[1]
        )
      }

      if (
        !requestedCloudConversationEnabled &&
        !rootStore.localConversationStore &&
        rootStore.conversationStore
      ) {
        rootStore.conversationStore.destroy()
        rootStore.conversationStore = null
        rootStore.sdkOptions = {
          ...rootStore.sdkOptions,
          enableV2CloudConversation: false
        }
        rootStore.localConversationStore = new IMLocalConversationStore(
          rootStore as unknown as ConstructorParameters<typeof IMLocalConversationStore>[0],
          nim as unknown as ConstructorParameters<typeof IMLocalConversationStore>[1]
        )
      }

      runInAction(() => {
        this.nim = nim
        this.rootStore = rootStore
        this.bindError = null
        this.isLoadingMore = false
        this.hasMoreConversations = true
        this.nextConversationOffset = 0
        this.setConfirmedCloudConversationIds([])
      })
      disableImStoreV2DebugLogging(rootStore)
      this.bindCloudConversationDeletedListener(nim)

      return rootStore
    } catch (error) {
      runInAction(() => {
        this.bindError = getDisplayErrorMessage(error, 'im-store-v2 bind failed')
      })
      console.warn('[imStoreV2Bridge] bindNIM failed', {
        requestedCloudConversation: requestedCloudConversationEnabled,
        message: error instanceof Error ? error.message : String(error)
      })
      return null
    }
  }

  destroy() {
    this.unbindCloudConversationDeletedListener()
    this.rootStore?.destroy()
    this.rootStore = null
    this.nim = null
    this.loadingAIUsersPromise = null
    this.isLoadingMore = false
    this.hasMoreConversations = true
    this.nextConversationOffset = 0
    this.friendListVersion += 1
    this.cachedFriendMap = null
    this.cachedFriendSize = -1
    this.cachedFriendListVersion = -1
    this.cachedFriendList = []
    this.resetConversationCaches()
    this.setConfirmedCloudConversationIds([])
    this.cloudUnreadReconcilePromise = null
  }

  private resetConversationCaches() {
    this.cachedConversationSource = null
    this.cachedLocalConversationSource = null
    this.cachedConversationSize = -1
    this.cachedConfirmedCloudConversationSize = -1
    this.cachedPreferCloudConversation = false
    this.cachedConversationTotalUnread = -1
    this.cachedDisplayTotalUnread = -1
    this.cachedDisplayConversationsInput = null
    this.cachedConversations = []
    this.cachedDisplayConversations = []
  }

  async ensureAIUsersLoaded() {
    if (this.aiUsers.length > 0) {
      return
    }

    if (this.loadingAIUsersPromise) {
      await this.loadingAIUsersPromise
      return
    }

    this.loadingAIUsersPromise = (async () => {
      try {
        if (this.rootStore?.aiUserStore?.getAIUserListActive) {
          await this.rootStore.aiUserStore.getAIUserListActive()
          if (this.aiUsers.length > 0) {
            return
          }
        }

        const service = this.nim?.V2NIMAIService as {
          getAIUserList?: () => Promise<unknown[]>
        } | null

        if (typeof service?.getAIUserList === 'function') {
          await service.getAIUserList()
        }
      } finally {
        this.loadingAIUsersPromise = null
      }
    })()

    await this.loadingAIUsersPromise
  }

  async refreshConversations(limit = 20) {
    const conversationStore = this.getActiveConversationStore()

    if (!conversationStore?.getConversationListActive || !this.isLoginReady()) {
      return
    }

    await localConversationStore.ensureClearedUnreadWatermarksLoaded()

    const result = await conversationStore.getConversationListActive(0, limit)
    const currentConversationIds = Array.from(conversationStore.conversations?.keys() || [])
    let existingConversationIds: string[] = []
    let didQueryExistingConversationIds = false

    if (this.preferCloudConversation) {
      try {
        existingConversationIds = await this.getExistingCloudConversationIds(currentConversationIds)
        didQueryExistingConversationIds = true
      } catch (error) {
        console.warn('[imStoreV2Bridge] query cloud conversations by ids failed', error)
      }
    }

    const refreshedConversationIds = result.conversationList
      .map((conversation) => conversation.conversationId)
      .filter((conversationId): conversationId is string => !!conversationId)
    this.addConfirmedCloudConversationIds(refreshedConversationIds)
    if (didQueryExistingConversationIds) {
      this.addConfirmedCloudConversationIds(existingConversationIds)
    }
    this.pruneMissingCloudConversationsAfterRefresh(
      didQueryExistingConversationIds ? existingConversationIds : refreshedConversationIds,
      limit,
      conversationStore,
      {
        refreshedPageCoversCurrentMemory:
          didQueryExistingConversationIds ||
          result.finished ||
          refreshedConversationIds.length >= currentConversationIds.length
      }
    )

    runInAction(() => {
      this.nextConversationOffset = result.offset
      this.hasMoreConversations = !result.finished
    })
  }

  async ensureCloudConversation(conversationId: string, options?: { forceCreate?: boolean }) {
    if (!conversationId || !this.preferCloudConversation) {
      return null
    }

    const conversationStore = this.rootStore?.conversationStore as
      | (ConversationStoreLike & {
          createConversationActive?: (conversationId: string) => Promise<unknown>
          conversations?: Map<string, unknown>
        })
      | null
      | undefined

    if (!conversationStore) {
      return null
    }

    const existingConversation = conversationStore.conversations?.get(conversationId)

    if (existingConversation && !options?.forceCreate) {
      return existingConversation
    }

    if (!options?.forceCreate && typeof conversationStore.createConversationActive === 'function') {
      const createdConversation = await conversationStore.createConversationActive(conversationId)
      if (createdConversation || conversationStore.conversations?.get(conversationId)) {
        this.addConfirmedCloudConversationIds([conversationId])
      }
      return createdConversation || conversationStore.conversations?.get(conversationId) || null
    }

    const conversationService = this.nim?.V2NIMConversationService
    const createConversation = conversationService?.createConversation

    if (typeof createConversation === 'function') {
      let createdConversation: unknown = null
      try {
        createdConversation = await createConversation.call(conversationService, conversationId)
      } catch (error) {
        if (!isResourceAlreadyExistError(error)) {
          throw error
        }
      }
      if (createdConversation) {
        conversationStore.updateConversation?.([createdConversation])
      }
      if (createdConversation || conversationStore.conversations?.get(conversationId)) {
        this.addConfirmedCloudConversationIds([conversationId])
      }
      return createdConversation || conversationStore.conversations?.get(conversationId) || null
    }

    return null
  }

  async stickTopActiveConversation(conversationId: string, stickTop: boolean) {
    if (!conversationId) {
      return null
    }

    const conversationStore = this.getActiveConversationStore()

    const cloudConversationStore = this.rootStore?.conversationStore
    const shouldUseCloudConversation = this.preferCloudConversation || !!cloudConversationStore

    if (shouldUseCloudConversation) {
      const ensuredConversation = await this.ensureCloudConversation(conversationId, {
        forceCreate: true
      })
      const existingConversation =
        cloudConversationStore?.conversations.get(conversationId) || ensuredConversation

      if (!existingConversation) {
        throw new Error('cloud conversation not exist')
      }

      try {
        await this.nim?.V2NIMConversationService?.stickTopConversation(conversationId, stickTop)
      } catch (error) {
        if (isConversationNotExistError(error)) {
          this.removeConfirmedCloudConversationIds([conversationId])
          conversationStore?.removeConversation?.([conversationId])
        }

        throw error
      }

      const cloudConversation = cloudConversationStore?.conversations.get(conversationId)
      const updatedConversation = cloudConversation || existingConversation

      if (updatedConversation) {
        conversationStore?.updateConversation?.([{ ...(updatedConversation as object), stickTop }])
      }

      return conversationStore?.conversations?.get(conversationId) || updatedConversation || null
    }

    if (conversationStore?.stickTopConversationActive) {
      await conversationStore.stickTopConversationActive(conversationId, stickTop)
      const conversation = conversationStore.conversations?.get(conversationId)

      if (conversation) {
        conversationStore.updateConversation?.([{ ...(conversation as object), stickTop }])
      }

      return conversationStore.conversations?.get(conversationId) || conversation || null
    }

    return null
  }

  async refreshCurrentConversationSource(limit = 20) {
    if (this.hasBoundStore) {
      await this.refreshConversations(limit)
      return
    }

    await localConversationStore.refreshConversations()
  }

  async loadMoreConversations(limit = 20) {
    const conversationStore = this.getActiveConversationStore()

    if (
      !conversationStore?.getConversationListActive ||
      !this.isLoginReady() ||
      this.isLoadingMore ||
      !this.hasMoreConversations
    ) {
      return
    }

    await localConversationStore.ensureClearedUnreadWatermarksLoaded()

    runInAction(() => {
      this.isLoadingMore = true
    })

    try {
      const result = await conversationStore.getConversationListActive(
        this.nextConversationOffset,
        limit
      )
      const loadedConversationIds = result.conversationList
        .map((conversation) => conversation.conversationId)
        .filter((conversationId): conversationId is string => !!conversationId)

      this.addConfirmedCloudConversationIds(loadedConversationIds)

      runInAction(() => {
        this.nextConversationOffset = result.offset
        this.hasMoreConversations = !result.finished
      })
    } finally {
      runInAction(() => {
        this.isLoadingMore = false
      })
    }
  }

  private shouldReconcileCloudUnreadState() {
    return (
      this.preferCloudConversation &&
      this.isLoginReady() &&
      this.totalUnread > 0 &&
      this.displayTotalUnread === 0 &&
      this.hasMoreConversations
    )
  }

  async reconcileCloudUnreadState(limit = 20) {
    if (!this.shouldReconcileCloudUnreadState()) {
      return
    }

    if (this.cloudUnreadReconcilePromise) {
      await this.cloudUnreadReconcilePromise
      return
    }

    this.cloudUnreadReconcilePromise = (async () => {
      while (this.shouldReconcileCloudUnreadState()) {
        const previousOffset = this.nextConversationOffset
        const previousConversationCount = this.conversations.length

        await this.loadMoreConversations(limit)

        if (
          previousOffset === this.nextConversationOffset &&
          previousConversationCount === this.conversations.length
        ) {
          break
        }
      }
    })()

    try {
      await this.cloudUnreadReconcilePromise
    } finally {
      this.cloudUnreadReconcilePromise = null
    }
  }

  async clearUnread(conversationId: string) {
    const conversationStore = this.getActiveConversationStore() as {
      resetConversation?: (conversationId: string) => Promise<void>
      conversations?: Map<string, ConversationUnreadLike>
      updateConversation?: (conversations: unknown[]) => void
    } | null

    if (!conversationId) {
      return
    }

    const conversation = conversationStore?.conversations?.get(conversationId)
    await localConversationStore.markUnreadCleared(conversationId, conversation)
    localConversationStore.clearMention(conversationId)

    if (conversationStore?.resetConversation) {
      await conversationStore.resetConversation(conversationId)
    }

    const updatedConversation = conversationStore?.conversations?.get(conversationId)

    if (
      updatedConversation &&
      ((updatedConversation.unreadCount || 0) > 0 || updatedConversation.aitMsgs?.length)
    ) {
      conversationStore?.updateConversation?.([
        {
          ...updatedConversation,
          unreadCount: 0,
          aitMsgs: []
        }
      ])
    }
  }

  isInvalidTeamConversation(conversationId: string) {
    const nim = this.nim

    if (!nim) {
      return false
    }

    const conversationType = nim.V2NIMConversationIdUtil.parseConversationType(conversationId)

    if (conversationType !== V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM) {
      return false
    }

    const teamId = nim.V2NIMConversationIdUtil.parseConversationTargetId(conversationId)
    const team = teamId ? getTeamStore().getTeam(teamId) : null

    if (!team) {
      return false
    }

    return team.isValidTeam === false || team.isTeamEffective === false
  }

  shouldExcludeConversation(conversationId: string) {
    return (
      !!conversationId &&
      (localConversationStore.shouldExcludeConversation(conversationId) ||
        this.isInvalidTeamConversation(conversationId) ||
        localConversationStore.isInvalidTeamConversation(conversationId))
    )
  }

  removeConversationLocally(conversationId: string) {
    const conversationStore = this.getActiveConversationStore() as {
      removeConversation?: (conversationIds: string[]) => void
    } | null

    conversationStore?.removeConversation?.([conversationId])
    localConversationStore.removeConversationLocally(conversationId)
  }

  removeTeamConversationLocally(conversationId: string) {
    const conversationStore = this.getActiveConversationStore() as {
      removeConversation?: (conversationIds: string[]) => void
    } | null

    conversationStore?.removeConversation?.([conversationId])
    localConversationStore.removeTeamConversationLocally(conversationId)
  }

  async deleteActiveConversation(conversationId: string) {
    if (!conversationId) {
      return
    }

    const conversationStore = this.getActiveConversationStore()

    if (conversationStore?.deleteConversationActive) {
      await conversationStore.deleteConversationActive(conversationId)
    }

    conversationStore?.removeConversation?.([conversationId])
    localConversationStore.removeConversationLocally(conversationId)
  }

  applyFriendAdded(friend: V2NIMFriend) {
    if (!friend?.accountId) {
      return
    }

    this.rootStore?.friendStore.addFriend?.([friend as never])
    runInAction(() => {
      this.friendListVersion += 1
    })
  }

  applyFriendDeleted(accountId: string) {
    if (!accountId) {
      return
    }

    this.rootStore?.friendStore.removeFriend?.([accountId])
    runInAction(() => {
      this.friendListVersion += 1
    })
  }

  applyFriendInfoChanged(friend: V2NIMFriend) {
    this.applyFriendAdded(friend)
  }

  pruneInvalidTeamConversations() {
    const invalidConversationIds = this.conversations
      .map((conversation) => (conversation as { conversationId?: string }).conversationId || '')
      .filter((conversationId) => this.shouldExcludeConversation(conversationId))

    if (!invalidConversationIds.length) {
      return
    }

    const conversationStore = this.getActiveConversationStore() as {
      removeConversation?: (conversationIds: string[]) => void
    } | null

    conversationStore?.removeConversation?.(invalidConversationIds)
  }

  get displayConversations() {
    const conversations = this.conversations as BridgeConversationLike[]

    if (
      this.cachedDisplayConversationsInput === conversations &&
      this.cachedDisplayTotalUnread === this.totalUnread
    ) {
      return this.cachedDisplayConversations
    }

    const filteredConversations = conversations.filter((conversation) => {
      const conversationId = (conversation as { conversationId?: string }).conversationId || ''

      return (
        !conversationId ||
        (!this.shouldExcludeConversation(conversationId) &&
          !localConversationStore.isConversationLocallyHidden(conversationId))
      )
    })

    this.cachedDisplayConversationsInput = conversations
    this.cachedDisplayTotalUnread = this.totalUnread
    this.cachedDisplayConversations = filteredConversations.map((conversation) =>
      this.normalizeDisplayUnread(conversation as ConversationUnreadLike)
    )
    return this.cachedDisplayConversations
  }

  private normalizeDisplayUnread<T extends ConversationUnreadLike>(conversation: T): T {
    if (
      this.preferCloudConversation &&
      this.totalUnread <= 0 &&
      ((conversation.unreadCount || 0) > 0 || conversation.aitMsgs?.length)
    ) {
      return {
        ...conversation,
        unreadCount: 0,
        aitMsgs: []
      }
    }

    return localConversationStore.suppressClearedUnread(conversation)
  }

  private getUnreadTotal(
    conversations: Array<{ unreadCount?: number; mute?: boolean }>,
    options?: { excludeMuted?: boolean }
  ) {
    return conversations.reduce((sum, conversation) => {
      if (options?.excludeMuted && conversation.mute) {
        return sum
      }

      return sum + (conversation.unreadCount || 0)
    }, 0)
  }

  get displayTotalUnread() {
    return this.getUnreadTotal(this.displayConversations as Array<{ unreadCount?: number }>)
  }

  get displayAlertUnread() {
    return this.getUnreadTotal(
      this.displayConversations as Array<{ unreadCount?: number; mute?: boolean }>,
      {
        excludeMuted: true
      }
    )
  }

  getConversation(conversationId: string) {
    if (!conversationId) {
      return null
    }

    if (this.preferCloudConversation) {
      const conversation = this.rootStore?.conversationStore?.conversations.get(conversationId)
      const fallbackConversation = this.getCloudConversationFallback(conversationId)

      return conversation
        ? localConversationStore.isConversationLocallyHidden(conversationId)
          ? null
          : this.normalizeDisplayUnread(conversation as ConversationUnreadLike)
        : fallbackConversation
    }

    const conversation =
      this.rootStore?.localConversationStore?.conversations.get(conversationId) ||
      localConversationStore.getConversation(conversationId)

    return conversation ? localConversationStore.suppressClearedUnread(conversation as any) : null
  }

  get conversations() {
    const preferCloudConversation = this.preferCloudConversation
    const imLocalConversationStore = this.rootStore?.localConversationStore
    const imCloudConversationStore = this.rootStore?.conversationStore
    const conversationSource = preferCloudConversation
      ? imCloudConversationStore?.conversations
      : imLocalConversationStore?.conversations
    const conversationSize = conversationSource?.size ?? 0

    if (
      this.cachedConversationSource === conversationSource &&
      this.cachedLocalConversationSource === localConversationStore.conversations &&
      this.cachedConversationSize === conversationSize &&
      this.cachedConfirmedCloudConversationSize === this.confirmedCloudConversationIds.size &&
      this.cachedPreferCloudConversation === preferCloudConversation &&
      this.cachedConversationTotalUnread === this.totalUnread &&
      this.cachedHiddenConversationVersion ===
        localConversationStore.locallyHiddenConversationVersion
    ) {
      return this.cachedConversations
    }

    this.cachedConversationSource = conversationSource
    this.cachedLocalConversationSource = localConversationStore.conversations
    this.cachedConversationSize = conversationSize
    this.cachedConfirmedCloudConversationSize = this.confirmedCloudConversationIds.size
    this.cachedPreferCloudConversation = preferCloudConversation
    this.cachedConversationTotalUnread = this.totalUnread
    this.cachedHiddenConversationVersion = localConversationStore.locallyHiddenConversationVersion

    if (preferCloudConversation && imCloudConversationStore) {
      const mergedConversations = new Map<string, BridgeConversationLike>()

      imCloudConversationStore.conversations.forEach((conversation, conversationId) => {
        if (localConversationStore.isConversationLocallyHidden(conversationId)) {
          return
        }

        mergedConversations.set(
          conversationId,
          this.normalizeDisplayUnread(conversation as ConversationUnreadLike)
        )
      })

      localConversationStore.conversations.forEach((conversation) => {
        if (mergedConversations.has(conversation.conversationId)) {
          return
        }

        const fallbackConversation = this.getCloudConversationFallback(conversation.conversationId)

        if (fallbackConversation) {
          mergedConversations.set(conversation.conversationId, fallbackConversation)
        }
      })

      this.cachedConversations = this.sortConversations(Array.from(mergedConversations.values()))
      return this.cachedConversations
    }

    if (imLocalConversationStore) {
      this.cachedConversations = this.sortConversations(
        Array.from(imLocalConversationStore.conversations.values())
          .filter(
            (conversation) =>
              !localConversationStore.isConversationLocallyHidden(
                (conversation as { conversationId?: string }).conversationId || ''
              )
          )
          .map((conversation) =>
            localConversationStore.suppressClearedUnread(conversation as ConversationUnreadLike)
          )
      )
      return this.cachedConversations
    }

    this.cachedConversations = []
    return this.cachedConversations
  }

  private sortConversations<
    T extends { stickTop?: boolean; sortOrder?: number; lastMessage?: any }
  >(conversations: T[]) {
    return conversations.slice().sort((left, right) => {
      if (!!left.stickTop !== !!right.stickTop) {
        return left.stickTop ? -1 : 1
      }

      const leftTime = left.sortOrder || left.lastMessage?.messageRefer?.createTime || 0
      const rightTime = right.sortOrder || right.lastMessage?.messageRefer?.createTime || 0

      return rightTime - leftTime
    })
  }

  private getCloudConversationFallback(conversationId: string) {
    if (!conversationId || !this.preferCloudConversation) {
      return null
    }

    if (localConversationStore.isConversationLocallyHidden(conversationId)) {
      return null
    }

    if (this.shouldExcludeConversation(conversationId)) {
      return null
    }

    const localConversation = localConversationStore.getConversation(conversationId)

    if (!localConversation) {
      return null
    }

    const hasDisplayMetadata = !!(localConversation.name || localConversation.avatar)
    const hasPreview =
      !!localConversation.lastMessage ||
      !!localConversation.sortOrder ||
      !!localConversation.updateTime

    if (!hasDisplayMetadata && !hasPreview) {
      return null
    }

    return localConversationStore.suppressClearedUnread({
      ...localConversation,
      stickTop: false
    } as ConversationUnreadLike)
  }

  get totalUnread() {
    if (this.preferCloudConversation) {
      return this.rootStore?.conversationStore?.totalUnreadCount || 0
    }

    return this.rootStore?.localConversationStore?.totalUnreadCount || 0
  }

  get messageTabUnreadTotal() {
    if (!this.preferCloudConversation) {
      return this.totalUnread
    }

    if (this.totalUnread <= 0) {
      return 0
    }

    if (this.displayTotalUnread > 0) {
      return this.displayTotalUnread
    }

    return this.hasMoreConversations ? this.totalUnread : 0
  }

  get friends() {
    const friends = this.rootStore?.friendStore.friends as Map<string, V2NIMFriend> | undefined

    if (!friends) {
      return []
    }

    if (
      this.cachedFriendMap === friends &&
      this.cachedFriendSize === friends.size &&
      this.cachedFriendListVersion === this.friendListVersion
    ) {
      return this.cachedFriendList
    }

    this.cachedFriendMap = friends
    this.cachedFriendSize = friends.size
    this.cachedFriendListVersion = this.friendListVersion
    this.cachedFriendList = Array.from(friends.values())
    return this.cachedFriendList
  }

  get teams() {
    return this.rootStore?.uiStore.teamList || []
  }

  get users() {
    return this.rootStore?.uiStore.users || []
  }

  get aiUsers() {
    return this.rootStore?.aiUserStore.getAIUserList() || []
  }
}

export const imStoreV2Bridge = new ImStoreV2Bridge()
