import { makeAutoObservable, runInAction } from 'mobx'

import { NIMConfig } from '@/constants/NIMConfig'
import { MERGED_FORWARD_SUBTYPE, MergedForwardPayload } from '@/utils/messageForward'
import {
  V2NIMClientAntispamOperateType,
  V2NIMMessage,
  V2NIMMessageAudioAttachment,
  V2NIMMessageCustomAttachment,
  V2NIMMessageFileAttachment,
  V2NIMMessageImageAttachment,
  V2NIMMessagePin,
  V2NIMMessagePinNotification,
  V2NIMMessagePinState,
  V2NIMMessageRevokeNotification,
  V2NIMMessageSendingState,
  V2NIMMessageType,
  V2NIMP2PMessageReadReceipt,
  V2NIMTeamMessageReadReceipt,
  V2NIMTeamMessageReadReceiptDetail
} from '@/utils/nim-sdk'
import { storage } from '@/utils/storage'

import { conversationStore } from './ConversationStore'
import { nimStore } from './NIMStore'
import { preferenceStore } from './PreferenceStore'

type MessagesItem = {
  list: V2NIMMessage[]
  isSync: boolean
  loading: boolean
  loadingMore: boolean
  hasMore: boolean
}

const DEFAULT_MESSAGES_ITEM: MessagesItem = {
  list: [],
  isSync: false,
  loading: false,
  loadingMore: false,
  hasMore: true
}

