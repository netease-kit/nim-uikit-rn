import CryptoJS from 'crypto-js'
import * as FileSystem from 'expo-file-system/legacy'
import { makeAutoObservable, runInAction } from 'mobx'
import { Platform } from 'react-native'

import { NIMConfig } from '@/constants/NIMConfig'
import { translateCurrentApp } from '@/utils/app-language'
import { normalizeDisplayErrorMessage } from '@/utils/error-message'
import {
  buildMentionExtension,
  getMentionPushInfo,
  MentionDraft,
  parseMentionExtension
} from '@/utils/mention'
import {
  getForwardPreview,
  MERGED_FORWARD_CUSTOM_TYPE,
  MultiForwardAbstract,
  parseStandardMergedForwardData
} from '@/utils/messageForward'
import {
  V2NIMAIModelRoleType,
  V2NIMClientAntispamOperateType,
  V2NIMConversationType,
  V2NIMMessage,
  V2NIMMessageAIConfigParams,
  V2NIMMessageAudioAttachment,
  V2NIMMessageCustomAttachment,
  V2NIMMessageFileAttachment,
  V2NIMMessageImageAttachment,
  V2NIMMessageLocationAttachment,
  V2NIMMessagePin,
  V2NIMMessagePinNotification,
  V2NIMMessagePinState,
  V2NIMMessageRefer,
  V2NIMMessageRevokeNotification,
  V2NIMMessageSendingState,
  V2NIMMessageType,
  V2NIMP2PMessageReadReceipt,
  V2NIMSendMessageParams,
  V2NIMTeamMessageReadReceipt,
  V2NIMTeamMessageReadReceiptDetail
} from '@/utils/nim-sdk'
import { buildPushPayload } from '@/utils/offline-push'
import { storage } from '@/utils/storage'
import { logIOSVoiceDebug } from '@/utils/voice-debug-log'

import { conversationStore } from './ConversationStore'
import { imStoreV2Bridge } from './ImStoreV2Bridge'
import { nimStore } from './NIMStore'
import { preferenceStore } from './PreferenceStore'

type MessagesItem = {
  list: V2NIMMessage[]
  isSync: boolean
  loading: boolean
  loadingMore: boolean
  hasMore: boolean
  historyAnchor: V2NIMMessage | null
}

const DEFAULT_MESSAGES_ITEM: MessagesItem = {
  list: [],
  isSync: false,
  loading: false,
  loadingMore: false,
  hasMore: true,
  historyAnchor: null
}

const SUCCESS_MESSAGE_STATUS_CODE = 200
const BLACKLIST_SEND_ERROR_CODE = 102426
const BLACKLIST_SEND_TIP = () => translateCurrentApp('messageStoreBlacklistedTip' as never)
const FRIEND_DELETED_SEND_ERROR_CODE = 104404
const AI_MESSAGE_LIMIT = 30
const FRIEND_DELETED_SEND_TIP = () => translateCurrentApp('messageStoreFriendDeletedTip' as never)
const DELETE_MESSAGES_CHUNK_SIZE = 50
const NATIVE_HISTORY_PAGE_SIZE = 100
const TEAM_READ_RECEIPT_QUERY_MAX_BATCH_SIZE = 20
const REVOKE_LOCAL_MESSAGE = 'revokeLocalMessage'
const REVOKE_LOCAL_MESSAGE_CONTENT = 'revokeLocalMessageContent'
const REVOKE_LOCAL_MESSAGE_CONTENT_ANDROID = 'revokeMessageContent'
const REVOKE_LOCAL_MESSAGE_TIME = 'revokeLocalMessageTime'
const LAST_MESSAGE_STATE_REVOKE = 1
const REEDIT_TIME_LIMIT_MS = 2 * 60 * 1000
const ANTISPAM_LABEL_KEY_MAP: Record<string, string> = {
  100: 'commonAntispamPornography',
  200: 'commonAntispamAdvertising',
  260: 'commonAntispamAdvertisingLaw',
  300: 'commonAntispamViolence',
  400: 'commonAntispamProhibited',
  500: 'commonAntispamPolitics',
  600: 'commonAntispamAbuse',
  700: 'commonAntispamSpam',
  900: 'commonAntispamOther',
  1000: 'commonAntispamValue',
  1100: 'commonAntispamValue'
}

type TextMessageOptions = {
  mentions?: MentionDraft
  serverExtension?: string
}

type SendMessageResult = {
  message: V2NIMMessage
  antispamResult?: string
  callbackExtension?: string
}

type PerformSendOptions = {
  videoUploadPreview?: string
  debugTraceId?: string
}

type ReadReceiptSendResult = {
  sent: boolean
  incomingCount: number
  readableCount: number
}

type MessageDeleteRefer = {
  conversationId: string
  messageClientId?: string
  messageServerId?: string
}

type MessageReplyRefer = Partial<V2NIMMessageRefer>

function getVoiceStoreErrorCode(error: unknown) {
  if (!error || typeof error !== 'object') {
    return undefined
  }

  const candidate = error as {
    code?: unknown
    errCode?: unknown
    errorCode?: unknown
  }

  return candidate.errorCode ?? candidate.errCode ?? candidate.code
}

function getVoiceStoreErrorDetail(error: unknown) {
  if (!error || typeof error !== 'object') {
    return ''
  }

  const candidate = error as {
    detail?: unknown
    reason?: unknown
    message?: unknown
  }

  const parts = [candidate.message, candidate.reason, candidate.detail]
    .map((value) => {
      if (typeof value === 'string') {
        return value
      }

      if (value && typeof value === 'object') {
        try {
          return JSON.stringify(value)
        } catch {
          return String(value)
        }
      }

      return ''
    })
    .filter(Boolean)

  return parts.join(' ')
}

function isTransientAndroidAudioUploadError(error: unknown) {
  if (Platform.OS !== 'android') {
    return false
  }

  const code = getVoiceStoreErrorCode(error)
  if (code !== 194006) {
    return false
  }

  const detail = getVoiceStoreErrorDetail(error).toLowerCase()
  return detail.includes('stream closed') && detail.includes('status: 0')
}

function createSendFailureError(message: V2NIMMessage, result?: SendMessageResult) {
  const errorCode = message.messageStatus?.errorCode
  const hasFailureErrorCode = isSendFailureErrorCode(errorCode)
  const errorMessage =
    result?.callbackExtension?.trim() ||
    message.callbackExtension?.trim() ||
    message.text?.trim() ||
    (hasFailureErrorCode ? String(errorCode) : '')
  const error = new Error(errorMessage || translateCurrentApp('commonSendFailed'))

  if (hasFailureErrorCode) {
    ;(error as Error & { errorCode?: number; code?: number }).errorCode = errorCode
    ;(error as Error & { errorCode?: number; code?: number }).code = errorCode
  }

  return error
}

function isSendFailureErrorCode(errorCode: unknown) {
  return typeof errorCode === 'number' && errorCode !== SUCCESS_MESSAGE_STATUS_CODE
}

function createAntispamSendFailureError(reason: string, antispamResult?: string) {
  const error = new Error(reason)
  ;(error as Error & { antispamResult?: string }).antispamResult = antispamResult

  return error
}

function hasSendFailureResult(message: V2NIMMessage) {
  return (
    message.sendingState === V2NIMMessageSendingState.V2NIM_MESSAGE_SENDING_STATE_FAILED ||
    isSendFailureErrorCode(message.messageStatus?.errorCode)
  )
}

function getAudioMessageDebugPayload(message?: V2NIMMessage) {
  const attachment = message?.attachment as
    | (V2NIMMessageAudioAttachment & {
        ext?: unknown
        size?: unknown
        raw?: unknown
      })
    | undefined

  return {
    messageClientId: message?.messageClientId,
    messageServerId: message?.messageServerId,
    conversationId: message?.conversationId,
    conversationType: message?.conversationType,
    senderId: message?.senderId,
    receiverId: message?.receiverId,
    createTime: message?.createTime,
    sendingState: message?.sendingState,
    messageStatus: message?.messageStatus,
    attachmentDuration: attachment?.duration,
    attachmentName: attachment?.name,
    attachmentPath: attachment?.path,
    attachmentUrl: attachment?.url,
    attachmentExt: attachment?.ext,
    attachmentSize: attachment?.size,
    attachmentRaw: attachment?.raw
  }
}

