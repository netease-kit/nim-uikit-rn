import { makeAutoObservable, runInAction } from 'mobx'

import { NIMConfig } from '@/constants/NIMConfig'
import { hasMentionForAccount } from '@/utils/mention'
import {
  V2NIMConversationType,
  V2NIMLocalConversation,
  V2NIMMessage,
  V2NIMP2PMessageMuteMode,
  V2NIMTeamMessageMuteMode
} from '@/utils/nim-sdk'
import { storage } from '@/utils/storage'

import { nimStore } from './NIMStore'
import { teamStore } from './TeamStore'

type ClearedUnreadWatermarkMap = Record<string, Record<string, number>>
type HiddenConversationIdMap = Record<string, string[]>

type MessageStoreLike = {
  revokedMessageMap: Record<string, Record<string, unknown>>
  getConversationMessages: (conversationId: string) => { list: V2NIMMessage[] }
}

export type ConversationUnreadLike = {
  conversationId?: string
  unreadCount?: number
  sortOrder?: number
  updateTime?: number
  lastMessage?: {
    messageRefer?: {
      createTime?: number
    }
    createTime?: number
  } | null
  aitMsgs?: unknown[]
}

class ConversationStore {
  conversations: V2NIMLocalConversation[] = []
  totalUnread = 0
  isLoading = false
  isLoadingMore = false
  hasMore = true
  nextOffset = 0
  mentionedMessageIdsByConversation: Record<string, string[]> = {}
  teamExitInProgressConversationIds = new Set<string>()
  locallyHiddenConversationIds = new Set<string>()
  locallyHiddenConversationVersion = 0
  excludedTeamConversationIds = new Set<string>()