class MessageStore {
  messagesMap: Record<string, MessagesItem> = {}
  activeConversationId: string | null = null
  p2pReceiptMap: Record<string, V2NIMP2PMessageReadReceipt> = {}
  teamReceiptMap: Record<string, Record<string, V2NIMTeamMessageReadReceipt>> = {}
  revokedMessageMap: Record<string, Record<string, string>> = {}
  pinnedMessageMap: Record<string, Record<string, V2NIMMessagePin>> = {}
  antispamMessageMap: Record<string, Record<string, string>> = {}
  recentForwardConversationIds: string[] = []
  recentForwardAccountId: string | null = null

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true })
  }

  private getForwardHistoryStorageKey(accountId: string) {
    return `${NIMConfig.storageKeys.forwardHistory}.${accountId}`
  }

  private async ensureRecentForwardHistory() {
    const accountId = nimStore.getLoginUser()

    if (!accountId) {
      runInAction(() => {
        this.recentForwardAccountId = null
        this.recentForwardConversationIds = []
      })
      return
    }

    if (this.recentForwardAccountId === accountId) {
      return
    }

    const stored =
      (await storage.getJson<string[]>(this.getForwardHistoryStorageKey(accountId))) || []

    runInAction(() => {
      this.recentForwardAccountId = accountId
      this.recentForwardConversationIds = stored
    })
  }

  private async persistRecentForwardHistory() {
    const accountId = nimStore.getLoginUser()

    if (!accountId) {
      return
    }

    await storage.setJson(
      this.getForwardHistoryStorageKey(accountId),
      this.recentForwardConversationIds
    )
  }

  private async rememberForwardConversation(conversationId: string) {
    await this.ensureRecentForwardHistory()

    runInAction(() => {
      this.recentForwardConversationIds = [
        conversationId,
        ...this.recentForwardConversationIds.filter((item) => item !== conversationId)
      ].slice(0, 5)
    })

    await this.persistRecentForwardHistory()
  }

  private ensureConversationState(conversationId: string) {
    if (!this.messagesMap[conversationId]) {
      this.messagesMap[conversationId] = {
        ...DEFAULT_MESSAGES_ITEM,
        list: []
      }
    }

    return this.messagesMap[conversationId]
  }

  private getMessageKey(message: Pick<V2NIMMessage, 'messageClientId' | 'messageServerId'>) {
    return message.messageClientId || message.messageServerId
  }

  private getMessageByRefer(
    conversationId: string,
    refer?: Partial<Pick<V2NIMMessage, 'messageClientId' | 'messageServerId'>>
  ) {
    if (!refer) {
      return null
    }

    return (
      this.messagesMap[conversationId]?.list.find(
        (message) =>
          (!!refer.messageClientId && message.messageClientId === refer.messageClientId) ||
          (!!refer.messageServerId && message.messageServerId === refer.messageServerId)
      ) || null
    )
  }

  private getMessageRefer(message: V2NIMMessage) {
    return {
      senderId: message.senderId,
      receiverId: message.receiverId,
      messageClientId: message.messageClientId,
      messageServerId: message.messageServerId,
      createTime: message.createTime,
      conversationType: message.conversationType,
      conversationId: message.conversationId
    }
  }

  private getPushPreview(message: V2NIMMessage) {
    switch (message.messageType) {
      case V2NIMMessageType.V2NIM_MESSAGE_TYPE_TEXT:
        return message.text || '你收到一条新消息'
      case V2NIMMessageType.V2NIM_MESSAGE_TYPE_IMAGE:
        return '[图片]'
      case V2NIMMessageType.V2NIM_MESSAGE_TYPE_FILE:
        return '[文件]'
      default:
        return '你收到一条新消息'
    }
  }

  private canUseMessageService() {
    return !!nimStore.nim && nimStore.isLoggedIn()
  }

  private isIllegalStateError(error: unknown) {
    return error instanceof Error && error.message.toLowerCase().includes('illegal state')
  }

  private buildSendParams(conversationId: string, message: V2NIMMessage) {
    const conversation = conversationStore.getConversation(conversationId)
    const pushEnabled = preferenceStore.preferences.notificationsEnabled && !conversation?.mute

    return {
      messageConfig: {
        readReceiptEnabled: preferenceStore.preferences.readReceiptEnabled
      },
      pushConfig: {
        pushEnabled,
        pushNickEnabled: true,
        pushContent: preferenceStore.preferences.showMessageDetail
          ? this.getPushPreview(message)
          : '你收到一条新消息'
      },
      clientAntispamEnabled: message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_TEXT,
      clientAntispamReplace: '***'
    }
  }

  private setAntispamReason(message: V2NIMMessage, reason: string) {
    const key = this.getMessageKey(message)

    runInAction(() => {
      if (!this.antispamMessageMap[message.conversationId]) {
        this.antispamMessageMap[message.conversationId] = {}
      }

      this.antispamMessageMap[message.conversationId][key] = reason
    })
  }

  private clearAntispamReason(conversationId: string, messageId: string) {
    runInAction(() => {
      delete this.antispamMessageMap[conversationId]?.[messageId]
    })
  }

  private createAntispamTipText(reason?: string) {
    return reason?.trim() || '内容可能涉及敏感信息，请调整后发送'
  }

  private appendLocalTipsMessage(conversationId: string, text: string) {
    if (!nimStore.nim) {
      return
    }

    const tipMessage = nimStore.nim.V2NIMMessageCreator.createTipsMessage(text)
    const conversationType =
      nimStore.nim.V2NIMConversationIdUtil.parseConversationType(conversationId)
    const targetId = nimStore.nim.V2NIMConversationIdUtil.parseConversationTargetId(conversationId)
    const createTime = Date.now()

    this.addMessage({
      ...tipMessage,
      conversationId,
      conversationType,
      receiverId: targetId,
      senderId: nimStore.getLoginUser() || tipMessage.senderId,
      createTime
    } as V2NIMMessage)

    conversationStore.updateConversation(conversationId, {
      sortOrder: createTime,
      lastMessage: {
        lastMessageState: 0,
        messageRefer: {
          conversationId,
          conversationType,
          receiverId: targetId,
          senderId: nimStore.getLoginUser() || targetId,
          createTime
        },
        messageType: V2NIMMessageType.V2NIM_MESSAGE_TYPE_TIPS,
        text
      } as never
    })
  }

  private getClientAntispamReason(message: V2NIMMessage) {
    if (
      !nimStore.nim ||
      message.messageType !== V2NIMMessageType.V2NIM_MESSAGE_TYPE_TEXT ||
      !message.text?.trim()
    ) {
      return null
    }

    const result = nimStore.nim.V2NIMClientAntispamUtil.checkTextAntispam(message.text, '***')

    if (
      result.operateType !==
      V2NIMClientAntispamOperateType.V2NIM_CLIENT_ANTISPAM_OPERATE_CLIENT_SHIELD
    ) {
      return null
    }

    return this.createAntispamTipText()
  }

  private extractAntispamReason(error: unknown) {
    if (!error || typeof error !== 'object') {
      return null
    }

    const candidate = error as {
      antispamResult?: string
      message?: string
    }

    if (candidate.antispamResult) {
      return this.createAntispamTipText(candidate.antispamResult)
    }

    if (candidate.message?.toLowerCase().includes('antispam')) {
      return this.createAntispamTipText()
    }

    return null
  }

  private mergeMessages(existing: V2NIMMessage[], incoming: V2NIMMessage[]) {
    const merged = new Map<string, V2NIMMessage>()

    existing.forEach((message) => {
      merged.set(this.getMessageKey(message), message)
    })

    incoming.forEach((message) => {
      merged.set(this.getMessageKey(message), message)
    })

    return Array.from(merged.values())
      .filter((message) => !message.isDelete)
      .sort((left, right) => left.createTime - right.createTime)
  }

  private updateMessage(
    conversationId: string,
    matcher: (message: V2NIMMessage) => boolean,
    updater: (message: V2NIMMessage) => V2NIMMessage
  ) {
    runInAction(() => {
      const current = this.messagesMap[conversationId]

      if (!current) {
        return
      }

      current.list = current.list.map((message) => (matcher(message) ? updater(message) : message))
    })

    this.syncConversationPreview(conversationId)
  }

  private syncConversationPreview(conversationId: string) {
    const current = this.messagesMap[conversationId]

    if (!current) {
      return
    }

    const latestMessage = current.list[current.list.length - 1]

    if (!latestMessage) {
      conversationStore.updateConversation(conversationId, {
        lastMessage: undefined,
        sortOrder: undefined
      } as never)
      return
    }

    const messageKey = this.getMessageKey(latestMessage)
    const revokedText = this.revokedMessageMap[conversationId]?.[messageKey]

    if (revokedText) {
      conversationStore.updateConversation(conversationId, {
        sortOrder: latestMessage.createTime,
        lastMessage: {
          lastMessageState: 0,
          messageRefer: {
            conversationId,
            conversationType: latestMessage.conversationType,
            receiverId: latestMessage.receiverId,
            senderId: latestMessage.senderId,
            createTime: latestMessage.createTime
          },
          messageType: V2NIMMessageType.V2NIM_MESSAGE_TYPE_TIPS,
          text: revokedText
        } as never
      })
      return
    }

    conversationStore.updateConversation(conversationId, {
      sortOrder: latestMessage.createTime,
      lastMessage: {
        lastMessageState: 0,
        messageRefer: {
          conversationId,
          conversationType: latestMessage.conversationType,
          receiverId: latestMessage.receiverId,
          senderId: latestMessage.senderId,
          createTime: latestMessage.createTime
        },
        messageType: latestMessage.messageType,
        text: latestMessage.text,
        attachment: latestMessage.attachment,
        subType: latestMessage.subType
      } as never
    })
  }

  private async performSend(
    conversationId: string,
    draftMessage: V2NIMMessage,
    sender: () => Promise<{ message: V2NIMMessage }>
  ) {
    this.addMessage({
      ...draftMessage,
      sendingState: V2NIMMessageSendingState.V2NIM_MESSAGE_SENDING_STATE_SENDING
    })

    const clientAntispamReason = this.getClientAntispamReason(draftMessage)

    if (clientAntispamReason) {
      this.updateMessage(
        conversationId,
        (message) => this.getMessageKey(message) === this.getMessageKey(draftMessage),
        (message) => ({
          ...message,
          sendingState: V2NIMMessageSendingState.V2NIM_MESSAGE_SENDING_STATE_FAILED
        })
      )
      this.setAntispamReason(draftMessage, clientAntispamReason)
      this.appendLocalTipsMessage(conversationId, clientAntispamReason)
      throw new Error(clientAntispamReason)
    }

    try {
      const result = await sender()
      this.clearAntispamReason(conversationId, this.getMessageKey(draftMessage))
      this.addMessage(result.message)
      return result.message
    } catch (error) {
      const antispamReason = this.extractAntispamReason(error)

      this.updateMessage(
        conversationId,
        (message) => this.getMessageKey(message) === this.getMessageKey(draftMessage),
        (message) => ({
          ...message,
          sendingState: V2NIMMessageSendingState.V2NIM_MESSAGE_SENDING_STATE_FAILED
        })
      )

      if (antispamReason) {
        this.setAntispamReason(draftMessage, antispamReason)
        this.appendLocalTipsMessage(conversationId, antispamReason)
      }

      throw error
    }
  }

  getConversationMessages(conversationId: string): MessagesItem {
    const current = this.messagesMap[conversationId]

    if (!current) {
      return DEFAULT_MESSAGES_ITEM
    }

    return {
      list: current.list,
      isSync: current.isSync,
      loading: current.loading,
      loadingMore: current.loadingMore,
      hasMore: current.hasMore
    }
  }

  getMessageById(conversationId: string, messageId: string) {
    return (
      this.messagesMap[conversationId]?.list.find(
        (message) => this.getMessageKey(message) === messageId
      ) || null
    )
  }

  getRevokedText(message: V2NIMMessage) {
    return this.revokedMessageMap[message.conversationId]?.[this.getMessageKey(message)] || null
  }

  getAntispamReason(message: V2NIMMessage) {
    return this.antispamMessageMap[message.conversationId]?.[this.getMessageKey(message)] || null
  }

  isAntispamBlocked(message: V2NIMMessage) {
    return !!this.getAntispamReason(message)
  }

  isMessagePinned(message: V2NIMMessage) {
    return !!this.pinnedMessageMap[message.conversationId]?.[this.getMessageKey(message)]
  }

  getPinnedMessages(conversationId: string) {
    const pins = Object.values(this.pinnedMessageMap[conversationId] || {})

    return pins
      .map((pin) => this.getMessageByRefer(conversationId, pin.messageRefer))
      .filter(Boolean)
      .sort((left, right) => (right?.createTime || 0) - (left?.createTime || 0)) as V2NIMMessage[]
  }

  setActiveConversation(conversationId: string | null) {
    this.activeConversationId = conversationId
  }

  addMessage(message: V2NIMMessage) {
    runInAction(() => {
      const current = this.ensureConversationState(message.conversationId)
      current.list = this.mergeMessages(current.list, [message])
    })

    this.syncConversationPreview(message.conversationId)
  }

  addMessages(messages: V2NIMMessage[]) {
    const grouped: Record<string, V2NIMMessage[]> = {}

    messages.forEach((message) => {
      grouped[message.conversationId] = grouped[message.conversationId] || []
      grouped[message.conversationId].push(message)
    })

    runInAction(() => {
      Object.entries(grouped).forEach(([conversationId, nextMessages]) => {
        const current = this.ensureConversationState(conversationId)
        current.list = this.mergeMessages(current.list, nextMessages)
      })
    })

    Object.keys(grouped).forEach((conversationId) => {
      this.syncConversationPreview(conversationId)
    })
  }

  applyP2PReadReceipts(readReceipts: V2NIMP2PMessageReadReceipt[]) {
    runInAction(() => {
      readReceipts.forEach((receipt) => {
        this.p2pReceiptMap[receipt.conversationId] = receipt
      })
    })
  }

  applyTeamReadReceipts(readReceipts: V2NIMTeamMessageReadReceipt[]) {
    runInAction(() => {
      readReceipts.forEach((receipt) => {
        if (!this.teamReceiptMap[receipt.conversationId]) {
          this.teamReceiptMap[receipt.conversationId] = {}
        }

        this.teamReceiptMap[receipt.conversationId][
          receipt.messageClientId || receipt.messageServerId
        ] = receipt
      })
    })
  }

  applyRevokeNotifications(notifications: V2NIMMessageRevokeNotification[]) {
    const currentAccountId = nimStore.getLoginUser()
    const affectedConversationIds = new Set<string>()

    runInAction(() => {
      notifications.forEach((notification) => {
        const { conversationId, messageClientId, messageServerId } = notification.messageRefer
        affectedConversationIds.add(conversationId)

        if (!this.revokedMessageMap[conversationId]) {
          this.revokedMessageMap[conversationId] = {}
        }

        this.revokedMessageMap[conversationId][messageClientId || messageServerId] =
          notification.revokeAccountId === currentAccountId ? '你撤回了一条消息' : '此消息已撤回'
      })
    })

    affectedConversationIds.forEach((conversationId) => {
      this.syncConversationPreview(conversationId)
    })
  }

  applyPinNotification(notification: V2NIMMessagePinNotification) {
    const { conversationId, messageClientId, messageServerId } = notification.pin.messageRefer
    const key = messageClientId || messageServerId

    runInAction(() => {
      if (!this.pinnedMessageMap[conversationId]) {
        this.pinnedMessageMap[conversationId] = {}
      }

      if (notification.pinState === V2NIMMessagePinState.V2NIM_MESSAGE_PIN_STATE_NOT_PINNED) {
        delete this.pinnedMessageMap[conversationId][key]
        return
      }

      this.pinnedMessageMap[conversationId][key] = {
        messageRefer: notification.pin.messageRefer,
        opeartorId: notification.pin.operatorId,
        serverExtension: notification.pin.serverExtension,
        createTime: notification.pin.createTime || notification.pin.updateTime,
        updateTime: notification.pin.updateTime
      }
    })
  }

  applyPinnedMessages(conversationId: string, pins: V2NIMMessagePin[]) {
    runInAction(() => {
      this.pinnedMessageMap[conversationId] = {}
      pins.forEach((pin) => {
        this.pinnedMessageMap[conversationId][
          pin.messageRefer.messageClientId || pin.messageRefer.messageServerId
        ] = pin
      })
    })
  }

  isPeerRead(message: V2NIMMessage) {
    if (message.sendingState !== V2NIMMessageSendingState.V2NIM_MESSAGE_SENDING_STATE_SUCCEEDED) {
      return false
    }

    if (nimStore.nim?.V2NIMMessageService.isPeerRead(message)) {
      return true
    }

    return (this.p2pReceiptMap[message.conversationId]?.timestamp || 0) >= (message.createTime || 0)
  }

  getTeamReadReceipt(message: V2NIMMessage) {
    return this.teamReceiptMap[message.conversationId]?.[this.getMessageKey(message)] || null
  }

  async refreshP2PReadReceipt(conversationId: string) {
    if (!this.canUseMessageService()) {
      return null
    }

    const nim = nimStore.nim!

    try {
      const receipt = await nim.V2NIMMessageService.getP2PMessageReceipt(conversationId)
      this.applyP2PReadReceipts([receipt])
      return receipt
    } catch (error) {
      if (this.isIllegalStateError(error)) {
        return null
      }

      throw error
    }
  }

  async refreshTeamReadReceipts(messages: V2NIMMessage[]) {
    if (!this.canUseMessageService() || messages.length === 0) {
      return []
    }

    const nim = nimStore.nim!

    try {
      const receipts = await nim.V2NIMMessageService.getTeamMessageReceipts(messages)
      this.applyTeamReadReceipts(receipts)
      return receipts
    } catch (error) {
      if (this.isIllegalStateError(error)) {
        return []
      }

      throw error
    }
  }

  async getTeamMessageReceiptDetail(message: V2NIMMessage) {
    if (!this.canUseMessageService()) {
      return null
    }

    const nim = nimStore.nim!

    try {
      const detail = await nim.V2NIMMessageService.getTeamMessageReceiptDetail(message)
      this.applyTeamReadReceipts([detail.readReceipt])
      return detail as V2NIMTeamMessageReadReceiptDetail
    } catch (error) {
      if (this.isIllegalStateError(error)) {
        return null
      }

      throw error
    }
  }

  async sendChatReadReceipts(conversationId: string) {
    if (!this.canUseMessageService()) {
      return
    }

    const nim = nimStore.nim!
    const current = this.messagesMap[conversationId]

    if (!current?.list.length) {
      return
    }

    const incomingMessages = current.list.filter((message) => !message.isSelf)
    const latestIncoming = incomingMessages[incomingMessages.length - 1]

    if (!latestIncoming) {
      return
    }

    if (latestIncoming.conversationType === 1) {
      await nim.V2NIMMessageService.sendP2PMessageReceipt(latestIncoming)
      return
    }

    const teamMessages = incomingMessages
      .filter((message) => message.messageConfig?.readReceiptEnabled !== false)
      .slice(-50)

    if (teamMessages.length > 0) {
      await nim.V2NIMMessageService.sendTeamMessageReceipts(teamMessages)
    }
  }

  async refreshReadState(conversationId: string) {
    if (!this.canUseMessageService()) {
      return
    }

    const current = this.messagesMap[conversationId]

    if (!current?.list.length) {
      return
    }

    const latestMessage = current.list[current.list.length - 1]

    if (latestMessage.conversationType === 1) {
      await this.refreshP2PReadReceipt(conversationId)
      return
    }

    const outgoingMessages = current.list
      .filter(
        (message) =>
          message.isSelf &&
          message.sendingState === V2NIMMessageSendingState.V2NIM_MESSAGE_SENDING_STATE_SUCCEEDED &&
          message.messageConfig?.readReceiptEnabled
      )
      .slice(-50)

    await this.refreshTeamReadReceipts(outgoingMessages)
  }

  async revokeMessage(message: V2NIMMessage) {
    if (!nimStore.nim) {
      return
    }

    await nimStore.nim.V2NIMMessageService.revokeMessage(message)
    this.applyRevokeNotifications([
      {
        messageRefer: {
          senderId: message.senderId,
          receiverId: message.receiverId,
          messageClientId: message.messageClientId,
          messageServerId: message.messageServerId,
          createTime: message.createTime,
          conversationType: message.conversationType,
          conversationId: message.conversationId
        },
        revokeAccountId: nimStore.getLoginUser() || message.senderId,
        revokeType: 0
      } as V2NIMMessageRevokeNotification
    ])
    await conversationStore.refreshConversations()
  }

  async deleteRemoteMessage(message: V2NIMMessage) {
    if (!nimStore.nim) {
      return
    }

    await nimStore.nim.V2NIMMessageService.deleteMessage(message)
    this.deleteMessage(message.conversationId, this.getMessageKey(message))
    await conversationStore.refreshConversations()
  }

  async loadPinnedMessages(conversationId: string) {
    if (!this.canUseMessageService()) {
      return []
    }

    const nim = nimStore.nim!

    try {
      const pins = await nim.V2NIMMessageService.getPinnedMessageList(conversationId)
      this.applyPinnedMessages(conversationId, pins)

      if (pins.length === 0) {
        return []
      }

      const messages = await nim.V2NIMMessageService.getMessageListByRefers(
        pins.map((pin: V2NIMMessagePin) => pin.messageRefer)
      )
      this.addMessages(messages)
      return messages
    } catch (error) {
      if (this.isIllegalStateError(error)) {
        return []
      }

      throw error
    }
  }

  async toggleMessagePin(message: V2NIMMessage) {
    if (!nimStore.nim) {
      return
    }

    if (this.isMessagePinned(message)) {
      await nimStore.nim.V2NIMMessageService.unpinMessage(this.getMessageRefer(message))
    } else {
      await nimStore.nim.V2NIMMessageService.pinMessage(message)
    }

    await this.loadPinnedMessages(message.conversationId)
  }

  async loadHistory(conversationId: string, limit = 50) {
    if (!this.canUseMessageService()) {
      return []
    }

    const nim = nimStore.nim!

    runInAction(() => {
      const current = this.ensureConversationState(conversationId)
      current.loading = true
    })

    try {
      const messages = await nim.V2NIMMessageService.getMessageList({
        conversationId,
        limit,
        direction: 0
      })

      runInAction(() => {
        const current = this.ensureConversationState(conversationId)
        current.list = this.mergeMessages([], messages)
        current.isSync = true
        current.hasMore = messages.length >= limit
      })

      return messages
    } catch (error) {
      if (this.isIllegalStateError(error)) {
        return []
      }

      throw error
    } finally {
      runInAction(() => {
        const current = this.ensureConversationState(conversationId)
        current.loading = false
      })
    }
  }

  async loadMoreHistory(conversationId: string, limit = 50) {
    if (!this.canUseMessageService()) {
      return []
    }

    const nim = nimStore.nim!
    const current = this.ensureConversationState(conversationId)

    if (current.loading || current.loadingMore || !current.hasMore || current.list.length === 0) {
      return []
    }

    runInAction(() => {
      current.loadingMore = true
    })

    try {
      const anchorMessage = current.list[0]
      const messages = await nim.V2NIMMessageService.getMessageList({
        conversationId,
        anchorMessage,
        limit,
        direction: 0
      })

      runInAction(() => {
        const latest = this.ensureConversationState(conversationId)
        latest.list = this.mergeMessages(latest.list, messages)
        latest.hasMore = messages.length >= limit
      })

      return messages
    } catch (error) {
      if (this.isIllegalStateError(error)) {
        return []
      }

      throw error
    } finally {
      runInAction(() => {
        const latest = this.ensureConversationState(conversationId)
        latest.loadingMore = false
      })
    }
  }

  async sendMessage(conversationId: string, text: string) {
    if (!nimStore.nim || !text.trim()) {
      return
    }

    const message = nimStore.nim.V2NIMMessageCreator.createTextMessage(text.trim())
    return this.performSend(conversationId, message, () =>
      nimStore.nim!.V2NIMMessageService.sendMessage(
        message,
        conversationId,
        this.buildSendParams(conversationId, message)
      )
    )
  }

  async replyTextMessage(conversationId: string, text: string, replyToMessage: V2NIMMessage) {
    if (!nimStore.nim || !text.trim()) {
      return
    }

    const message = nimStore.nim.V2NIMMessageCreator.createTextMessage(text.trim())
    return this.performSend(conversationId, message, () =>
      nimStore.nim!.V2NIMMessageService.replyMessage(
        message,
        replyToMessage,
        this.buildSendParams(conversationId, message)
      )
    )
  }

  async sendImageMessage(conversationId: string, imageUri: string, name?: string) {
    if (!nimStore.nim) {
      return
    }

    const message = nimStore.nim.V2NIMMessageCreator.createImageMessage(
      imageUri,
      name || 'image.jpg'
    )
    return this.performSend(conversationId, message, () =>
      nimStore.nim!.V2NIMMessageService.sendMessage(
        message,
        conversationId,
        this.buildSendParams(conversationId, message)
      )
    )
  }

  async sendVideoMessage(
    conversationId: string,
    videoUri: string,
    options?: {
      name?: string
      duration?: number
      width?: number
      height?: number
    }
  ) {
    if (!nimStore.nim) {
      return
    }

    const message = nimStore.nim.V2NIMMessageCreator.createVideoMessage(
      videoUri,
      options?.name || 'video.mp4',
      undefined,
      options?.duration,
      options?.width,
      options?.height
    )

    return this.performSend(conversationId, message, () =>
      nimStore.nim!.V2NIMMessageService.sendMessage(
        message,
        conversationId,
        this.buildSendParams(conversationId, message)
      )
    )
  }

  async sendFileMessage(conversationId: string, fileUri: string, name?: string) {
    if (!nimStore.nim) {
      return
    }

    const message = nimStore.nim.V2NIMMessageCreator.createFileMessage(fileUri, name || 'file')
    return this.performSend(conversationId, message, () =>
      nimStore.nim!.V2NIMMessageService.sendMessage(
        message,
        conversationId,
        this.buildSendParams(conversationId, message)
      )
    )
  }

  async resendMessage(message: V2NIMMessage) {
    if (!nimStore.nim) {
      return null
    }

    const key = this.getMessageKey(message)
    const resendWithDraft = async (
      draftMessage: V2NIMMessage,
      sender: () => Promise<{ message: V2NIMMessage }>
    ) => {
      try {
        const nextMessage = await this.performSend(message.conversationId, draftMessage, sender)
        this.deleteMessage(message.conversationId, key)
        return nextMessage
      } catch (error) {
        this.deleteMessage(message.conversationId, this.getMessageKey(draftMessage))
        throw error
      }
    }

    const replyToMessage = this.getMessageByRefer(message.conversationId, message.threadReply)

    if (message.threadReply && !replyToMessage) {
      throw new Error('回复的原消息不存在，无法重发')
    }

    if (message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_TEXT) {
      const draftMessage = nimStore.nim.V2NIMMessageCreator.createTextMessage(message.text || '')
      return resendWithDraft(draftMessage, () =>
        replyToMessage
          ? nimStore.nim!.V2NIMMessageService.replyMessage(
              draftMessage,
              replyToMessage,
              this.buildSendParams(message.conversationId, draftMessage)
            )
          : nimStore.nim!.V2NIMMessageService.sendMessage(
              draftMessage,
              message.conversationId,
              this.buildSendParams(message.conversationId, draftMessage)
            )
      )
    }

    if (message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_IMAGE) {
      const attachment = message.attachment as V2NIMMessageImageAttachment | undefined
      const source = attachment?.path || attachment?.url

      if (!source) {
        throw new Error('原图片不存在，无法重发')
      }

      const draftMessage = nimStore.nim.V2NIMMessageCreator.createImageMessage(
        source,
        attachment?.name || 'image.jpg'
      )
      return resendWithDraft(draftMessage, () =>
        nimStore.nim!.V2NIMMessageService.sendMessage(
          draftMessage,
          message.conversationId,
          this.buildSendParams(message.conversationId, draftMessage)
        )
      )
    }

    if (message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_VIDEO) {
      const attachment = message.attachment as V2NIMMessageFileAttachment | undefined
      const source = attachment?.path || attachment?.url

      if (!source) {
        throw new Error('原视频不存在，无法重发')
      }

      const draftMessage = nimStore.nim.V2NIMMessageCreator.createVideoMessage(
        source,
        attachment?.name || 'video.mp4'
      )
      return resendWithDraft(draftMessage, () =>
        nimStore.nim!.V2NIMMessageService.sendMessage(
          draftMessage,
          message.conversationId,
          this.buildSendParams(message.conversationId, draftMessage)
        )
      )
    }

    if (message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_FILE) {
      const attachment = message.attachment as V2NIMMessageFileAttachment | undefined
      const source = attachment?.path || attachment?.url

      if (!source) {
        throw new Error('原文件不存在，无法重发')
      }

      const draftMessage = nimStore.nim.V2NIMMessageCreator.createFileMessage(
        source,
        attachment?.name || 'file'
      )
      return resendWithDraft(draftMessage, () =>
        nimStore.nim!.V2NIMMessageService.sendMessage(
          draftMessage,
          message.conversationId,
          this.buildSendParams(message.conversationId, draftMessage)
        )
      )
    }

    if (message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_AUDIO) {
      const attachment = message.attachment as V2NIMMessageAudioAttachment | undefined
      const source = attachment?.path || attachment?.url

      if (!source) {
        throw new Error('原语音不存在，无法重发')
      }

      const draftMessage = nimStore.nim.V2NIMMessageCreator.createAudioMessage(
        source,
        attachment?.name || 'audio.aac'
      )
      return resendWithDraft(draftMessage, () =>
        nimStore.nim!.V2NIMMessageService.sendMessage(
          draftMessage,
          message.conversationId,
          this.buildSendParams(message.conversationId, draftMessage)
        )
      )
    }

    return null
  }

  async forwardMessage(message: V2NIMMessage, conversationId: string, comment = '') {
    if (!nimStore.nim) {
      return null
    }

    if (comment.trim()) {
      const commentMessage = nimStore.nim.V2NIMMessageCreator.createTextMessage(comment.trim())
      await this.performSend(conversationId, commentMessage, () =>
        nimStore.nim!.V2NIMMessageService.sendMessage(
          commentMessage,
          conversationId,
          this.buildSendParams(conversationId, commentMessage)
        )
      )
    }

    const forwardMessage = nimStore.nim.V2NIMMessageCreator.createForwardMessage(message)

    if (!forwardMessage) {
      throw new Error('该消息暂不支持转发')
    }

    const result = await this.performSend(conversationId, forwardMessage, () =>
      nimStore.nim!.V2NIMMessageService.sendMessage(
        forwardMessage,
        conversationId,
        this.buildSendParams(conversationId, forwardMessage)
      )
    )
    await this.rememberForwardConversation(conversationId)
    return result
  }

  async forwardMessages(messages: V2NIMMessage[], conversationId: string, comment = '') {
    if (!nimStore.nim || messages.length === 0) {
      return []
    }

    const results: V2NIMMessage[] = []

    if (comment.trim()) {
      const commentMessage = nimStore.nim.V2NIMMessageCreator.createTextMessage(comment.trim())
      const sentComment = await this.performSend(conversationId, commentMessage, () =>
        nimStore.nim!.V2NIMMessageService.sendMessage(
          commentMessage,
          conversationId,
          this.buildSendParams(conversationId, commentMessage)
        )
      )
      results.push(sentComment)
    }

    for (const message of messages) {
      const forwardMessage = nimStore.nim.V2NIMMessageCreator.createForwardMessage(message)

      if (!forwardMessage) {
        throw new Error('该消息暂不支持转发')
      }

      const sentMessage = await this.performSend(conversationId, forwardMessage, () =>
        nimStore.nim!.V2NIMMessageService.sendMessage(
          forwardMessage,
          conversationId,
          this.buildSendParams(conversationId, forwardMessage)
        )
      )
      results.push(sentMessage)
    }

    await this.rememberForwardConversation(conversationId)
    return results
  }

  async sendMergedForwardMessage(
    conversationId: string,
    payload: MergedForwardPayload,
    comment = ''
  ) {
    if (!nimStore.nim) {
      return null
    }

    if (comment.trim()) {
      const commentMessage = nimStore.nim.V2NIMMessageCreator.createTextMessage(comment.trim())
      await this.performSend(conversationId, commentMessage, () =>
        nimStore.nim!.V2NIMMessageService.sendMessage(
          commentMessage,
          conversationId,
          this.buildSendParams(conversationId, commentMessage)
        )
      )
    }

    const attachment = {
      ...payload,
      raw: JSON.stringify(payload)
    } as V2NIMMessageCustomAttachment
    const mergedMessage = nimStore.nim.V2NIMMessageCreator.createCustomMessageWithAttachment(
      attachment,
      MERGED_FORWARD_SUBTYPE
    )
    mergedMessage.text = '[聊天记录]'

    const result = await this.performSend(conversationId, mergedMessage, () =>
      nimStore.nim!.V2NIMMessageService.sendMessage(
        mergedMessage,
        conversationId,
        this.buildSendParams(conversationId, mergedMessage)
      )
    )
    await this.rememberForwardConversation(conversationId)
    return result
  }

  async loadRecentForwardConversations() {
    await this.ensureRecentForwardHistory()
    return this.recentForwardConversationIds
  }

  syncMessages(conversationId: string, messages: V2NIMMessage[]) {
    runInAction(() => {
      this.messagesMap[conversationId] = {
        list: this.mergeMessages([], messages),
        isSync: true,
        loading: false,
        loadingMore: false,
        hasMore: messages.length >= 50
      }
    })
  }

  clearConversationMessages(conversationId: string) {
    runInAction(() => {
      delete this.messagesMap[conversationId]
      delete this.p2pReceiptMap[conversationId]
      delete this.teamReceiptMap[conversationId]
      delete this.revokedMessageMap[conversationId]
      delete this.pinnedMessageMap[conversationId]
      delete this.antispamMessageMap[conversationId]
    })
  }

  deleteMessage(conversationId: string, messageId: string) {
    runInAction(() => {
      const current = this.messagesMap[conversationId]
      if (current) {
        current.list = current.list.filter((message) => this.getMessageKey(message) !== messageId)
      }

      delete this.antispamMessageMap[conversationId]?.[messageId]
    })

    this.syncConversationPreview(conversationId)
  }
}

export const messageStore = new MessageStore()