class MessageStore {
  messagesMap: Record<string, MessagesItem> = {}
  activeConversationId: string | null = null
  p2pReceiptMap: Record<string, V2NIMP2PMessageReadReceipt> = {}
  teamReceiptMap: Record<string, Record<string, V2NIMTeamMessageReadReceipt>> = {}
  revokedMessageMap: Record<string, Record<string, string>> = {}
  revokedMessageTimeMap: Record<string, Record<string, number>> = {}
  pinnedMessageMap: Record<string, Record<string, V2NIMMessagePin>> = {}
  antispamMessageMap: Record<string, Record<string, string>> = {}
  sentReadReceiptMap: Record<string, Record<string, boolean>> = {}
  attachmentUploadProgressMap: Record<string, Record<string, number>> = {}
  videoUploadPreviewMap: Record<string, Record<string, string>> = {}
  resendingMessageMap: Record<string, boolean> = {}
  replySourceMessageMap: Record<string, Record<string, V2NIMMessage>> = {}
  recentForwardConversationIds: string[] = []
  recentForwardAccountId: string | null = null
  private pinnedMessageLoadPromiseByConversationId = new Map<string, Promise<V2NIMMessage[]>>()
  private replySourceHydrationPromiseByKey = new Map<string, Promise<V2NIMMessage[]>>()

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true })
  }

  resetState() {
    runInAction(() => {
      this.messagesMap = {}
      this.activeConversationId = null
      this.p2pReceiptMap = {}
      this.teamReceiptMap = {}
      this.revokedMessageMap = {}
      this.revokedMessageTimeMap = {}
      this.pinnedMessageMap = {}
      this.antispamMessageMap = {}
      this.sentReadReceiptMap = {}
      this.attachmentUploadProgressMap = {}
      this.videoUploadPreviewMap = {}
      this.resendingMessageMap = {}
      this.replySourceMessageMap = {}
      this.recentForwardConversationIds = []
      this.recentForwardAccountId = null
    })
    this.pinnedMessageLoadPromiseByConversationId.clear()
    this.replySourceHydrationPromiseByKey.clear()
  }

  private getForwardHistoryStorageKey(accountId: string) {
    return `${NIMConfig.storageKeys.forwardHistory}.${accountId}`
  }

  private chunkMessages<T>(items: T[], size: number) {
    const chunks: T[][] = []
    for (let index = 0; index < items.length; index += size) {
      chunks.push(items.slice(index, index + size))
    }
    return chunks
  }

  private getRefreshableOutgoingTeamMessages(messages: V2NIMMessage[]) {
    const accountId = nimStore.getLoginUser()

    if (!accountId) {
      return []
    }

    return messages.filter(
      (message) =>
        message.conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM &&
        message.senderId === accountId &&
        message.sendingState === V2NIMMessageSendingState.V2NIM_MESSAGE_SENDING_STATE_SUCCEEDED
    )
  }

  private async refreshHistoryBatchTeamReadReceipts(messages: V2NIMMessage[]) {
    const outgoingMessages = this.getRefreshableOutgoingTeamMessages(messages)
    const deduplicatedMessages = Array.from(
      new Map(
        outgoingMessages.map((message) => [this.getReadReceiptKey(message), message] as const)
      ).values()
    )

    if (deduplicatedMessages.length === 0) {
      return []
    }

    return this.refreshTeamReadReceipts(deduplicatedMessages)
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

  async rememberRecentForwardConversation(conversationId: string) {
    await this.rememberForwardConversation(conversationId)
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

  private getMessageKeyCandidates(
    message: Pick<V2NIMMessage, 'messageClientId' | 'messageServerId'>
  ) {
    return this.getMessageReferKeys(message)
  }

  private getMessageKeyCandidatesWithFallback(message: V2NIMMessage) {
    return Array.from(
      new Set([
        ...this.getMessageKeyCandidates(message),
        `${message.senderId || ''}:${message.receiverId || ''}:${message.createTime || 0}`
      ])
    ).filter(Boolean)
  }

  private pickOlderHistoryAnchor(
    currentAnchor: V2NIMMessage | null,
    candidateAnchor: V2NIMMessage | null
  ) {
    if (!candidateAnchor) {
      return currentAnchor
    }

    if (!currentAnchor) {
      return candidateAnchor
    }

    if (candidateAnchor.createTime < currentAnchor.createTime) {
      return candidateAnchor
    }

    return currentAnchor
  }

  private getMessageReferKeys(
    refer?: Partial<Pick<V2NIMMessage, 'messageClientId' | 'messageServerId'>>
  ) {
    return Array.from(
      new Set(
        [refer?.messageClientId, refer?.messageServerId].filter((key): key is string => !!key)
      )
    )
  }

  private getMessageOperationKey(conversationId: string, messageKey: string) {
    return `${conversationId}:${messageKey}`
  }

  private isMessageResending(conversationId: string, messageKey: string) {
    return !!this.resendingMessageMap[this.getMessageOperationKey(conversationId, messageKey)]
  }

  private setMessageResending(conversationId: string, messageKey: string, active: boolean) {
    const operationKey = this.getMessageOperationKey(conversationId, messageKey)

    runInAction(() => {
      if (active) {
        this.resendingMessageMap[operationKey] = true
        return
      }

      delete this.resendingMessageMap[operationKey]
    })
  }

  private parseJsonObject(value?: string | null) {
    if (!value) {
      return {}
    }

    try {
      const parsed = JSON.parse(value)
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : {}
    } catch {
      return {}
    }
  }

  private normalizeRevokeTime(value: unknown) {
    const timestamp = typeof value === 'number' ? value : Number(value)

    if (!Number.isFinite(timestamp) || timestamp <= 0) {
      return null
    }

    return timestamp < 10_000_000_000 ? timestamp * 1000 : timestamp
  }

  private getRevokeExtension(notification: V2NIMMessageRevokeNotification) {
    return this.parseJsonObject(notification.serverExtension)
  }

  private getMessageExtension(message: V2NIMMessage) {
    const localExtension = this.parseJsonObject(
      (message as V2NIMMessage & { localExtension?: string | null }).localExtension
    )
    const serverExtension = this.parseJsonObject(message.serverExtension)

    return {
      ...serverExtension,
      ...localExtension
    }
  }

  private getRevokeContentFromExtension(extension: Record<string, unknown>) {
    const content =
      extension[REVOKE_LOCAL_MESSAGE_CONTENT] ?? extension[REVOKE_LOCAL_MESSAGE_CONTENT_ANDROID]

    return typeof content === 'string' ? content : ''
  }

  private getRevokedTextForMessage(message: V2NIMMessage) {
    return message.senderId === nimStore.getLoginUser()
      ? translateCurrentApp('commonRecallByYou')
      : translateCurrentApp('commonRecalledMessage')
  }

  private ensureRevokeMaps(conversationId: string) {
    if (!this.revokedMessageMap[conversationId]) {
      this.revokedMessageMap[conversationId] = {}
    }
    if (!this.revokedMessageTimeMap[conversationId]) {
      this.revokedMessageTimeMap[conversationId] = {}
    }
  }

  private hydrateRevokeStateFromMessage(message: V2NIMMessage) {
    const extension = this.getMessageExtension(message)

    if (extension[REVOKE_LOCAL_MESSAGE] !== true) {
      return message
    }

    const messageKeys = this.getMessageKeyCandidates(message)

    if (messageKeys.length === 0) {
      return message
    }

    const conversationId = message.conversationId
    this.ensureRevokeMaps(conversationId)

    const revokeTime =
      this.normalizeRevokeTime(extension[REVOKE_LOCAL_MESSAGE_TIME]) || message.createTime
    const revokedText = this.getRevokedTextForMessage(message)

    messageKeys.forEach((messageKey) => {
      this.revokedMessageMap[conversationId][messageKey] = revokedText
      this.revokedMessageTimeMap[conversationId][messageKey] = revokeTime
    })

    const revokedContent = this.getRevokeContentFromExtension(extension)

    if (
      revokedContent &&
      message.senderId === nimStore.getLoginUser() &&
      message.messageType !== V2NIMMessageType.V2NIM_MESSAGE_TYPE_TEXT
    ) {
      return {
        ...message,
        messageType: V2NIMMessageType.V2NIM_MESSAGE_TYPE_TEXT,
        text: revokedContent
      }
    }

    return message
  }

  private getRevokeTimeFromNotification(notification: V2NIMMessageRevokeNotification) {
    const extension = this.getRevokeExtension(notification)
    return (
      this.normalizeRevokeTime(extension[REVOKE_LOCAL_MESSAGE_TIME]) ||
      this.normalizeRevokeTime(
        (notification as V2NIMMessageRevokeNotification & { createTime?: number }).createTime
      ) ||
      Date.now()
    )
  }

  private buildRevokeServerExtension(message: V2NIMMessage, revokeTime: number) {
    const extension = this.parseJsonObject(message.serverExtension)

    extension[REVOKE_LOCAL_MESSAGE] = true
    extension[REVOKE_LOCAL_MESSAGE_TIME] = revokeTime / 1000

    if (message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_TEXT && message.text) {
      extension[REVOKE_LOCAL_MESSAGE_CONTENT] = message.text
    }

    return JSON.stringify(extension)
  }

  private getReadReceiptKey(message: V2NIMMessage) {
    return this.getMessageKeyCandidatesWithFallback(message)[0]
  }

  private isReadReceiptSent(message: V2NIMMessage) {
    const sentMap = this.sentReadReceiptMap[message.conversationId]

    return (
      !!sentMap && this.getMessageKeyCandidatesWithFallback(message).some((key) => sentMap[key])
    )
  }

  private markReadReceiptSent(messages: V2NIMMessage[]) {
    runInAction(() => {
      messages.forEach((message) => {
        if (!this.sentReadReceiptMap[message.conversationId]) {
          this.sentReadReceiptMap[message.conversationId] = {}
        }

        this.getMessageKeyCandidatesWithFallback(message).forEach((key) => {
          this.sentReadReceiptMap[message.conversationId][key] = true
        })
      })
    })
  }

  private isRevokedRefer(
    conversationId: string,
    refer?: Partial<Pick<V2NIMMessage, 'messageClientId' | 'messageServerId'>>
  ) {
    const revokedMap = this.revokedMessageMap[conversationId]

    if (!revokedMap || !refer) {
      return false
    }

    return this.getMessageReferKeys(refer).some((key) => !!revokedMap[key])
  }

  private getReadableIncomingMessages(conversationId: string, messages: V2NIMMessage[]) {
    const accountId = nimStore.getLoginUser()

    if (!accountId) {
      return []
    }

    return messages.filter(
      (message) =>
        message.conversationId === conversationId &&
        !!message.senderId &&
        message.senderId !== accountId &&
        message.messageType !== V2NIMMessageType.V2NIM_MESSAGE_TYPE_NOTIFICATION &&
        message.messageType !== V2NIMMessageType.V2NIM_MESSAGE_TYPE_TIPS &&
        !this.isReadReceiptSent(message)
    )
  }

  private getTeamReceiptMessages(messages: V2NIMMessage[]) {
    return messages.filter(
      (message) =>
        message.conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM &&
        !!this.getMessageKey(message) &&
        message.messageType !== V2NIMMessageType.V2NIM_MESSAGE_TYPE_NOTIFICATION &&
        message.messageType !== V2NIMMessageType.V2NIM_MESSAGE_TYPE_TIPS
    )
  }

  private async sendReadReceiptsForMessages(conversationId: string, messages: V2NIMMessage[]) {
    const incomingCount = messages.filter(
      (message) =>
        message.conversationId === conversationId && message.senderId !== nimStore.getLoginUser()
    ).length
    const incomingMessages = this.getReadableIncomingMessages(conversationId, messages)
    const result: ReadReceiptSendResult = {
      sent: false,
      incomingCount,
      readableCount: incomingMessages.length
    }

    if (!incomingMessages.length) {
      return result
    }

    const nim = nimStore.nim!
    const latestIncoming = incomingMessages[incomingMessages.length - 1]

    if (latestIncoming.conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P) {
      await nim.V2NIMMessageService.sendP2PMessageReceipt(latestIncoming)
      this.markReadReceiptSent([latestIncoming])
      return {
        ...result,
        sent: true
      }
    }

    const teamMessages = this.getTeamReceiptMessages(incomingMessages).slice(-50)

    if (teamMessages.length > 0) {
      await nim.V2NIMMessageService.sendTeamMessageReceipts(teamMessages)
      this.markReadReceiptSent(teamMessages)
      return {
        ...result,
        sent: true
      }
    }

    return result
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
      ) ||
      (refer.messageClientId
        ? this.replySourceMessageMap[conversationId]?.[refer.messageClientId]
        : null) ||
      (refer.messageServerId
        ? this.replySourceMessageMap[conversationId]?.[refer.messageServerId]
        : null) ||
      null
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

  private refreshMessageReferenceByRefer(
    conversationId: string,
    refer?: Partial<Pick<V2NIMMessage, 'messageClientId' | 'messageServerId'>>
  ) {
    const current = this.messagesMap[conversationId]

    if (!current || !refer) {
      return
    }

    let hasChanged = false
    const nextList = current.list.map((message) => {
      const matched =
        (!!refer.messageClientId && message.messageClientId === refer.messageClientId) ||
        (!!refer.messageServerId && message.messageServerId === refer.messageServerId)

      if (!matched) {
        return message
      }

      hasChanged = true
      return { ...message }
    })

    if (hasChanged) {
      current.list = nextList
    }
  }

  private removePinnedMessageByRefer(
    conversationId: string,
    refer?: Partial<Pick<V2NIMMessage, 'messageClientId' | 'messageServerId'>>
  ) {
    const pinMap = this.pinnedMessageMap[conversationId]

    if (!pinMap || !refer) {
      return
    }

    this.getMessageReferKeys(refer).forEach((key) => {
      delete pinMap[key]
    })

    Object.entries(pinMap).forEach(([key, pin]) => {
      const matched =
        (!!refer.messageClientId && pin.messageRefer.messageClientId === refer.messageClientId) ||
        (!!refer.messageServerId && pin.messageRefer.messageServerId === refer.messageServerId)

      if (matched) {
        delete pinMap[key]
      }
    })
  }

  private removeRevokedPinnedMessages(conversationId: string) {
    const pinMap = this.pinnedMessageMap[conversationId]

    if (!pinMap) {
      return
    }

    Object.entries(pinMap).forEach(([key, pin]) => {
      if (this.isRevokedRefer(conversationId, pin.messageRefer)) {
        delete pinMap[key]
      }
    })
  }

  private normalizeForwardMessage(message: V2NIMMessage) {
    delete message.threadReply
    return message
  }

  createCollectionForwardSourceMessage(message: V2NIMMessage) {
    if (!nimStore.nim) {
      return null
    }

    if (message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_TEXT) {
      return nimStore.nim.V2NIMMessageCreator.createTextMessage(message.text || '')
    }

    if (message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_IMAGE) {
      const attachment = message.attachment as V2NIMMessageImageAttachment | undefined
      const source = attachment?.path || attachment?.url

      if (!source) {
        return null
      }

      const forwardSource = nimStore.nim.V2NIMMessageCreator.createImageMessage(
        source,
        attachment?.name || 'image.jpg',
        undefined,
        attachment?.width,
        attachment?.height
      )
      forwardSource.attachment = attachment
      return forwardSource
    }

    if (message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_VIDEO) {
      const attachment = message.attachment as V2NIMMessageFileAttachment | undefined
      const source = attachment?.path || attachment?.url

      if (!source) {
        return null
      }

      const forwardSource = nimStore.nim.V2NIMMessageCreator.createVideoMessage(
        source,
        attachment?.name || 'video.mp4'
      )
      forwardSource.attachment = attachment
      return forwardSource
    }

    if (message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_FILE) {
      const attachment = message.attachment as V2NIMMessageFileAttachment | undefined
      const source = attachment?.path || attachment?.url

      if (!source) {
        return null
      }

      const forwardSource = nimStore.nim.V2NIMMessageCreator.createFileMessage(
        source,
        attachment?.name || 'file'
      )
      forwardSource.attachment = attachment
      return forwardSource
    }

    if (message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_LOCATION) {
      const attachment = message.attachment as V2NIMMessageLocationAttachment | undefined

      if (typeof attachment?.latitude !== 'number' || typeof attachment?.longitude !== 'number') {
        return null
      }

      const forwardSource = nimStore.nim.V2NIMMessageCreator.createLocationMessage(
        attachment.latitude,
        attachment.longitude,
        attachment.address || message.text || ''
      )
      forwardSource.text = message.text || attachment.address || ''
      forwardSource.attachment = attachment
      return forwardSource
    }

    if (message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_CUSTOM) {
      const attachment = message.attachment as V2NIMMessageCustomAttachment | undefined
      const raw = attachment?.raw

      if (!raw) {
        return null
      }

      const forwardSource = nimStore.nim.V2NIMMessageCreator.createCustomMessage(
        message.text || '',
        raw
      )
      forwardSource.attachment = attachment
      return forwardSource
    }

    return null
  }

  private getPushPreview(message: V2NIMMessage) {
    switch (message.messageType) {
      case V2NIMMessageType.V2NIM_MESSAGE_TYPE_TEXT:
        return message.text || translateCurrentApp('commonReceiveNewMessage')
      case V2NIMMessageType.V2NIM_MESSAGE_TYPE_IMAGE:
        return translateCurrentApp('commonImageShort')
      case V2NIMMessageType.V2NIM_MESSAGE_TYPE_AUDIO:
        return translateCurrentApp('commonAudioShort')
      case V2NIMMessageType.V2NIM_MESSAGE_TYPE_LOCATION:
        return translateCurrentApp('commonLocationShort')
      case V2NIMMessageType.V2NIM_MESSAGE_TYPE_FILE:
        return translateCurrentApp('commonFileShort')
      default:
        return translateCurrentApp('commonReceiveNewMessage')
    }
  }

  private canUseMessageService() {
    return !!nimStore.nim && nimStore.isLoggedIn()
  }

  private ensureSendReady() {
    if (!nimStore.nim) {
      throw new Error(translateCurrentApp('offlineText' as never))
    }

    if (!this.canUseMessageService()) {
      throw new Error(translateCurrentApp('connectingText' as never))
    }

    if (!nimStore.isConnected()) {
      throw new Error(translateCurrentApp('connectingText' as never))
    }
  }

  private async waitForSendReady() {
    try {
      await nimStore.waitForSendReady()
    } catch (error) {
      this.ensureSendReady()
      throw error
    }

    this.ensureSendReady()
  }

  private async waitForNativeSendStateSettled(delayMs = 500) {
    await new Promise<void>((resolve) => {
      setTimeout(resolve, delayMs)
    })
  }

  private isIllegalStateError(error: unknown) {
    return error instanceof Error && error.message.toLowerCase().includes('illegal state')
  }

  private async toSettledResult<T>(promise: Promise<T>): Promise<PromiseSettledResult<T>> {
    try {
      return {
        status: 'fulfilled',
        value: await promise
      }
    } catch (reason) {
      return {
        status: 'rejected',
        reason
      }
    }
  }

  private buildSendParams(conversationId: string, message: V2NIMMessage): V2NIMSendMessageParams {
    const pushPayload = nimStore.nim ? buildPushPayload(conversationId, nimStore.nim) : undefined
    const aiConfig = this.getAIConfig(conversationId, message)
    const mentionPushInfo =
      message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_TEXT
        ? getMentionPushInfo(message.text || '', parseMentionExtension(message.serverExtension))
        : null

    return {
      messageConfig: {
        readReceiptEnabled: preferenceStore.preferences.readReceiptEnabled
      },
      pushConfig: {
        pushEnabled: true,
        pushNickEnabled: true,
        pushPayload,
        pushContent: this.getPushPreview(message),
        ...mentionPushInfo
      },
      aiConfig,
      clientAntispamEnabled: message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_TEXT,
      clientAntispamReplace: '***'
    }
  }

  private applyTextMessageOptions(message: V2NIMMessage, options?: TextMessageOptions) {
    const serverExtension = buildMentionExtension(
      message.text || '',
      options?.mentions || {},
      options?.serverExtension || message.serverExtension
    )

    if (serverExtension) {
      message.serverExtension = serverExtension
    }

    return message
  }

  private getConversationTargetId(conversationId: string) {
    if (!nimStore.nim) {
      return null
    }

    return nimStore.nim.V2NIMConversationIdUtil.parseConversationTargetId(conversationId)
  }

  isAIConversation(conversationId: string) {
    const targetId = this.getConversationTargetId(conversationId)

    if (!targetId) {
      return false
    }

    return imStoreV2Bridge.aiUsers.some((item) => item.accountId === targetId)
  }

  private getAIConversationContext(conversationId: string, myAccountId: string) {
    const history = (this.messagesMap[conversationId]?.list || [])
      .filter(
        (item) =>
          item.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_TEXT && !!item.text?.trim()
      )
      .slice(-AI_MESSAGE_LIMIT)

    const myFirstMessageIndex = history.findIndex((item) => item.senderId === myAccountId)
    const effectiveHistory = myFirstMessageIndex === -1 ? [] : history.slice(myFirstMessageIndex)

    return effectiveHistory.map((item) => ({
      role:
        item.senderId === myAccountId
          ? ('user' as V2NIMAIModelRoleType)
          : ('assistant' as V2NIMAIModelRoleType),
      msg: item.text || '',
      type: 0
    }))
  }

  private getAIConfig(
    conversationId: string,
    message: V2NIMMessage
  ): V2NIMMessageAIConfigParams | undefined {
    if (!this.isAIConversation(conversationId)) {
      return undefined
    }

    const accountId = this.getConversationTargetId(conversationId)
    const myAccountId = nimStore.getLoginUser()

    if (!accountId) {
      return undefined
    }

    const aiConfig: V2NIMMessageAIConfigParams = {
      accountId
    }

    if (message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_TEXT) {
      aiConfig.content = {
        msg: message.text || '',
        type: 0
      }

      if (message.threadReply) {
        const replyMessage = this.getMessageByRefer(conversationId, message.threadReply)

        if (replyMessage && replyMessage.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_TEXT) {
          aiConfig.messages = [
            {
              role: 'user' as V2NIMAIModelRoleType,
              msg: replyMessage.text || '',
              type: 0
            }
          ]
        }
      } else if (myAccountId) {
        aiConfig.messages = this.getAIConversationContext(conversationId, myAccountId)
      }
    }

    return aiConfig
  }

  private setAntispamReason(message: V2NIMMessage, reason: string) {
    const keys = this.getMessageKeyCandidatesWithFallback(message)

    runInAction(() => {
      if (!this.antispamMessageMap[message.conversationId]) {
        this.antispamMessageMap[message.conversationId] = {}
      }

      keys.forEach((key) => {
        this.antispamMessageMap[message.conversationId][key] = reason
      })
    })
  }

  private clearAntispamReason(conversationId: string, messageId?: string | null) {
    if (!messageId) {
      return
    }

    runInAction(() => {
      delete this.antispamMessageMap[conversationId]?.[messageId]
    })
  }

  private migrateAntispamReason(
    conversationId: string,
    previousMessage: Pick<V2NIMMessage, 'messageClientId' | 'messageServerId'>,
    nextMessage: Pick<V2NIMMessage, 'messageClientId' | 'messageServerId'>
  ) {
    const antispamMap = this.antispamMessageMap[conversationId]

    if (!antispamMap) {
      return
    }

    const previousKeys = this.getMessageKeyCandidatesWithFallback(previousMessage as V2NIMMessage)
    const nextKeys = this.getMessageKeyCandidatesWithFallback(nextMessage as V2NIMMessage)
    const reason = previousKeys.map((key) => antispamMap[key]).find((value) => !!value)

    if (!reason) {
      return
    }

    runInAction(() => {
      nextKeys.forEach((key) => {
        antispamMap[key] = reason
      })

      previousKeys
        .filter((key) => !nextKeys.includes(key))
        .forEach((key) => {
          delete antispamMap[key]
        })
    })
  }

  private extractAntispamLabelCode(reason?: string) {
    const normalizedReason = reason?.replace(/\\/g, '').trim()

    if (!normalizedReason) {
      return null
    }

    try {
      const parsed = JSON.parse(normalizedReason) as unknown
      const stack = [parsed]

      while (stack.length > 0) {
        const current = stack.shift()

        if (!current || typeof current !== 'object') {
          continue
        }

        if (Array.isArray(current)) {
          stack.push(...current)
          continue
        }

        const objectValue = current as Record<string, unknown>
        const label = objectValue.label

        if (typeof label === 'number' || typeof label === 'string') {
          return String(label)
        }

        stack.push(...Object.values(objectValue))
      }
    } catch {
      // Fall back to the native-compatible regex path below.
    }

    return normalizedReason.match(/"label"\s*:\s*(\d+)/)?.[1] || null
  }

  private createAntispamTipText(reason?: string) {
    const labelCode = this.extractAntispamLabelCode(reason)
    const categoryKey = labelCode ? ANTISPAM_LABEL_KEY_MAP[labelCode] : null
    const category = translateCurrentApp((categoryKey || 'commonAntispamOther') as never)

    return translateCurrentApp('commonSensitiveContentBlockedWithType' as never, {
      type: category
    })
  }

  private getSendResultAntispamReason(result: { antispamResult?: string } | null | undefined) {
    if (!result?.antispamResult?.trim()) {
      return null
    }

    return this.createAntispamTipText(result.antispamResult)
  }

  private isAttachmentUploadMessage(message: V2NIMMessage) {
    return [
      V2NIMMessageType.V2NIM_MESSAGE_TYPE_IMAGE,
      V2NIMMessageType.V2NIM_MESSAGE_TYPE_VIDEO,
      V2NIMMessageType.V2NIM_MESSAGE_TYPE_FILE,
      V2NIMMessageType.V2NIM_MESSAGE_TYPE_AUDIO
    ].includes(message.messageType)
  }

  private setAttachmentUploadProgress(
    conversationId: string,
    messageKey: string,
    progress: number
  ) {
    const normalizedProgress = Math.max(0, Math.min(1, progress))

    runInAction(() => {
      if (!this.attachmentUploadProgressMap[conversationId]) {
        this.attachmentUploadProgressMap[conversationId] = {}
      }

      this.attachmentUploadProgressMap[conversationId][messageKey] = normalizedProgress
    })
  }

  private clearAttachmentUploadProgress(conversationId: string, messageKey: string) {
    runInAction(() => {
      delete this.attachmentUploadProgressMap[conversationId]?.[messageKey]
    })
  }

  private setVideoUploadPreview(conversationId: string, messageKey: string, previewUri?: string) {
    if (!previewUri) {
      return
    }

    runInAction(() => {
      if (!this.videoUploadPreviewMap[conversationId]) {
        this.videoUploadPreviewMap[conversationId] = {}
      }

      this.videoUploadPreviewMap[conversationId][messageKey] = previewUri
    })
  }

  private clearVideoUploadPreview(conversationId: string, messageKey: string) {
    runInAction(() => {
      delete this.videoUploadPreviewMap[conversationId]?.[messageKey]
    })
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

  private isBlockedSendFailure(message: V2NIMMessage) {
    return message.messageStatus?.errorCode === BLACKLIST_SEND_ERROR_CODE
  }

  private extractErrorCode(error: unknown) {
    if (!error || typeof error !== 'object') {
      return undefined
    }

    const candidate = error as {
      code?: unknown
      errorCode?: unknown
    }
    const code = candidate.errorCode ?? candidate.code

    return typeof code === 'number' ? code : undefined
  }

  shouldSuppressSendFailureAlert(error: unknown) {
    const errorCode = this.extractErrorCode(error)

    if (errorCode === BLACKLIST_SEND_ERROR_CODE || errorCode === FRIEND_DELETED_SEND_ERROR_CODE) {
      return true
    }

    return !!this.extractAntispamReason(error)
  }

  private hydrateDraftMessage(conversationId: string, draftMessage: V2NIMMessage) {
    if (!nimStore.nim) {
      return draftMessage
    }

    const conversationType =
      draftMessage.conversationType ||
      nimStore.nim.V2NIMConversationIdUtil.parseConversationType(conversationId)
    const targetId = nimStore.nim.V2NIMConversationIdUtil.parseConversationTargetId(conversationId)

    return {
      ...draftMessage,
      conversationId,
      conversationType,
      receiverId: draftMessage.receiverId || targetId,
      senderId: draftMessage.senderId || nimStore.getLoginUser() || draftMessage.senderId,
      createTime: draftMessage.createTime || Date.now()
    } as V2NIMMessage
  }

  private mergeMessages(existing: V2NIMMessage[], incoming: V2NIMMessage[]) {
    const merged = new Map<string, V2NIMMessage>()
    const aliasToPrimaryKey = new Map<string, string>()

    const bindMessage = (message: V2NIMMessage, preferredPrimaryKey?: string) => {
      const keyCandidates = this.getMessageKeyCandidatesWithFallback(message)
      const matchedPrimaryKey = keyCandidates.find((candidate) => aliasToPrimaryKey.has(candidate))
      const primaryKey = preferredPrimaryKey || matchedPrimaryKey || keyCandidates[0]

      if (!primaryKey) {
        return
      }

      merged.set(primaryKey, message)
      keyCandidates.forEach((candidate) => {
        aliasToPrimaryKey.set(candidate, primaryKey)
      })
    }

    existing.forEach((message) => {
      const hydratedMessage = this.hydrateRevokeStateFromMessage(message)
      bindMessage(hydratedMessage)
    })

    incoming.forEach((message) => {
      const recallType = (message as V2NIMMessage & { recallType?: string }).recallType

      if (recallType === 'reCallMsg' || recallType === 'beReCallMsg') {
        const originalKey = this.getMessageKey(message).replace(/^recall-/, '')
        const oldText = (message as V2NIMMessage & { oldText?: string }).oldText

        if (!this.revokedMessageMap[message.conversationId]) {
          this.revokedMessageMap[message.conversationId] = {}
        }
        if (!this.revokedMessageTimeMap[message.conversationId]) {
          this.revokedMessageTimeMap[message.conversationId] = {}
        }

        this.revokedMessageMap[message.conversationId][originalKey] =
          recallType === 'reCallMsg'
            ? translateCurrentApp('commonRecallByYou')
            : translateCurrentApp('commonRecalledMessage')
        this.revokedMessageTimeMap[message.conversationId][originalKey] =
          this.normalizeRevokeTime(
            (message as V2NIMMessage & { recallTime?: number; revokeTime?: number }).revokeTime ??
              (message as V2NIMMessage & { recallTime?: number; revokeTime?: number }).recallTime
          ) || message.createTime

        if (oldText) {
          bindMessage(
            {
              ...message,
              messageClientId: originalKey,
              messageType: V2NIMMessageType.V2NIM_MESSAGE_TYPE_TEXT,
              text: oldText
            },
            originalKey
          )
        }

        if (!oldText && !merged.has(originalKey)) {
          bindMessage(
            {
              ...message,
              messageClientId: originalKey,
              messageType: V2NIMMessageType.V2NIM_MESSAGE_TYPE_TIPS,
              text:
                recallType === 'reCallMsg'
                  ? translateCurrentApp('commonRecallByYou')
                  : translateCurrentApp('commonRecalledMessage')
            },
            originalKey
          )
        }

        return
      }

      const hydratedMessage = this.hydrateRevokeStateFromMessage(message)
      bindMessage(hydratedMessage)
    })

    return Array.from(merged.values())
      .filter((message) => !message.isDelete)
      .sort((left, right) => left.createTime - right.createTime)
  }

  private updateHistoryAnchor(
    conversationId: string,
    candidateAnchor: V2NIMMessage | null,
    { reset = false }: { reset?: boolean } = {}
  ) {
    const current = this.ensureConversationState(conversationId)

    current.historyAnchor = reset
      ? candidateAnchor
      : this.pickOlderHistoryAnchor(current.historyAnchor, candidateAnchor)
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

  private updateMessageInPlace(
    conversationId: string,
    messageKey: string,
    updater: (message: V2NIMMessage) => V2NIMMessage
  ) {
    this.updateMessage(
      conversationId,
      (message) => this.getMessageKey(message) === messageKey,
      updater
    )
  }

  private replaceMessageAndSort(
    conversationId: string,
    messageKey: string,
    nextMessage: V2NIMMessage
  ) {
    runInAction(() => {
      const current = this.messagesMap[conversationId]

      if (!current) {
        return
      }

      current.list = current.list
        .map((message) => (this.getMessageKey(message) === messageKey ? nextMessage : message))
        .sort((left, right) => left.createTime - right.createTime)
    })

    this.syncConversationPreview(conversationId)
  }

  private hasPersistedRevokeMarker(message: V2NIMMessage) {
    return this.getMessageExtension(message)[REVOKE_LOCAL_MESSAGE] === true
  }

  private shouldRetainLocalMessageWhenReplacingHistory(message: V2NIMMessage) {
    return (
      message.sendingState === V2NIMMessageSendingState.V2NIM_MESSAGE_SENDING_STATE_FAILED ||
      message.sendingState === V2NIMMessageSendingState.V2NIM_MESSAGE_SENDING_STATE_SENDING ||
      !!this.getRevokedText(message) ||
      this.hasPersistedRevokeMarker(message)
    )
  }

  private getLocalRetainedMessages(conversationId: string) {
    return (this.messagesMap[conversationId]?.list || []).filter(
      this.shouldRetainLocalMessageWhenReplacingHistory
    )
  }

  private mergeServerMessagesWithLocalUnsent(
    conversationId: string,
    serverMessages: V2NIMMessage[]
  ) {
    const localRetainedMessages = this.getLocalRetainedMessages(conversationId)

    if (localRetainedMessages.length === 0) {
      return this.mergeMessages([], serverMessages)
    }

    return this.mergeMessages([], [...serverMessages, ...localRetainedMessages])
  }

  private applySendFailure(conversationId: string, messageKey: string, error: unknown) {
    const antispamReason = this.extractAntispamReason(error)
    const errorCode = this.extractErrorCode(error)

    this.updateMessageInPlace(conversationId, messageKey, (message) => ({
      ...message,
      messageStatus: errorCode
        ? {
            ...message.messageStatus,
            errorCode
          }
        : message.messageStatus,
      sendingState: V2NIMMessageSendingState.V2NIM_MESSAGE_SENDING_STATE_FAILED
    }))

    const failedMessage = this.getMessageById(conversationId, messageKey)

    if (antispamReason && failedMessage) {
      this.setAntispamReason(failedMessage, antispamReason)
    }

    if (errorCode === BLACKLIST_SEND_ERROR_CODE) {
      this.appendLocalTipsMessage(conversationId, BLACKLIST_SEND_TIP())
    }

    if (errorCode === FRIEND_DELETED_SEND_ERROR_CODE) {
      this.appendLocalTipsMessage(conversationId, FRIEND_DELETED_SEND_TIP())
    }
  }

  private syncConversationPreview(conversationId: string) {
    if (!conversationId) {
      return
    }

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

    if (
      latestMessage.sendingState === V2NIMMessageSendingState.V2NIM_MESSAGE_SENDING_STATE_FAILED
    ) {
      const failedPreviewText = this.isBlockedSendFailure(latestMessage)
        ? translateCurrentApp('messageStoreReminderMessage')
        : normalizeDisplayErrorMessage(latestMessage.text || '') ||
          translateCurrentApp('commonSendFailedShort')

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
          text: failedPreviewText
        } as never
      })
      return
    }

    const messageKey = this.getMessageKey(latestMessage)
    const revokedText = this.revokedMessageMap[conversationId]?.[messageKey]

    if (revokedText) {
      conversationStore.updateConversation(conversationId, {
        sortOrder: latestMessage.createTime,
        lastMessage: {
          lastMessageState: LAST_MESSAGE_STATE_REVOKE,
          messageRefer: {
            conversationId,
            conversationType: latestMessage.conversationType,
            receiverId: latestMessage.receiverId,
            senderId: latestMessage.senderId,
            createTime: latestMessage.createTime
          },
          messageType: V2NIMMessageType.V2NIM_MESSAGE_TYPE_TIPS,
          text: translateCurrentApp('commonRecalledMessage')
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
        text:
          latestMessage.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_TIPS
            ? normalizeDisplayErrorMessage(latestMessage.text || '') || latestMessage.text
            : latestMessage.text,
        attachment: latestMessage.attachment,
        subType: latestMessage.subType
      } as never
    })
  }

  private async performSend(
    conversationId: string,
    draftMessage: V2NIMMessage,
    sender: (progress: (percentage: number) => void) => Promise<SendMessageResult>,
    options?: PerformSendOptions
  ) {
    const hydratedDraftMessage = this.hydrateDraftMessage(conversationId, draftMessage)
    const draftMessageKey = this.getMessageKey(hydratedDraftMessage)
    const isAudioMessage =
      hydratedDraftMessage.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_AUDIO
    const debugTraceId = options?.debugTraceId

    if (isAudioMessage) {
      logIOSVoiceDebug('store.audio.perform.start', {
        traceId: debugTraceId,
        conversationId,
        draftMessageKey,
        draftMessage: getAudioMessageDebugPayload(hydratedDraftMessage)
      })
    }

    this.addMessage({
      ...hydratedDraftMessage,
      sendingState: V2NIMMessageSendingState.V2NIM_MESSAGE_SENDING_STATE_SENDING
    })

    if (this.isAttachmentUploadMessage(hydratedDraftMessage)) {
      this.setAttachmentUploadProgress(conversationId, draftMessageKey, 0)
    }

    this.setVideoUploadPreview(conversationId, draftMessageKey, options?.videoUploadPreview)

    const clientAntispamReason = this.getClientAntispamReason(hydratedDraftMessage)

    if (clientAntispamReason) {
      this.updateMessage(
        conversationId,
        (message) => this.getMessageKey(message) === draftMessageKey,
        (message) => ({
          ...message,
          sendingState: V2NIMMessageSendingState.V2NIM_MESSAGE_SENDING_STATE_FAILED
        })
      )
      this.clearAttachmentUploadProgress(conversationId, draftMessageKey)
      this.clearVideoUploadPreview(conversationId, draftMessageKey)
      this.setAntispamReason(hydratedDraftMessage, clientAntispamReason)
      if (isAudioMessage) {
        logIOSVoiceDebug('store.audio.perform.blocked.clientAntispam', {
          traceId: debugTraceId,
          conversationId,
          draftMessageKey,
          reason: clientAntispamReason
        })
      }
      throw new Error(clientAntispamReason)
    }

    const sendWithProgress = () =>
      sender((percentage) => {
        if (isAudioMessage) {
          logIOSVoiceDebug('store.audio.upload.progress', {
            traceId: debugTraceId,
            conversationId,
            draftMessageKey,
            percentage
          })
        }
        this.setAttachmentUploadProgress(conversationId, draftMessageKey, percentage)
      })

    try {
      if (isAudioMessage) {
        logIOSVoiceDebug('store.audio.waitSendReady.start', {
          traceId: debugTraceId,
          conversationId,
          draftMessageKey
        })
      }
      await this.waitForSendReady()
      if (isAudioMessage) {
        logIOSVoiceDebug('store.audio.ensureCloudConversation.start', {
          traceId: debugTraceId,
          conversationId,
          draftMessageKey
        })
      }
      await imStoreV2Bridge.ensureCloudConversation(conversationId)
      let result: SendMessageResult

      try {
        if (isAudioMessage) {
          logIOSVoiceDebug('store.audio.sdkSend.start', {
            traceId: debugTraceId,
            conversationId,
            draftMessageKey
          })
        }
        result = await sendWithProgress()
      } catch (error) {
        if (isAudioMessage) {
          logIOSVoiceDebug('store.audio.sdkSend.error.first', {
            traceId: debugTraceId,
            conversationId,
            draftMessageKey,
            code: getVoiceStoreErrorCode(error),
            error: error instanceof Error ? error.message : String(error),
            illegalStateRetry: this.isIllegalStateError(error)
          })
        }
        const isTransientAudioUploadError =
          isAudioMessage && isTransientAndroidAudioUploadError(error)

        if (!this.isIllegalStateError(error) && !isTransientAudioUploadError) {
          throw error
        }

        await this.waitForNativeSendStateSettled(isTransientAudioUploadError ? 300 : 500)
        await this.waitForSendReady()
        if (isAudioMessage) {
          logIOSVoiceDebug('store.audio.sdkSend.retry', {
            traceId: debugTraceId,
            conversationId,
            draftMessageKey,
            reason: isTransientAudioUploadError ? 'transient-stream-closed' : 'illegal-state'
          })
        }
        result = await sendWithProgress()
      }

      if (isAudioMessage) {
        logIOSVoiceDebug('store.audio.sdkSend.done', {
          traceId: debugTraceId,
          conversationId,
          draftMessageKey,
          resultMessage: getAudioMessageDebugPayload(result.message),
          antispamResult: result.antispamResult
        })
      }

      const sendResultAntispamReason = this.getSendResultAntispamReason(result)

      if (sendResultAntispamReason) {
        const antispamError = createAntispamSendFailureError(
          sendResultAntispamReason,
          result.antispamResult
        )
        this.applySendFailure(conversationId, draftMessageKey, {
          antispamResult: result.antispamResult
        })
        this.clearAttachmentUploadProgress(conversationId, draftMessageKey)
        this.clearVideoUploadPreview(conversationId, draftMessageKey)
        if (isAudioMessage) {
          logIOSVoiceDebug('store.audio.perform.blocked.serverAntispam', {
            traceId: debugTraceId,
            conversationId,
            draftMessageKey,
            reason: sendResultAntispamReason,
            antispamResult: result.antispamResult
          })
        }
        throw antispamError
      }

      if (hasSendFailureResult(result.message)) {
        const sendFailureError = createSendFailureError(result.message, result)
        this.applySendFailure(conversationId, draftMessageKey, sendFailureError)
        this.clearAttachmentUploadProgress(conversationId, draftMessageKey)
        this.clearVideoUploadPreview(conversationId, draftMessageKey)
        if (isAudioMessage) {
          logIOSVoiceDebug('store.audio.perform.failed.server', {
            traceId: debugTraceId,
            conversationId,
            draftMessageKey,
            code: getVoiceStoreErrorCode(sendFailureError),
            resultMessage: getAudioMessageDebugPayload(result.message)
          })
        }
        throw sendFailureError
      }

      this.clearAntispamReason(conversationId, draftMessageKey)
      this.clearAttachmentUploadProgress(conversationId, draftMessageKey)
      this.clearVideoUploadPreview(conversationId, draftMessageKey)
      this.migrateAntispamReason(conversationId, hydratedDraftMessage, result.message)
      this.addMessage(result.message)
      if (isAudioMessage) {
        logIOSVoiceDebug('store.audio.perform.done', {
          traceId: debugTraceId,
          conversationId,
          draftMessageKey,
          resultMessageKey: this.getMessageKey(result.message),
          resultMessage: getAudioMessageDebugPayload(result.message)
        })
      }
      return result.message
    } catch (error) {
      if (isAudioMessage) {
        logIOSVoiceDebug('store.audio.perform.error', {
          traceId: debugTraceId,
          conversationId,
          draftMessageKey,
          code: getVoiceStoreErrorCode(error),
          error: error instanceof Error ? error.message : String(error),
          draftMessage: getAudioMessageDebugPayload(hydratedDraftMessage)
        })
      }
      if (!this.isAntispamBlocked(hydratedDraftMessage)) {
        this.applySendFailure(conversationId, draftMessageKey, error)
      }
      this.clearAttachmentUploadProgress(conversationId, draftMessageKey)
      this.clearVideoUploadPreview(conversationId, draftMessageKey)
      throw error
    }
  }

  getConversationMessages(conversationId: string): MessagesItem {
    return this.messagesMap[conversationId] || DEFAULT_MESSAGES_ITEM
  }

  getMessageById(conversationId: string, messageId: string) {
    return (
      this.messagesMap[conversationId]?.list.find(
        (message) =>
          message.messageClientId === messageId ||
          message.messageServerId === messageId ||
          this.getMessageKey(message) === messageId
      ) ||
      this.replySourceMessageMap[conversationId]?.[messageId] ||
      null
    )
  }

  getRevokedText(message: V2NIMMessage) {
    return this.revokedMessageMap[message.conversationId]?.[this.getMessageKey(message)] || null
  }

  getRevokeTime(message: V2NIMMessage) {
    const messageKey = this.getMessageKey(message)
    return this.revokedMessageTimeMap[message.conversationId]?.[messageKey] || null
  }

  canReeditRevokedMessage(message: V2NIMMessage) {
    if (!this.getRevokedText(message)) {
      return false
    }

    const revokeTime = this.getRevokeTime(message) || message.createTime
    return Date.now() - revokeTime <= REEDIT_TIME_LIMIT_MS
  }

  getAntispamReason(message: V2NIMMessage) {
    const antispamMap = this.antispamMessageMap[message.conversationId]

    if (!antispamMap) {
      return null
    }

    const matchedKey = this.getMessageKeyCandidatesWithFallback(message).find(
      (key) => !!antispamMap[key]
    )

    return matchedKey ? antispamMap[matchedKey] : null
  }

  getAttachmentUploadProgress(message: V2NIMMessage) {
    return this.attachmentUploadProgressMap[message.conversationId]?.[this.getMessageKey(message)]
  }

  getVideoUploadPreview(message: V2NIMMessage) {
    return this.videoUploadPreviewMap[message.conversationId]?.[this.getMessageKey(message)]
  }

  isAntispamBlocked(message: V2NIMMessage) {
    return !!this.getAntispamReason(message)
  }

  isMessagePinned(message: V2NIMMessage) {
    return !!this.getPinnedMessageInfo(message)
  }

  getPinnedMessageInfo(message: V2NIMMessage) {
    const pinMap = this.pinnedMessageMap[message.conversationId]

    if (!pinMap) {
      return null
    }

    if (this.isRevokedRefer(message.conversationId, message)) {
      return null
    }

    for (const key of this.getMessageReferKeys(message)) {
      if (pinMap[key]) {
        return pinMap[key]
      }
    }

    return null
  }

  getPinnedMessages(conversationId: string) {
    const pinMap = this.pinnedMessageMap[conversationId] || {}
    const seenPinKeys = new Set<string>()
    const pinnedMessagesByKey = new Map<string, V2NIMMessage>()

    Object.values(pinMap).forEach((pin) => {
      if (this.isRevokedRefer(conversationId, pin.messageRefer)) {
        return
      }

      const referKeys = this.getMessageReferKeys(pin.messageRefer)

      if (referKeys.some((key) => seenPinKeys.has(key))) {
        referKeys.forEach((key) => seenPinKeys.add(key))
        return
      }

      referKeys.forEach((key) => seenPinKeys.add(key))

      const message = this.getMessageByRefer(conversationId, pin.messageRefer)

      if (!message || this.isRevokedRefer(conversationId, message)) {
        return
      }

      const messageKey = this.getMessageKeyCandidatesWithFallback(message)[0]

      if (messageKey) {
        pinnedMessagesByKey.set(messageKey, message)
      }
    })

    return Array.from(pinnedMessagesByKey.values()).sort(
      (left, right) => (right.createTime || 0) - (left.createTime || 0)
    )
  }

  getTrackedPinnedConversationIds() {
    return Object.keys(this.pinnedMessageMap)
  }

  getLoadedConversationIds() {
    return Object.keys(this.messagesMap)
  }

  async refreshPinnedMessages(conversationIds: (string | null | undefined)[]) {
    if (!this.canUseMessageService()) {
      return []
    }

    const targetConversationIds = Array.from(
      new Set(
        conversationIds.filter((conversationId): conversationId is string => !!conversationId)
      )
    )

    if (targetConversationIds.length === 0) {
      return []
    }

    const results: PromiseSettledResult<V2NIMMessage[]>[] = []

    for (const conversationId of targetConversationIds) {
      results.push(await this.toSettledResult(this.loadPinnedMessages(conversationId)))
    }

    return results
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

  async hydrateMissingReplySources(conversationId: string, messages: V2NIMMessage[]) {
    if (!this.canUseMessageService() || messages.length === 0) {
      return []
    }

    const missingRefers = new Map<string, MessageReplyRefer>()

    messages.forEach((message) => {
      const threadReply = message.threadReply as MessageReplyRefer | undefined

      if (!threadReply) {
        return
      }

      if (this.getMessageByRefer(conversationId, threadReply)) {
        return
      }

      if (this.isRevokedRefer(conversationId, threadReply)) {
        return
      }

      const referKeys = this.getMessageReferKeys(threadReply)

      if (referKeys.length === 0) {
        return
      }

      missingRefers.set(referKeys.join('|'), {
        conversationId: threadReply.conversationId || conversationId,
        conversationType: threadReply.conversationType || message.conversationType,
        senderId: threadReply.senderId,
        receiverId: threadReply.receiverId || message.receiverId,
        messageClientId: threadReply.messageClientId,
        messageServerId: threadReply.messageServerId,
        createTime: threadReply.createTime
      })
    })

    const refers = Array.from(missingRefers.values()).filter(
      (refer): refer is V2NIMMessageRefer =>
        !!refer.senderId &&
        !!refer.receiverId &&
        !!refer.messageClientId &&
        !!refer.messageServerId &&
        !!refer.createTime &&
        !!refer.conversationId &&
        !!refer.conversationType
    )

    if (refers.length === 0) {
      return []
    }

    const hydrationKey = `${conversationId}:${refers
      .map((refer) => this.getMessageReferKeys(refer).join('|'))
      .sort()
      .join(',')}`
    const existingPromise = this.replySourceHydrationPromiseByKey.get(hydrationKey)

    if (existingPromise) {
      return existingPromise
    }

    const promise = nimStore
      .nim!.V2NIMMessageService.getMessageListByRefers(refers)
      .then((hydratedMessages: V2NIMMessage[]) => {
        if (hydratedMessages.length > 0) {
          runInAction(() => {
            if (!this.replySourceMessageMap[conversationId]) {
              this.replySourceMessageMap[conversationId] = {}
            }

            hydratedMessages.forEach((message) => {
              this.getMessageReferKeys(message).forEach((key) => {
                this.replySourceMessageMap[conversationId][key] = message
              })
            })
          })
        }

        return hydratedMessages
      })
      .catch((error: unknown) => {
        if (this.isIllegalStateError(error)) {
          return []
        }

        throw error
      })
      .finally(() => {
        this.replySourceHydrationPromiseByKey.delete(hydrationKey)
      })

    this.replySourceHydrationPromiseByKey.set(hydrationKey, promise)
    return promise
  }

  applyP2PReadReceipts(readReceipts: V2NIMP2PMessageReadReceipt[]) {
    runInAction(() => {
      readReceipts.forEach((receipt) => {
        const currentReceipt = this.p2pReceiptMap[receipt.conversationId]

        if (!currentReceipt || receipt.timestamp > currentReceipt.timestamp) {
          this.p2pReceiptMap[receipt.conversationId] = receipt
        }
      })
    })
  }

  applyTeamReadReceipts(readReceipts: V2NIMTeamMessageReadReceipt[]) {
    runInAction(() => {
      readReceipts.forEach((receipt) => {
        if (!this.teamReceiptMap[receipt.conversationId]) {
          this.teamReceiptMap[receipt.conversationId] = {}
        }

        this.getMessageReferKeys(receipt).forEach((key) => {
          this.teamReceiptMap[receipt.conversationId][key] = receipt
        })
      })
    })
  }

  applyRevokeNotifications(notifications: V2NIMMessageRevokeNotification[]) {
    const affectedConversationIds = new Set<string>()

    runInAction(() => {
      notifications.forEach((notification) => {
        const { conversationId, messageClientId, messageServerId } = notification.messageRefer
        affectedConversationIds.add(conversationId)

        if (!this.revokedMessageMap[conversationId]) {
          this.revokedMessageMap[conversationId] = {}
        }
        if (!this.revokedMessageTimeMap[conversationId]) {
          this.revokedMessageTimeMap[conversationId] = {}
        }

        const key = messageClientId || messageServerId
        const referKeys = this.getMessageReferKeys({
          messageClientId,
          messageServerId
        })
        const revokeTime = this.getRevokeTimeFromNotification(notification)
        const revokedText =
          notification.revokeAccountId === nimStore.getLoginUser()
            ? translateCurrentApp('commonRecallByYou')
            : translateCurrentApp('commonRecalledMessage')

        referKeys.forEach((referKey) => {
          this.revokedMessageMap[conversationId][referKey] = revokedText
          this.revokedMessageTimeMap[conversationId][referKey] = revokeTime
        })

        const current = this.ensureConversationState(conversationId)
        const exists = current.list.some((message) => this.getMessageKey(message) === key)

        if (notification.serverExtension) {
          current.list = current.list.map((message) =>
            this.getMessageKey(message) === key
              ? {
                  ...message,
                  serverExtension: notification.serverExtension
                }
              : message
          )
        }

        if (!exists) {
          current.list = this.mergeMessages(current.list, [
            {
              ...notification.messageRefer,
              conversationId,
              serverExtension: notification.serverExtension,
              messageType: V2NIMMessageType.V2NIM_MESSAGE_TYPE_TIPS,
              sendingState: V2NIMMessageSendingState.V2NIM_MESSAGE_SENDING_STATE_SUCCEEDED
            } as V2NIMMessage
          ])
        }

        this.removePinnedMessageByRefer(conversationId, notification.messageRefer)
      })
    })

    affectedConversationIds.forEach((conversationId) => {
      conversationStore.decrementUnread(conversationId)
      this.syncConversationPreview(conversationId)
    })
  }

  applyPinNotification(notification: V2NIMMessagePinNotification) {
    const { conversationId, messageClientId, messageServerId } = notification.pin.messageRefer
    const referKeys = this.getMessageReferKeys({ messageClientId, messageServerId })

    runInAction(() => {
      if (!this.pinnedMessageMap[conversationId]) {
        this.pinnedMessageMap[conversationId] = {}
      }

      if (notification.pinState === V2NIMMessagePinState.V2NIM_MESSAGE_PIN_STATE_NOT_PINNED) {
        this.removePinnedMessageByRefer(conversationId, notification.pin.messageRefer)
        this.refreshMessageReferenceByRefer(conversationId, notification.pin.messageRefer)
        return
      }

      const pin = {
        messageRefer: notification.pin.messageRefer,
        opeartorId: notification.pin.operatorId,
        serverExtension: notification.pin.serverExtension,
        createTime: notification.pin.createTime || notification.pin.updateTime,
        updateTime: notification.pin.updateTime
      }

      referKeys.forEach((key) => {
        this.pinnedMessageMap[conversationId][key] = pin
      })
      this.refreshMessageReferenceByRefer(conversationId, notification.pin.messageRefer)
    })
  }

  applyPinnedMessages(conversationId: string, pins: V2NIMMessagePin[]) {
    runInAction(() => {
      this.pinnedMessageMap[conversationId] = {}
      pins.forEach((pin) => {
        if (this.isRevokedRefer(conversationId, pin.messageRefer)) {
          return
        }

        this.getMessageReferKeys(pin.messageRefer).forEach((key) => {
          this.pinnedMessageMap[conversationId][key] = pin
        })
      })
    })
  }

  isPeerRead(message: V2NIMMessage) {
    if (message.sendingState !== V2NIMMessageSendingState.V2NIM_MESSAGE_SENDING_STATE_SUCCEEDED) {
      return false
    }

    if (this.isAIConversation(message.conversationId)) {
      return true
    }

    if (nimStore.nim?.V2NIMMessageService.isPeerRead(message)) {
      return true
    }

    return (this.p2pReceiptMap[message.conversationId]?.timestamp || 0) >= (message.createTime || 0)
  }

  getTeamReadReceipt(message: V2NIMMessage) {
    const receiptMap = this.teamReceiptMap[message.conversationId]

    if (!receiptMap) {
      return null
    }

    const receiptKey = this.getMessageKeyCandidates(message).find((key) => receiptMap[key])

    return receiptKey ? receiptMap[receiptKey] : null
  }

  private applyTeamReadReceiptAliases(
    messages: V2NIMMessage[],
    receipt: V2NIMTeamMessageReadReceipt
  ) {
    const aliasKeys = Array.from(
      new Set(messages.flatMap((message) => this.getMessageKeyCandidates(message)))
    )

    if (aliasKeys.length === 0) {
      return
    }

    runInAction(() => {
      if (!this.teamReceiptMap[receipt.conversationId]) {
        this.teamReceiptMap[receipt.conversationId] = {}
      }

      this.getMessageReferKeys(receipt).forEach((key) => {
        this.teamReceiptMap[receipt.conversationId][key] = receipt
      })

      aliasKeys.forEach((key) => {
        this.teamReceiptMap[receipt.conversationId][key] = receipt
      })
    })
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

    const deduplicatedMessages = Array.from(
      new Map(
        messages.map((message) => [this.getReadReceiptKey(message), message] as const)
      ).values()
    )

    const receiptBatches = this.chunkMessages(
      deduplicatedMessages,
      TEAM_READ_RECEIPT_QUERY_MAX_BATCH_SIZE
    )
    const receipts: V2NIMTeamMessageReadReceipt[] = []

    for (const batch of receiptBatches) {
      const batchReceipts = await this.fetchTeamReadReceiptsWithFallback(batch)
      receipts.push(...batchReceipts)
    }

    this.applyTeamReadReceipts(receipts)
    deduplicatedMessages.forEach((message) => {
      const receipt = receipts.find(
        (item) =>
          item.conversationId === message.conversationId &&
          this.getMessageKeyCandidates(message).some(
            (key) => key === item.messageClientId || key === item.messageServerId
          )
      )

      if (receipt) {
        this.applyTeamReadReceiptAliases([message], receipt)
      }
    })

    return receipts
  }

  private async fetchTeamReadReceiptsWithFallback(
    messages: V2NIMMessage[]
  ): Promise<V2NIMTeamMessageReadReceipt[]> {
    if (messages.length === 0) {
      return []
    }

    const nim = nimStore.nim!

    try {
      return await nim.V2NIMMessageService.getTeamMessageReceipts(messages)
    } catch (error) {
      if (this.isIllegalStateError(error)) {
        return []
      }

      const errorCode = this.extractErrorCode(error)

      if (errorCode === 414 && messages.length > 1) {
        const midpoint = Math.ceil(messages.length / 2)
        const leftBatch = messages.slice(0, midpoint)
        const rightBatch = messages.slice(midpoint)

        const leftReceipts = await this.fetchTeamReadReceiptsWithFallback(leftBatch)
        const rightReceipts = await this.fetchTeamReadReceiptsWithFallback(rightBatch)

        return [...leftReceipts, ...rightReceipts]
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

  async sendChatReadReceipts(
    conversationId: string,
    options?: { bypassActiveConversation?: boolean }
  ) {
    if (!this.canUseMessageService()) {
      return { sent: false, incomingCount: 0, readableCount: 0 }
    }

    if (!options?.bypassActiveConversation && this.activeConversationId !== conversationId) {
      return { sent: false, incomingCount: 0, readableCount: 0 }
    }

    const current = this.messagesMap[conversationId]

    if (!current?.list.length) {
      return { sent: false, incomingCount: 0, readableCount: 0 }
    }

    return this.sendReadReceiptsForMessages(conversationId, current.list)
  }

  async sendReadReceiptsForReceivedMessages(conversationId: string, messages: V2NIMMessage[]) {
    if (!this.canUseMessageService() || this.activeConversationId !== conversationId) {
      return
    }

    await this.sendReadReceiptsForMessages(conversationId, messages)
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

    if (latestMessage.conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P) {
      await this.refreshP2PReadReceipt(conversationId)
      return
    }

    const outgoingMessages = current.list
      .filter(
        (message) =>
          message.isSelf &&
          message.sendingState === V2NIMMessageSendingState.V2NIM_MESSAGE_SENDING_STATE_SUCCEEDED
      )
      .slice(-50)

    await this.refreshTeamReadReceipts(outgoingMessages)
  }

  async revokeMessage(message: V2NIMMessage) {
    if (!nimStore.nim) {
      return
    }

    const revokeTime = Date.now()
    const serverExtension = this.buildRevokeServerExtension(message, revokeTime)

    await nimStore.nim.V2NIMMessageService.revokeMessage(message, { serverExtension })
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
        serverExtension,
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

    if (this.getRevokedText(message)) {
      this.syncConversationPreview(message.conversationId)
      return
    }

    await nimStore.nim.V2NIMMessageService.deleteMessage(message)
    this.deleteMessagesLocally([
      {
        conversationId: message.conversationId,
        messageClientId: message.messageClientId,
        messageServerId: message.messageServerId
      }
    ])
    await conversationStore.refreshConversations()
    this.syncConversationPreview(message.conversationId)
  }

  async deleteRemoteMessages(messages: V2NIMMessage[]) {
    if (!nimStore.nim || messages.length === 0) {
      return
    }

    const deletedLocalMessages: V2NIMMessage[] = []
    const remoteMessagesByConversationId = new Map<string, V2NIMMessage[]>()

    messages.forEach((message) => {
      if (this.getRevokedText(message)) {
        return
      }

      if (
        message.sendingState === V2NIMMessageSendingState.V2NIM_MESSAGE_SENDING_STATE_FAILED ||
        !message.messageServerId
      ) {
        deletedLocalMessages.push(message)
        return
      }

      const messagesInConversation =
        remoteMessagesByConversationId.get(message.conversationId) || []
      messagesInConversation.push(message)
      remoteMessagesByConversationId.set(message.conversationId, messagesInConversation)
    })

    const deletedRemoteMessages: V2NIMMessage[] = []

    for (const remoteMessages of remoteMessagesByConversationId.values()) {
      for (const chunk of this.chunkMessages(remoteMessages, DELETE_MESSAGES_CHUNK_SIZE)) {
        await nimStore.nim.V2NIMMessageService.deleteMessages(chunk)
        deletedRemoteMessages.push(...chunk)
      }
    }

    const deletedMessages = [...deletedLocalMessages, ...deletedRemoteMessages]

    if (deletedMessages.length > 0) {
      this.deleteMessagesLocally(
        deletedMessages.map((message) => ({
          conversationId: message.conversationId,
          messageClientId: message.messageClientId,
          messageServerId: message.messageServerId
        }))
      )
      await conversationStore.refreshConversations()
    }

    const affectedConversationIds = new Set<string>()
    messages.forEach((message) => affectedConversationIds.add(message.conversationId))
    affectedConversationIds.forEach((conversationId) =>
      this.syncConversationPreview(conversationId)
    )
  }

  async loadPinnedMessages(conversationId: string) {
    if (!this.canUseMessageService()) {
      return []
    }

    const existingPromise = this.pinnedMessageLoadPromiseByConversationId.get(conversationId)

    if (existingPromise) {
      return existingPromise
    }

    const promise = this.loadPinnedMessagesFromSDK(conversationId)
    this.pinnedMessageLoadPromiseByConversationId.set(conversationId, promise)

    try {
      return await promise
    } finally {
      this.pinnedMessageLoadPromiseByConversationId.delete(conversationId)
    }
  }

  private async loadPinnedMessagesFromSDK(conversationId: string) {
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
      runInAction(() => {
        this.removeRevokedPinnedMessages(conversationId)
      })
      return messages.filter((message) => !this.isRevokedRefer(conversationId, message))
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

  async loadHistory(conversationId: string, limit = NATIVE_HISTORY_PAGE_SIZE) {
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
        endTime: Date.now(),
        limit,
        direction: 0
      })

      runInAction(() => {
        const current = this.ensureConversationState(conversationId)
        current.list = this.mergeServerMessagesWithLocalUnsent(conversationId, messages)
        current.isSync = true
        current.hasMore = messages.length >= limit
        this.updateHistoryAnchor(conversationId, messages[messages.length - 1] || null, {
          reset: true
        })
      })

      this.refreshHistoryBatchTeamReadReceipts(messages).catch(() => undefined)

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

  async loadMoreHistory(conversationId: string, limit = NATIVE_HISTORY_PAGE_SIZE) {
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
      const anchorMessage =
        current.historyAnchor ||
        current.list.find((message) => !!message.messageServerId) ||
        current.list[0]
      const messages = await nim.V2NIMMessageService.getMessageList({
        conversationId,
        anchorMessage,
        endTime: anchorMessage.createTime,
        limit,
        direction: 0
      })

      runInAction(() => {
        const latest = this.ensureConversationState(conversationId)
        latest.list = this.mergeMessages(latest.list, messages)
        latest.hasMore = messages.length >= limit
        this.updateHistoryAnchor(conversationId, messages[messages.length - 1] || null)
      })

      this.refreshHistoryBatchTeamReadReceipts(messages).catch(() => undefined)

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

  async sendMessage(conversationId: string, text: string, options?: TextMessageOptions) {
    if (!nimStore.nim || !text.trim()) {
      return
    }

    const message = this.applyTextMessageOptions(
      nimStore.nim.V2NIMMessageCreator.createTextMessage(text),
      options
    )
    return this.performSend(conversationId, message, (_progress) =>
      nimStore.nim!.V2NIMMessageService.sendMessage(
        message,
        conversationId,
        this.buildSendParams(conversationId, message)
      )
    )
  }

  async replyTextMessage(
    conversationId: string,
    text: string,
    replyToMessage: V2NIMMessage,
    options?: TextMessageOptions
  ) {
    if (!nimStore.nim || !text.trim()) {
      return
    }

    const message = this.applyTextMessageOptions(
      {
        ...nimStore.nim.V2NIMMessageCreator.createTextMessage(text),
        threadReply: this.getMessageRefer(replyToMessage)
      } as V2NIMMessage,
      options
    )

    return this.performSend(conversationId, message, (_progress) =>
      nimStore.nim!.V2NIMMessageService.replyMessage(
        message,
        replyToMessage,
        this.buildSendParams(conversationId, message)
      )
    )
  }

  async sendImageMessage(
    conversationId: string,
    imageUri: string,
    name?: string,
    options?: {
      width?: number
      height?: number
    }
  ) {
    if (!nimStore.nim) {
      return
    }

    const message = nimStore.nim.V2NIMMessageCreator.createImageMessage(
      imageUri,
      name || 'image.jpg',
      undefined,
      options?.width,
      options?.height
    )
    return this.performSend(conversationId, message, (progress) =>
      nimStore.nim!.V2NIMMessageService.sendMessage(
        message,
        conversationId,
        this.buildSendParams(conversationId, message),
        progress
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
      previewUri?: string
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

    return this.performSend(
      conversationId,
      message,
      (progress) =>
        nimStore.nim!.V2NIMMessageService.sendMessage(
          message,
          conversationId,
          this.buildSendParams(conversationId, message),
          progress
        ),
      {
        videoUploadPreview: options?.previewUri
      }
    )
  }

  async sendFileMessage(conversationId: string, fileUri: string, name?: string) {
    if (!nimStore.nim) {
      return
    }

    const message = nimStore.nim.V2NIMMessageCreator.createFileMessage(fileUri, name || 'file')
    return this.performSend(conversationId, message, (progress) =>
      nimStore.nim!.V2NIMMessageService.sendMessage(
        message,
        conversationId,
        this.buildSendParams(conversationId, message),
        progress
      )
    )
  }

  async sendAudioMessage(
    conversationId: string,
    audioUri: string,
    options?: {
      name?: string
      duration?: number
      debugTraceId?: string
    }
  ) {
    if (!nimStore.nim) {
      logIOSVoiceDebug('store.audio.create.skip.noNim', {
        traceId: options?.debugTraceId,
        conversationId,
        audioUri,
        name: options?.name,
        duration: options?.duration
      })
      return
    }

    logIOSVoiceDebug('store.audio.create.start', {
      traceId: options?.debugTraceId,
      conversationId,
      audioUri,
      name: options?.name,
      duration: options?.duration
    })

    const message = nimStore.nim.V2NIMMessageCreator.createAudioMessage(
      audioUri,
      options?.name || 'audio.m4a',
      undefined,
      options?.duration
    )

    logIOSVoiceDebug('store.audio.create.done', {
      traceId: options?.debugTraceId,
      conversationId,
      message: getAudioMessageDebugPayload(message)
    })

    return this.performSend(
      conversationId,
      message,
      (progress) =>
        nimStore.nim!.V2NIMMessageService.sendMessage(
          message,
          conversationId,
          this.buildSendParams(conversationId, message),
          progress
        ),
      {
        debugTraceId: options?.debugTraceId
      }
    )
  }

  async sendLocationMessage(
    conversationId: string,
    latitude: number,
    longitude: number,
    address: string,
    title?: string
  ) {
    if (!nimStore.nim) {
      return
    }

    const normalizedAddress = address.trim()
    const normalizedTitle =
      title?.trim() || normalizedAddress.split(/\s+/).filter(Boolean)[0] || '位置'
    const message = nimStore.nim.V2NIMMessageCreator.createLocationMessage(
      latitude,
      longitude,
      normalizedAddress
    )
    message.text = normalizedTitle

    return this.performSend(conversationId, message, (_progress) =>
      nimStore.nim!.V2NIMMessageService.sendMessage(
        message,
        conversationId,
        this.buildSendParams(conversationId, message)
      )
    )
  }

  async sendForwardComment(conversationId: string, comment = '') {
    if (!nimStore.nim || !comment.trim()) {
      return null
    }

    const commentMessage = nimStore.nim.V2NIMMessageCreator.createTextMessage(comment.trim())
    return this.performSend(conversationId, commentMessage, (_progress) =>
      nimStore.nim!.V2NIMMessageService.sendMessage(
        commentMessage,
        conversationId,
        this.buildSendParams(conversationId, commentMessage)
      )
    )
  }

  async resendMessage(message: V2NIMMessage) {
    if (!nimStore.nim) {
      return null
    }

    const key = this.getMessageKey(message)
    const currentMessage = this.getMessageById(message.conversationId, key)

    if (!currentMessage) {
      return null
    }

    if (
      currentMessage.sendingState !== V2NIMMessageSendingState.V2NIM_MESSAGE_SENDING_STATE_FAILED ||
      this.isMessageResending(message.conversationId, key)
    ) {
      return currentMessage
    }

    this.setMessageResending(message.conversationId, key, true)
    try {
      const resendWithDraft = async (
        draftMessage: V2NIMMessage,
        sender: (progress: (percentage: number) => void) => Promise<SendMessageResult>
      ) => {
        const draftMessageKey = this.getMessageKey(draftMessage)

        this.updateMessageInPlace(message.conversationId, key, (currentMessage) => ({
          ...currentMessage,
          sendingState: V2NIMMessageSendingState.V2NIM_MESSAGE_SENDING_STATE_SENDING
        }))

        if (this.isAttachmentUploadMessage(draftMessage)) {
          this.setAttachmentUploadProgress(message.conversationId, key, 0)
        }

        try {
          this.ensureSendReady()
          const result = await sender((percentage) => {
            this.setAttachmentUploadProgress(message.conversationId, key, percentage)
            this.setAttachmentUploadProgress(message.conversationId, draftMessageKey, percentage)
          })
          const sendResultAntispamReason = this.getSendResultAntispamReason(result)

          if (sendResultAntispamReason) {
            const antispamError = createAntispamSendFailureError(
              sendResultAntispamReason,
              result.antispamResult
            )
            this.applySendFailure(message.conversationId, key, {
              antispamResult: result.antispamResult
            })
            this.clearAttachmentUploadProgress(message.conversationId, key)
            this.clearAttachmentUploadProgress(message.conversationId, draftMessageKey)
            throw antispamError
          }

          if (hasSendFailureResult(result.message)) {
            const sendFailureError = createSendFailureError(result.message, result)
            this.applySendFailure(message.conversationId, key, sendFailureError)
            this.clearAttachmentUploadProgress(message.conversationId, key)
            this.clearAttachmentUploadProgress(message.conversationId, draftMessageKey)
            throw sendFailureError
          }

          const sentMessage = result.message
          const nextMessage = {
            ...result.message,
            messageClientId: message.messageClientId || result.message.messageClientId,
            messageServerId: result.message.messageServerId || message.messageServerId
          } as V2NIMMessage

          this.migrateAntispamReason(message.conversationId, message, nextMessage)
          this.clearAttachmentUploadProgress(message.conversationId, key)
          this.clearAttachmentUploadProgress(message.conversationId, draftMessageKey)
          this.replaceMessageAndSort(message.conversationId, key, nextMessage)
          if (
            nextMessage.conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM &&
            nextMessage.sendingState ===
              V2NIMMessageSendingState.V2NIM_MESSAGE_SENDING_STATE_SUCCEEDED
          ) {
            this.refreshTeamReadReceipts([sentMessage])
              .then((receipts) => {
                receipts.forEach((receipt) => {
                  this.applyTeamReadReceiptAliases([sentMessage, nextMessage], receipt)
                })
              })
              .catch(() => undefined)
          }
          return nextMessage
        } catch (error) {
          if (
            !this.isAntispamBlocked(this.getMessageById(message.conversationId, key) || message)
          ) {
            this.applySendFailure(message.conversationId, key, error)
          }
          this.clearAttachmentUploadProgress(message.conversationId, key)
          this.clearAttachmentUploadProgress(message.conversationId, draftMessageKey)
          throw error
        }
      }

      const replyToMessage = this.getMessageByRefer(message.conversationId, message.threadReply)

      if (message.threadReply && !replyToMessage) {
        throw new Error(translateCurrentApp('commonReplySourceMissing'))
      }

      if (message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_TEXT) {
        const draftMessage = this.applyTextMessageOptions(
          {
            ...nimStore.nim.V2NIMMessageCreator.createTextMessage(message.text || ''),
            threadReply: message.threadReply
          } as V2NIMMessage,
          {
            serverExtension: message.serverExtension,
            mentions: parseMentionExtension(message.serverExtension)
          }
        )

        return resendWithDraft(draftMessage, (_progress) =>
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
          throw new Error(translateCurrentApp('commonOriginalImageMissing'))
        }

        const draftMessage = nimStore.nim.V2NIMMessageCreator.createImageMessage(
          source,
          attachment?.name || 'image.jpg',
          undefined,
          attachment?.width,
          attachment?.height
        )
        return resendWithDraft(draftMessage, (progress) =>
          nimStore.nim!.V2NIMMessageService.sendMessage(
            draftMessage,
            message.conversationId,
            this.buildSendParams(message.conversationId, draftMessage),
            progress
          )
        )
      }

      if (message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_VIDEO) {
        const attachment = message.attachment as V2NIMMessageFileAttachment | undefined
        const source = attachment?.path || attachment?.url

        if (!source) {
          throw new Error(translateCurrentApp('commonOriginalVideoMissing'))
        }

        const draftMessage = nimStore.nim.V2NIMMessageCreator.createVideoMessage(
          source,
          attachment?.name || 'video.mp4'
        )
        return resendWithDraft(draftMessage, (progress) =>
          nimStore.nim!.V2NIMMessageService.sendMessage(
            draftMessage,
            message.conversationId,
            this.buildSendParams(message.conversationId, draftMessage),
            progress
          )
        )
      }

      if (message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_FILE) {
        const attachment = message.attachment as V2NIMMessageFileAttachment | undefined
        const source = attachment?.path || attachment?.url

        if (!source) {
          throw new Error(translateCurrentApp('commonOriginalFileMissing'))
        }

        const draftMessage = nimStore.nim.V2NIMMessageCreator.createFileMessage(
          source,
          attachment?.name || 'file'
        )
        return resendWithDraft(draftMessage, (progress) =>
          nimStore.nim!.V2NIMMessageService.sendMessage(
            draftMessage,
            message.conversationId,
            this.buildSendParams(message.conversationId, draftMessage),
            progress
          )
        )
      }

      if (message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_AUDIO) {
        const attachment = message.attachment as V2NIMMessageAudioAttachment | undefined
        const source = attachment?.path || attachment?.url

        if (!source) {
          throw new Error(translateCurrentApp('commonOriginalAudioMissing'))
        }

        const draftMessage = nimStore.nim.V2NIMMessageCreator.createAudioMessage(
          source,
          attachment?.name || 'audio.m4a',
          undefined,
          attachment?.duration
        )
        return resendWithDraft(draftMessage, (progress) =>
          nimStore.nim!.V2NIMMessageService.sendMessage(
            draftMessage,
            message.conversationId,
            this.buildSendParams(message.conversationId, draftMessage),
            progress
          )
        )
      }

      if (message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_LOCATION) {
        const attachment = message.attachment as V2NIMMessageLocationAttachment | undefined

        if (
          typeof attachment?.latitude !== 'number' ||
          typeof attachment?.longitude !== 'number' ||
          !attachment.address
        ) {
          throw new Error(translateCurrentApp('commonOriginalLocationMissing'))
        }

        const draftMessage = nimStore.nim.V2NIMMessageCreator.createLocationMessage(
          attachment.latitude,
          attachment.longitude,
          attachment.address
        )
        draftMessage.text = message.text?.trim() || attachment.address?.trim() || '位置'
        return resendWithDraft(draftMessage, (_progress) =>
          nimStore.nim!.V2NIMMessageService.sendMessage(
            draftMessage,
            message.conversationId,
            this.buildSendParams(message.conversationId, draftMessage)
          )
        )
      }

      if (message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_CUSTOM) {
        const mergedForwardData = parseStandardMergedForwardData(message)

        if (!mergedForwardData) {
          return null
        }

        const payload = {
          type: MERGED_FORWARD_CUSTOM_TYPE,
          data: mergedForwardData
        }
        const draftMessage = nimStore.nim.V2NIMMessageCreator.createCustomMessage(
          message.text || translateCurrentApp('commonMergedChatHistory'),
          JSON.stringify(payload)
        )

        return resendWithDraft(draftMessage, (_progress) =>
          nimStore.nim!.V2NIMMessageService.sendMessage(
            draftMessage,
            message.conversationId,
            this.buildSendParams(message.conversationId, draftMessage)
          )
        )
      }

      return null
    } finally {
      this.setMessageResending(message.conversationId, key, false)
    }
  }

  async forwardMessage(message: V2NIMMessage, conversationId: string, comment = '') {
    if (!nimStore.nim) {
      return null
    }

    const forwardMessage = nimStore.nim.V2NIMMessageCreator.createForwardMessage(message)

    if (!forwardMessage) {
      throw new Error(translateCurrentApp('commonMessageForwardUnsupported'))
    }

    this.normalizeForwardMessage(forwardMessage)

    let result: V2NIMMessage | null = null
    let sendError: unknown = null

    try {
      result = await this.performSend(conversationId, forwardMessage, () =>
        nimStore.nim!.V2NIMMessageService.sendMessage(
          forwardMessage,
          conversationId,
          this.buildSendParams(conversationId, forwardMessage)
        )
      )
      await this.rememberForwardConversation(conversationId)
    } catch (error) {
      sendError = error
    }

    if (comment.trim()) {
      try {
        await this.sendForwardComment(conversationId, comment)
      } catch (error) {
        sendError = sendError || error
      }
    }

    if (sendError) {
      throw sendError
    }

    return result
  }

  async forwardCollectionMessage(message: V2NIMMessage, conversationId: string, comment = '') {
    const forwardSource = this.createCollectionForwardSourceMessage(message)

    if (!forwardSource) {
      throw new Error(translateCurrentApp('commonMessageForwardUnsupported'))
    }

    return this.forwardMessage(forwardSource, conversationId, comment)
  }

  async forwardMessages(messages: V2NIMMessage[], conversationId: string, comment = '') {
    if (!nimStore.nim || messages.length === 0) {
      return []
    }

    const forwardMessages = messages.map((message) => {
      const forwardMessage = nimStore.nim!.V2NIMMessageCreator.createForwardMessage(message)

      if (!forwardMessage) {
        throw new Error(translateCurrentApp('commonMessageForwardUnsupported'))
      }

      this.normalizeForwardMessage(forwardMessage)
      return forwardMessage
    })

    const results: V2NIMMessage[] = []
    let sendError: unknown = null

    const sendResults = await Promise.allSettled(
      forwardMessages.map((forwardMessage) =>
        this.performSend(conversationId, forwardMessage, () =>
          nimStore.nim!.V2NIMMessageService.sendMessage(
            forwardMessage,
            conversationId,
            this.buildSendParams(conversationId, forwardMessage)
          )
        )
      )
    )

    sendResults.forEach((sendResult) => {
      if (sendResult.status === 'fulfilled') {
        results.push(sendResult.value)
        return
      }

      sendError = sendError || sendResult.reason
    })

    if (!sendError) {
      await this.rememberForwardConversation(conversationId)
    }

    if (comment.trim()) {
      try {
        const sentComment = await this.sendForwardComment(conversationId, comment)
        if (sentComment) {
          results.push(sentComment)
        }
      } catch (error) {
        sendError = sendError || error
      }
    }

    if (sendError) {
      throw sendError
    }

    return results
  }

  async sendMergedForwardMessage(
    conversationId: string,
    sourceMessages: V2NIMMessage[],
    sourceConversationId: string,
    sourceTitle: string,
    comment = ''
  ) {
    if (!nimStore.nim) {
      return null
    }

    const mergedMessage = await this.createStandardMergedForwardMessage(
      sourceMessages,
      sourceConversationId,
      sourceTitle
    )

    let result: V2NIMMessage | null = null
    let sendError: unknown = null

    try {
      result = await this.performSend(conversationId, mergedMessage, () =>
        nimStore.nim!.V2NIMMessageService.sendMessage(
          mergedMessage,
          conversationId,
          this.buildSendParams(conversationId, mergedMessage)
        )
      )
      await this.rememberForwardConversation(conversationId)
    } catch (error) {
      sendError = error
    }

    if (comment.trim()) {
      try {
        await this.sendForwardComment(conversationId, comment)
      } catch (error) {
        sendError = sendError || error
      }
    }

    if (sendError) {
      throw sendError
    }

    return result
  }

  private getMergedForwardSenderName(message: V2NIMMessage) {
    const teamId =
      nimStore.nim?.V2NIMConversationIdUtil.parseConversationType(message.conversationId) === 2
        ? nimStore.nim?.V2NIMConversationIdUtil.parseConversationTargetId(message.conversationId)
        : undefined

    return (
      imStoreV2Bridge.rootStore?.uiStore.getAppellation({
        account: message.senderId,
        teamId,
        ignoreAlias: true
      }) || message.senderId
    )
  }

  private getMergedForwardSenderAvatar(message: V2NIMMessage) {
    return imStoreV2Bridge.rootStore?.userStore.users.get(message.senderId)?.avatar || ''
  }

  private stripMergedForwardServerExtension(message: V2NIMMessage) {
    try {
      const extension = JSON.parse(message.serverExtension || '{}') as Record<string, unknown>
      delete extension.yxReplyMsg
      delete extension.yxAitMsg
      return extension
    } catch {
      return {}
    }
  }

  private buildMergedForwardHeader(messageCount: number) {
    return JSON.stringify({
      version: 1,
      terminal: 'rn',
      sdk_version: 'nim-web-sdk-ng',
      app_version: '10.0.0-beta',
      message_count: messageCount
    })
  }

  private serializeMergedForwardMessages(messages: V2NIMMessage[]) {
    if (!nimStore.nim) {
      throw new Error('NIM 未初始化')
    }

    const sortedMessages = messages
      .slice()
      .sort((left, right) => left.createTime - right.createTime)
    const serializedMessages = sortedMessages.map((message) => {
      const originalServerExtension = message.serverExtension
      const extension = this.stripMergedForwardServerExtension(message)
      extension.mergedMessageNickKey = this.getMergedForwardSenderName(message)
      extension.mergedMessageAvatarKey = this.getMergedForwardSenderAvatar(message)
      message.serverExtension = JSON.stringify(extension)

      const serialized = nimStore.nim!.V2NIMMessageConverter.messageSerialization(message)
      message.serverExtension = originalServerExtension

      if (!serialized) {
        throw new Error('合并转发消息序列化失败')
      }

      return serialized
    })

    return [this.buildMergedForwardHeader(serializedMessages.length), ...serializedMessages].join(
      '\n'
    )
  }

  private buildMergedForwardAbstracts(messages: V2NIMMessage[]): MultiForwardAbstract[] {
    return messages
      .slice()
      .sort((left, right) => left.createTime - right.createTime)
      .slice(0, 3)
      .map((message) => ({
        senderNick: this.getMergedForwardSenderName(message),
        content: getForwardPreview(message, 'merged'),
        userAccId: message.senderId
      }))
  }

  private async uploadMergedForwardContent(content: string) {
    if (!nimStore.nim) {
      throw new Error('NIM 未初始化')
    }

    const tempUri = `${FileSystem.cacheDirectory}merged-forward-${Date.now()}.txt`
    await FileSystem.writeAsStringAsync(tempUri, content)

    try {
      const task = nimStore.nim.V2NIMStorageService.createUploadFileTask({
        fileObj: tempUri
      })
      const url = await nimStore.nim.V2NIMStorageService.uploadFile(task, () => undefined)
      return {
        url,
        md5: CryptoJS.MD5(content).toString()
      }
    } finally {
      try {
        await FileSystem.deleteAsync(tempUri, { idempotent: true })
      } catch {
        // noop
      }
    }
  }

  private async createStandardMergedForwardMessage(
    sourceMessages: V2NIMMessage[],
    sourceConversationId: string,
    sourceTitle: string
  ) {
    if (!nimStore.nim || sourceMessages.length === 0) {
      throw new Error('未找到可转发的消息')
    }

    const serializedContent = this.serializeMergedForwardMessages(sourceMessages)
    const uploaded = await this.uploadMergedForwardContent(serializedContent)
    const depth =
      Math.max(
        0,
        ...sourceMessages.map((message) => parseStandardMergedForwardData(message)?.depth || 0)
      ) + 1
    const payload = {
      type: MERGED_FORWARD_CUSTOM_TYPE,
      data: {
        sessionId:
          nimStore.nim.V2NIMConversationIdUtil.parseConversationTargetId(sourceConversationId) ||
          sourceConversationId,
        sessionName: sourceTitle,
        url: uploaded.url,
        md5: uploaded.md5,
        depth,
        abstracts: this.buildMergedForwardAbstracts(sourceMessages)
      }
    }

    return nimStore.nim.V2NIMMessageCreator.createCustomMessage(
      translateCurrentApp('commonMergedChatHistory'),
      JSON.stringify(payload)
    )
  }

  async loadRecentForwardConversations() {
    await this.ensureRecentForwardHistory()
    return this.recentForwardConversationIds
  }

  syncMessages(conversationId: string, messages: V2NIMMessage[]) {
    const mergedMessages = this.mergeServerMessagesWithLocalUnsent(conversationId, messages)

    runInAction(() => {
      const previous = this.messagesMap[conversationId]
      const candidateAnchor = messages[messages.length - 1] || null
      const historyAnchor = this.pickOlderHistoryAnchor(
        previous?.historyAnchor || null,
        candidateAnchor
      )

      this.messagesMap[conversationId] = {
        list: mergedMessages,
        isSync: true,
        loading: false,
        loadingMore: false,
        hasMore: messages.length >= 50,
        historyAnchor
      }
    })
  }

  clearConversationMessages(conversationId: string) {
    runInAction(() => {
      delete this.messagesMap[conversationId]
      delete this.p2pReceiptMap[conversationId]
      delete this.teamReceiptMap[conversationId]
      delete this.revokedMessageMap[conversationId]
      delete this.revokedMessageTimeMap[conversationId]
      delete this.pinnedMessageMap[conversationId]
      delete this.antispamMessageMap[conversationId]
      delete this.sentReadReceiptMap[conversationId]
      delete this.attachmentUploadProgressMap[conversationId]
      delete this.videoUploadPreviewMap[conversationId]
      delete this.replySourceMessageMap[conversationId]
    })
    this.pinnedMessageLoadPromiseByConversationId.delete(conversationId)
  }

  deleteMessagesLocally(messageRefs: MessageDeleteRefer[]) {
    if (messageRefs.length === 0) {
      return
    }

    const messageKeysByConversationId = new Map<string, Set<string>>()

    messageRefs.forEach((refer) => {
      const keys = this.getMessageReferKeys(refer)
      if (keys.length === 0) {
        return
      }

      const conversationKeys = messageKeysByConversationId.get(refer.conversationId) || new Set()
      keys.forEach((key) => conversationKeys.add(key))
      messageKeysByConversationId.set(refer.conversationId, conversationKeys)
    })

    if (messageKeysByConversationId.size === 0) {
      return
    }

    runInAction(() => {
      messageKeysByConversationId.forEach((messageKeys, conversationId) => {
        const current = this.messagesMap[conversationId]
        if (current) {
          current.list = current.list.filter(
            (message) => !messageKeys.has(this.getMessageKey(message))
          )
        }

        messageKeys.forEach((messageKey) => {
          delete this.antispamMessageMap[conversationId]?.[messageKey]
          delete this.attachmentUploadProgressMap[conversationId]?.[messageKey]
          delete this.videoUploadPreviewMap[conversationId]?.[messageKey]
        })
      })
    })

    messageKeysByConversationId.forEach((_, conversationId) => {
      this.syncConversationPreview(conversationId)
    })
  }

  deleteMessage(conversationId: string, messageId: string) {
    this.deleteMessagesLocally([
      { conversationId, messageClientId: messageId, messageServerId: messageId }
    ])
  }
}

export const messageStore = new MessageStore()