  private readonly pageSize = 50
  private clearedUnreadWatermarks: ClearedUnreadWatermarkMap = {}
  private clearedUnreadWatermarksLoadPromise: Promise<void> | null = null
  private hasLoadedClearedUnreadWatermarks = false
  private hiddenConversationIdsLoadPromise: Promise<void> | null = null
  private hasLoadedHiddenConversationIds = false

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true })
  }

  private getMessageStore(): MessageStoreLike {
    return require('./MessageStore').messageStore as MessageStoreLike
  }

  resetState() {
    runInAction(() => {
      this.conversations = []
      this.totalUnread = 0
      this.isLoading = false
      this.isLoadingMore = false
      this.hasMore = true
      this.nextOffset = 0
      this.mentionedMessageIdsByConversation = {}
      this.teamExitInProgressConversationIds.clear()
      this.locallyHiddenConversationIds.clear()
      this.locallyHiddenConversationVersion += 1
      this.excludedTeamConversationIds.clear()
      this.hasLoadedHiddenConversationIds = false
      this.hiddenConversationIdsLoadPromise = null
    })
  }

  private getActiveAccountId() {
    return nimStore.getLoginUser() || ''
  }

  async ensureClearedUnreadWatermarksLoaded() {
    if (this.hasLoadedClearedUnreadWatermarks) {
      return
    }

    if (this.clearedUnreadWatermarksLoadPromise) {
      await this.clearedUnreadWatermarksLoadPromise
      return
    }

    this.clearedUnreadWatermarksLoadPromise = (async () => {
      const saved = await storage.getJson<ClearedUnreadWatermarkMap>(
        NIMConfig.storageKeys.conversationClearedUnreadWatermarks
      )

      runInAction(() => {
        if (saved && typeof saved === 'object') {
          this.clearedUnreadWatermarks = saved
        }

        this.hasLoadedClearedUnreadWatermarks = true
        this.applyClearedUnreadWatermarksToCurrentConversations()
      })
    })()

    try {
      await this.clearedUnreadWatermarksLoadPromise
    } finally {
      this.clearedUnreadWatermarksLoadPromise = null
    }
  }

  private persistClearedUnreadWatermarks() {
    storage
      .setJson(
        NIMConfig.storageKeys.conversationClearedUnreadWatermarks,
        this.clearedUnreadWatermarks
      )
      .catch((error) => {
        console.warn('[conversationStore] persist cleared unread watermarks failed', error)
      })
  }

  private getHiddenConversationStorageKey() {
    return `${NIMConfig.storageKeys.conversationHiddenIds}.${this.getActiveAccountId()}`
  }

  async ensureHiddenConversationIdsLoaded() {
    if (this.hasLoadedHiddenConversationIds) {
      return
    }

    if (this.hiddenConversationIdsLoadPromise) {
      await this.hiddenConversationIdsLoadPromise
      return
    }

    this.hiddenConversationIdsLoadPromise = (async () => {
      const accountId = this.getActiveAccountId()

      if (!accountId) {
        return
      }

      const saved = await storage.getJson<string[] | HiddenConversationIdMap>(
        this.getHiddenConversationStorageKey()
      )

      runInAction(() => {
        if (Array.isArray(saved)) {
          this.locallyHiddenConversationIds = new Set(saved.filter(Boolean))
        } else if (saved && typeof saved === 'object') {
          this.locallyHiddenConversationIds = new Set((saved[accountId] || []).filter(Boolean))
        }

        this.hasLoadedHiddenConversationIds = true
        this.locallyHiddenConversationVersion += 1
      })
    })()

    try {
      await this.hiddenConversationIdsLoadPromise
    } finally {
      this.hiddenConversationIdsLoadPromise = null
    }
  }

  private persistHiddenConversationIds() {
    const accountId = this.getActiveAccountId()

    if (!accountId) {
      return
    }

    storage
      .setJson(
        this.getHiddenConversationStorageKey(),
        Array.from(this.locallyHiddenConversationIds)
      )
      .catch((error) => {
        console.warn('[conversationStore] persist hidden conversations failed', error)
      })
  }

  private hideConversationLocally(conversationId: string) {
    if (!conversationId) {
      return
    }

    this.locallyHiddenConversationIds.add(conversationId)
    this.locallyHiddenConversationVersion += 1
    this.persistHiddenConversationIds()
  }

  private restoreConversationLocally(conversationId: string) {
    if (!conversationId || !this.locallyHiddenConversationIds.delete(conversationId)) {
      return
    }

    this.locallyHiddenConversationVersion += 1
    this.persistHiddenConversationIds()
  }

  private getConversationActivityTime(conversation: ConversationUnreadLike | null | undefined) {
    return (
      conversation?.lastMessage?.messageRefer?.createTime ||
      conversation?.lastMessage?.createTime ||
      conversation?.sortOrder ||
      conversation?.updateTime ||
      0
    )
  }

  private getLatestCachedMessageTime(conversationId: string) {
    const messageStore = this.getMessageStore()
    const messages = messageStore.getConversationMessages(conversationId).list
    const latestMessage = messages[messages.length - 1]
    const latestMessageWithRefer = latestMessage as
      | (V2NIMMessage & { messageRefer?: { createTime?: number } })
      | undefined

    return latestMessageWithRefer?.messageRefer?.createTime || latestMessage?.createTime || 0
  }

  private getClearUnreadWatermark(conversationId: string) {
    const accountId = this.getActiveAccountId()

    if (!accountId || !conversationId) {
      return 0
    }

    return this.clearedUnreadWatermarks[accountId]?.[conversationId] || 0
  }

  private setClearUnreadWatermark(conversationId: string, watermark: number) {
    const accountId = this.getActiveAccountId()

    if (!accountId || !conversationId) {
      return
    }

    const accountWatermarks = {
      ...(this.clearedUnreadWatermarks[accountId] || {}),
      [conversationId]: Math.max(watermark, this.getClearUnreadWatermark(conversationId))
    }

    this.clearedUnreadWatermarks = {
      ...this.clearedUnreadWatermarks,
      [accountId]: accountWatermarks
    }
    this.persistClearedUnreadWatermarks()
  }

  private getUnreadCountAfterWatermark(conversationId: string, watermark: number) {
    const messageStore = this.getMessageStore()
    const messages = messageStore.getConversationMessages(conversationId).list

    if (!messages.length) {
      return null
    }

    return messages.filter((message) => {
      const messageWithRefer = message as V2NIMMessage & {
        messageRefer?: { createTime?: number }
      }
      const createTime = messageWithRefer.messageRefer?.createTime || message.createTime || 0
      const messageKey = this.getMessageKey(message)
      return (
        createTime > watermark &&
        message.senderId !== this.getActiveAccountId() &&
        !this.isRevokedMessageKey(conversationId, messageKey)
      )
    }).length
  }

  suppressClearedUnread<T extends ConversationUnreadLike>(conversation: T): T {
    const conversationId = conversation.conversationId
    const unreadCount = conversation.unreadCount || 0

    if (!conversationId || unreadCount <= 0) {
      return conversation
    }

    const watermark = this.getClearUnreadWatermark(conversationId)

    if (!watermark) {
      return conversation
    }

    const activityTime = Math.max(
      this.getConversationActivityTime(conversation),
      this.getLatestCachedMessageTime(conversationId)
    )

    if (activityTime <= watermark) {
      return {
        ...conversation,
        unreadCount: 0,
        aitMsgs: []
      }
    }

    const unreadAfterWatermark = this.getUnreadCountAfterWatermark(conversationId, watermark)

    if (unreadAfterWatermark !== null && unreadAfterWatermark < unreadCount) {
      return {
        ...conversation,
        unreadCount: unreadAfterWatermark,
        aitMsgs: unreadAfterWatermark > 0 ? conversation.aitMsgs : []
      }
    }

    return conversation
  }

  private applyClearedUnreadWatermarksToCurrentConversations() {
    this.conversations = this.conversations.map((conversation) =>
      this.suppressClearedUnread(conversation)
    )
    this.conversations.forEach((conversation) => {
      const unreadCount = conversation.unreadCount || 0
      this.syncConversationAitWithUnread(conversation.conversationId, unreadCount)
      this.syncMentionStateWithUnread(conversation.conversationId, unreadCount)
    })
    this.recalculateSummary()
  }

  async markUnreadCleared(conversationId: string, conversation?: ConversationUnreadLike | null) {
    if (!conversationId) {
      return
    }

    await this.ensureClearedUnreadWatermarksLoaded()

    runInAction(() => {
      const sourceConversation = conversation || this.getConversation(conversationId)
      const watermark =
        Math.max(
          this.getConversationActivityTime(sourceConversation),
          this.getLatestCachedMessageTime(conversationId)
        ) || Date.now()

      this.setClearUnreadWatermark(conversationId, watermark)
      const current = this.getConversation(conversationId)

      if (current) {
        current.unreadCount = 0
        const mentionAwareConversation = current as V2NIMLocalConversation & { aitMsgs?: unknown[] }
        mentionAwareConversation.aitMsgs = []
      }

      delete this.mentionedMessageIdsByConversation[conversationId]
      this.recalculateSummary()
    })
  }

  private decorateConversation(conversation: V2NIMLocalConversation) {
    return this.suppressClearedUnread({
      ...conversation,
      avatar: conversation.avatar || this.getConversation(conversation.conversationId)?.avatar || ''
    })
  }

  private recalculateSummary() {
    this.totalUnread = this.conversations.reduce((sum, item) => sum + (item.unreadCount || 0), 0)
  }

  get displayAlertUnread() {
    return this.conversations.reduce((sum, item) => {
      if (item.mute) {
        return sum
      }

      return sum + (item.unreadCount || 0)
    }, 0)
  }

  private getMessageKey(message: Pick<V2NIMMessage, 'messageClientId' | 'messageServerId'>) {
    return message.messageClientId || message.messageServerId
  }

  private getMessageReferKeys(message: { messageClientId?: string; messageServerId?: string }) {
    return [message.messageClientId, message.messageServerId].filter((key): key is string => !!key)
  }

  private isRevokedMessageKey(conversationId: string, messageKey?: string | null) {
    const messageStore = this.getMessageStore()
    return !!messageKey && !!messageStore.revokedMessageMap[conversationId]?.[messageKey]
  }

  private getUnreadMentionMessageKeys(conversationId: string, unreadCount: number) {
    if (unreadCount <= 0) {
      return []
    }

    const accountId = nimStore.getLoginUser()

    if (!accountId) {
      return []
    }

    const unreadMessages = this.getUnreadMessageWindow(conversationId, unreadCount)

    if (!unreadMessages.length) {
      return []
    }

    return unreadMessages
      .filter((message) => hasMentionForAccount(message, accountId))
      .map((message) => this.getMessageKey(message))
      .filter((key): key is string => !!key)
  }

  private syncMentionStateWithUnread(conversationId: string, unreadCount: number) {
    const unreadMentionKeys = this.getUnreadMentionMessageKeys(conversationId, unreadCount)

    if (!unreadMentionKeys.length) {
      delete this.mentionedMessageIdsByConversation[conversationId]
      return
    }

    this.mentionedMessageIdsByConversation[conversationId] = unreadMentionKeys
  }

  private getConversationAitMessageKeys(conversationId: string) {
    const conversation = this.getConversation(conversationId) as
      | (V2NIMLocalConversation & {
          aitMsgs?: string[]
        })
      | null

    return (
      conversation?.aitMsgs?.filter(
        (key): key is string => !!key && !this.isRevokedMessageKey(conversationId, key)
      ) || []
    )
  }

  private getUnreadAitMessageKeys(conversationId: string, unreadCount: number) {
    if (unreadCount <= 0) {
      return []
    }

    const aitMessageKeys = new Set(this.getConversationAitMessageKeys(conversationId))
    const unreadMessages = this.getUnreadMessageWindow(conversationId, unreadCount)

    if (!unreadMessages.length || aitMessageKeys.size === 0) {
      return []
    }

    return unreadMessages
      .map((message) => this.getMessageKey(message))
      .filter(
        (key): key is string =>
          !!key && aitMessageKeys.has(key) && !this.isRevokedMessageKey(conversationId, key)
      )
  }

  private getUnreadMessageWindow(conversationId: string, unreadCount: number) {
    if (unreadCount <= 0) {
      return []
    }

    const messages = this.getMessageStore().getConversationMessages(conversationId).list
    const unreadMessages: V2NIMMessage[] = []
    const activeAccountId = this.getActiveAccountId()

    for (let index = messages.length - 1; index >= 0; index -= 1) {
      const message = messages[index]
      const messageKey = this.getMessageKey(message)

      if (
        !messageKey ||
        this.isRevokedMessageKey(conversationId, messageKey) ||
        message.senderId === activeAccountId
      ) {
        continue
      }

      unreadMessages.unshift(message)

      if (unreadMessages.length >= unreadCount) {
        break
      }
    }

    return unreadMessages
  }

  private syncConversationAitWithUnread(conversationId: string, unreadCount: number) {
    const conversation = this.getConversation(conversationId) as
      | (V2NIMLocalConversation & {
          aitMsgs?: string[]
        })
      | null

    if (!conversation?.aitMsgs?.length) {
      return
    }

    const unreadAitKeys = this.getUnreadAitMessageKeys(conversationId, unreadCount)

    if (
      unreadAitKeys.length === conversation.aitMsgs.length &&
      unreadAitKeys.every((key, index) => key === conversation.aitMsgs?.[index])
    ) {
      return
    }

    conversation.aitMsgs = unreadAitKeys
  }

  private mergeConversations(incoming: V2NIMLocalConversation[], append: boolean) {
    const merged = new Map<string, V2NIMLocalConversation>()

    if (append) {
      this.conversations.forEach((conversation) => {
        merged.set(conversation.conversationId, conversation)
      })
    }

    incoming.forEach((conversation) => {
      if (
        this.shouldExcludeConversation(conversation.conversationId) ||
        this.locallyHiddenConversationIds.has(conversation.conversationId)
      ) {
        return
      }

      merged.set(conversation.conversationId, this.decorateConversation(conversation))
    })

    this.conversations = this.sortConversations(Array.from(merged.values()))
    this.recalculateSummary()
  }

  private sortConversations(conversations: V2NIMLocalConversation[]) {
    return conversations.slice().sort((left, right) => {
      if (!!left.stickTop !== !!right.stickTop) {
        return left.stickTop ? -1 : 1
      }

      const leftTime = left.sortOrder || left.lastMessage?.messageRefer?.createTime || 0
      const rightTime = right.sortOrder || right.lastMessage?.messageRefer?.createTime || 0

      return rightTime - leftTime
    })
  }

  // 同步会话列表
  syncConversations = (conversations: V2NIMLocalConversation[], append = false) => {
    runInAction(() => {
      this.mergeConversations(conversations, append)
    })
  }

  private canQueryConversations() {
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

  async refreshConversations() {
    if (!this.canQueryConversations()) {
      return
    }

    await Promise.all([
      this.ensureClearedUnreadWatermarksLoaded(),
      this.ensureHiddenConversationIdsLoaded()
    ])

    const nim = nimStore.nim

    if (!nim) {
      return
    }

    runInAction(() => {
      this.isLoading = true
    })

    try {
      const result = await nim.V2NIMLocalConversationService.getConversationList(0, this.pageSize)

      runInAction(() => {
        this.nextOffset = result.offset
        this.hasMore = !result.finished
      })

      this.syncConversations(result.conversationList, false)
    } catch (error) {
      if (error instanceof Error && error.message.toLowerCase().includes('illegal state')) {
        return
      }

      throw error
    } finally {
      runInAction(() => {
        this.isLoading = false
      })
    }
  }

  async loadMoreConversations() {
    if (!this.canQueryConversations() || this.isLoading || this.isLoadingMore || !this.hasMore) {
      return
    }

    await Promise.all([
      this.ensureClearedUnreadWatermarksLoaded(),
      this.ensureHiddenConversationIdsLoaded()
    ])

    const nim = nimStore.nim

    if (!nim) {
      return
    }

    runInAction(() => {
      this.isLoadingMore = true
    })

    try {
      const result = await nim.V2NIMLocalConversationService.getConversationList(
        this.nextOffset,
        this.pageSize
      )

      runInAction(() => {
        this.nextOffset = result.offset
        this.hasMore = !result.finished
      })

      this.syncConversations(result.conversationList, true)
    } catch (error) {
      if (error instanceof Error && error.message.toLowerCase().includes('illegal state')) {
        return
      }

      throw error
    } finally {
      runInAction(() => {
        this.isLoadingMore = false
      })
    }
  }

  // 添加会话
  addConversation = (conversation: V2NIMLocalConversation) => {
    runInAction(() => {
      this.excludedTeamConversationIds.delete(conversation.conversationId)
      this.restoreConversationLocally(conversation.conversationId)
      this.mergeConversations([conversation], true)
    })
  }

  async createConversation(conversationId: string) {
    if (!nimStore.nim) {
      return null
    }

    const conversation =
      await nimStore.nim.V2NIMLocalConversationService.createConversation(conversationId)
    this.addConversation(conversation)
    return conversation
  }

  // 更新会话
  updateConversation = (id: string, updates: Partial<V2NIMLocalConversation>) => {
    runInAction(() => {
      if (this.shouldExcludeConversation(id)) {
        this.conversations = this.conversations.filter((conv) => conv.conversationId !== id)
        delete this.mentionedMessageIdsByConversation[id]
        this.recalculateSummary()
        return
      }

      const index = this.conversations.findIndex((conv) => conv.conversationId === id)
      if (index !== -1) {
        this.conversations[index] = this.decorateConversation({
          ...this.conversations[index],
          ...updates
        } as V2NIMLocalConversation)
      } else {
        this.conversations.push(
          this.decorateConversation({
            ...(updates as V2NIMLocalConversation),
            conversationId: id
          })
        )
      }

      const unreadCount = this.getConversation(id)?.unreadCount || 0
      this.syncConversationAitWithUnread(id, unreadCount)
      this.syncMentionStateWithUnread(id, unreadCount)
      this.conversations = this.sortConversations(this.conversations)
      this.recalculateSummary()
    })
  }

  upsertTeamPlaceholderConversation(
    conversationId: string,
    team: { teamId?: string; name?: string; avatar?: string }
  ) {
    this.restoreTeamConversation(conversationId)

    const conversationType =
      nimStore.nim?.V2NIMConversationIdUtil.parseConversationType(conversationId) ||
      V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM

    this.updateConversation(conversationId, {
      type: conversationType,
      name: team.name || team.teamId || '',
      avatar: team.avatar || '',
      stickTop: false,
      updateTime: Date.now()
    } as never)
  }

  handleConversationWithMentions(messages: V2NIMMessage[], activeConversationId?: string | null) {
    const accountId = nimStore.getLoginUser()

    if (!accountId) {
      return
    }

    runInAction(() => {
      messages.forEach((message) => {
        if (
          !message.conversationId ||
          message.conversationId === activeConversationId ||
          !hasMentionForAccount(message, accountId)
        ) {
          return
        }

        const messageKey = this.getMessageKey(message)

        if (!messageKey) {
          return
        }

        const current = this.mentionedMessageIdsByConversation[message.conversationId] || []

        if (!current.includes(messageKey)) {
          this.mentionedMessageIdsByConversation[message.conversationId] = [...current, messageKey]
        }
      })
    })
  }

  restoreConversationsForReceivedMessages(messages: V2NIMMessage[]) {
    const conversationIds = Array.from(
      new Set(messages.map((message) => message.conversationId).filter(Boolean))
    )

    if (!conversationIds.length) {
      return
    }

    runInAction(() => {
      conversationIds.forEach((conversationId) => {
        if (this.shouldExcludeConversation(conversationId)) {
          return
        }

        this.restoreConversationLocally(conversationId)
      })
    })
  }

  async toggleStickTop(conversationId: string, stickTop: boolean) {
    if (!nimStore.nim) {
      return
    }

    await nimStore.nim.V2NIMLocalConversationService.stickTopConversation(conversationId, stickTop)
    await this.refreshConversations()
  }

  async toggleMute(conversationId: string, mute: boolean) {
    if (!nimStore.nim) {
      return
    }

    const conversationType =
      nimStore.nim.V2NIMConversationIdUtil.parseConversationType(conversationId)
    const targetId = nimStore.nim.V2NIMConversationIdUtil.parseConversationTargetId(conversationId)

    if (conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P) {
      await nimStore.nim.V2NIMSettingService.setP2PMessageMuteMode(
        targetId,
        mute
          ? V2NIMP2PMessageMuteMode.V2NIM_P2P_MESSAGE_MUTE_MODE_ON
          : V2NIMP2PMessageMuteMode.V2NIM_P2P_MESSAGE_MUTE_MODE_OFF
      )
    } else if (conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM) {
      await nimStore.nim.V2NIMSettingService.setTeamMessageMuteMode(
        targetId,
        teamStore.getTeamType(targetId),
        mute
          ? V2NIMTeamMessageMuteMode.V2NIM_TEAM_MESSAGE_MUTE_MODE_ON
          : V2NIMTeamMessageMuteMode.V2NIM_TEAM_MESSAGE_MUTE_MODE_OFF
      )
    }

    await this.refreshConversations()
  }

  // 删除会话
  deleteConversation = async (id: string, clearMessage = false) => {
    if (nimStore.nim) {
      await nimStore.nim.V2NIMLocalConversationService.deleteConversation(id, clearMessage)
    }

    runInAction(() => {
      this.hideConversationLocally(id)
      this.conversations = this.conversations.filter((conv) => conv.conversationId !== id)
      delete this.mentionedMessageIdsByConversation[id]
      this.recalculateSummary()
    })
  }

  // 清除未读消息
  clearUnread = async (conversationId: string) => {
    await this.ensureClearedUnreadWatermarksLoaded()

    if (nimStore.nim) {
      await nimStore.nim.V2NIMLocalConversationService.clearUnreadCountByIds([conversationId])
    }

    await this.markUnreadCleared(conversationId)
  }

  getConversation(conversationId: string) {
    return this.conversations.find((item) => item.conversationId === conversationId) || null
  }

  isInvalidTeamConversation(conversationId: string) {
    const nim = nimStore.nim

    if (!nim) {
      return false
    }

    const conversationType = nim.V2NIMConversationIdUtil.parseConversationType(conversationId)

    if (conversationType !== V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM) {
      return false
    }

    const teamId = nim.V2NIMConversationIdUtil.parseConversationTargetId(conversationId)
    const team = teamId ? teamStore.getTeam(teamId) : null

    if (!team) {
      return false
    }

    return team.isValidTeam === false || team.isTeamEffective === false
  }

  private isTeamConversation(conversationId: string) {
    const nim = nimStore.nim

    if (!nim) {
      return false
    }

    return (
      nim.V2NIMConversationIdUtil.parseConversationType(conversationId) ===
      V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM
    )
  }

  private getTeamConversationId(teamId: string) {
    if (!teamId || !nimStore.nim) {
      return ''
    }

    return nimStore.nim.V2NIMConversationIdUtil.teamConversationId(teamId)
  }

  shouldExcludeConversation(conversationId: string) {
    return (
      !!conversationId &&
      (this.excludedTeamConversationIds.has(conversationId) ||
        this.isInvalidTeamConversation(conversationId))
    )
  }

  removeConversationLocally(conversationId: string) {
    runInAction(() => {
      this.hideConversationLocally(conversationId)
      this.conversations = this.conversations.filter(
        (conv) => conv.conversationId !== conversationId
      )
      delete this.mentionedMessageIdsByConversation[conversationId]
      this.recalculateSummary()
    })
  }

  removeTeamConversationLocally(conversationId: string) {
    if (!conversationId) {
      return
    }

    runInAction(() => {
      if (this.isTeamConversation(conversationId)) {
        this.excludedTeamConversationIds.add(conversationId)
      }

      this.hideConversationLocally(conversationId)
      this.conversations = this.conversations.filter(
        (conv) => conv.conversationId !== conversationId
      )
      delete this.mentionedMessageIdsByConversation[conversationId]
      this.recalculateSummary()
    })
  }

  removeTeamConversationByTeamId(teamId: string) {
    const conversationId = this.getTeamConversationId(teamId)

    if (!conversationId) {
      return
    }

    this.removeTeamConversationLocally(conversationId)
  }

  restoreTeamConversation(conversationId: string) {
    if (!conversationId) {
      return
    }

    runInAction(() => {
      this.excludedTeamConversationIds.delete(conversationId)
      this.restoreConversationLocally(conversationId)
    })
  }

  restoreTeamConversationByTeamId(teamId: string) {
    const conversationId = this.getTeamConversationId(teamId)

    if (!conversationId) {
      return
    }

    this.restoreTeamConversation(conversationId)
  }

  pruneInvalidTeamConversations() {
    runInAction(() => {
      const invalidConversationIds = this.conversations
        .filter((conversation) => this.shouldExcludeConversation(conversation.conversationId))
        .map((conversation) => conversation.conversationId)

      if (!invalidConversationIds.length) {
        return
      }

      const invalidIdSet = new Set(invalidConversationIds)
      this.conversations = this.conversations.filter(
        (conversation) => !invalidIdSet.has(conversation.conversationId)
      )
      invalidConversationIds.forEach((conversationId) => {
        this.hideConversationLocally(conversationId)
        delete this.mentionedMessageIdsByConversation[conversationId]
      })
      this.recalculateSummary()
    })
  }

  hasMention(conversationId: string) {
    return (
      !!this.mentionedMessageIdsByConversation[conversationId]?.length ||
      !!this.getConversationAitMessageKeys(conversationId).length
    )
  }

  clearMention(conversationId: string) {
    runInAction(() => {
      delete this.mentionedMessageIdsByConversation[conversationId]
    })
  }

  removeMentionMessageRefs(
    refs: {
      conversationId: string
      messageClientId?: string
      messageServerId?: string
    }[]
  ) {
    if (!refs.length) {
      return
    }

    runInAction(() => {
      refs.forEach((ref) => {
        if (!ref.conversationId) {
          return
        }

        const referKeys = this.getMessageReferKeys(ref)

        if (!referKeys.length) {
          return
        }

        const keySet = new Set(referKeys)
        const currentMentionKeys = this.mentionedMessageIdsByConversation[ref.conversationId] || []
        const nextMentionKeys = currentMentionKeys.filter((key) => !keySet.has(key))

        if (nextMentionKeys.length) {
          this.mentionedMessageIdsByConversation[ref.conversationId] = nextMentionKeys
        } else {
          delete this.mentionedMessageIdsByConversation[ref.conversationId]
        }

        const conversation = this.getConversation(ref.conversationId) as
          | (V2NIMLocalConversation & {
              aitMsgs?: string[]
            })
          | null

        if (!conversation?.aitMsgs?.length) {
          return
        }

        conversation.aitMsgs = conversation.aitMsgs.filter((key) => !keySet.has(key))
      })
    })
  }

  isConversationLocallyHidden(conversationId: string) {
    return this.locallyHiddenConversationIds.has(conversationId)
  }

  markTeamExitInProgress(conversationId: string) {
    if (!conversationId) {
      return
    }

    this.teamExitInProgressConversationIds.add(conversationId)
  }

  clearTeamExitInProgress(conversationId: string) {
    if (!conversationId) {
      return
    }

    this.teamExitInProgressConversationIds.delete(conversationId)
  }

  isTeamExitInProgress(conversationId: string) {
    return !!conversationId && this.teamExitInProgressConversationIds.has(conversationId)
  }

  consumeTeamExitInProgress(conversationId: string) {
    if (!conversationId || !this.teamExitInProgressConversationIds.has(conversationId)) {
      return false
    }

    this.teamExitInProgressConversationIds.delete(conversationId)
    return true
  }

  decrementUnread(conversationId: string, count = 1) {
    runInAction(() => {
      const conversation = this.getConversation(conversationId)

      if (!conversation) {
        return
      }

      conversation.unreadCount = Math.max((conversation.unreadCount || 0) - count, 0)
      this.syncConversationAitWithUnread(conversationId, conversation.unreadCount || 0)
      this.syncMentionStateWithUnread(conversationId, conversation.unreadCount || 0)
      this.recalculateSummary()
    })
  }

  search(keyword: string) {
    const normalizedKeyword = keyword.trim().toLowerCase()

    if (!normalizedKeyword) {
      return this.conversations
    }

    return this.conversations.filter((item) => {
      const name = (item.name || '').toLowerCase()
      const target = (item.conversationId || '').toLowerCase()
      const messageText = (item.lastMessage?.text || '').toLowerCase()
      return (
        name.includes(normalizedKeyword) ||
        target.includes(normalizedKeyword) ||
        messageText.includes(normalizedKeyword)
      )
    })
  }
}

export const conversationStore = new ConversationStore()
