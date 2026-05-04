import {
  V2NIMMessage,
  V2NIMMessageAttachment,
  V2NIMMessageCallAttachment,
  V2NIMMessageCustomAttachment,
  V2NIMMessageFileAttachment,
  V2NIMMessageSendingState,
  V2NIMMessageType
} from '@/utils/nim-sdk'

export const MAX_FORWARD_TARGETS = 9
export const MAX_BATCH_DELETE = 50
export const MAX_SERIAL_FORWARD = 10
export const MAX_MERGED_FORWARD = 100
export const MERGED_FORWARD_SUBTYPE = 100001

export type MergedForwardItem = {
  messageId: string
  senderId: string
  senderName: string
  createTime: number
  messageType: number
  preview: string
  text?: string
  attachmentName?: string
  attachmentUrl?: string
  attachmentSize?: number
  attachmentDuration?: number
  attachmentWidth?: number
  attachmentHeight?: number
  attachmentAddress?: string
  attachmentLatitude?: number
  attachmentLongitude?: number
  mergedPayload?: MergedForwardPayload
}

export type MergedForwardPayload = {
  title: string
  previewList: string[]
  messages: MergedForwardItem[]
  nestedLevel: number
}

function parseRawAttachment(attachment?: V2NIMMessageAttachment | null) {
  const raw = (attachment as V2NIMMessageCustomAttachment | undefined)?.raw

  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as MergedForwardPayload
  } catch {
    return null
  }
}

export function getMessageKey(message: Pick<V2NIMMessage, 'messageClientId' | 'messageServerId'>) {
  return message.messageClientId || message.messageServerId
}

export function getForwardPreview(message: V2NIMMessage) {
  switch (message.messageType) {
    case V2NIMMessageType.V2NIM_MESSAGE_TYPE_TEXT:
      return message.text || '[文字消息]'
    case V2NIMMessageType.V2NIM_MESSAGE_TYPE_IMAGE:
      return '[图片消息]'
    case V2NIMMessageType.V2NIM_MESSAGE_TYPE_FILE:
      return `[文件消息] ${(message.attachment as V2NIMMessageFileAttachment | undefined)?.name || ''}`.trim()
    case V2NIMMessageType.V2NIM_MESSAGE_TYPE_AUDIO:
      return '[语音消息]'
    case V2NIMMessageType.V2NIM_MESSAGE_TYPE_VIDEO:
      return '[视频消息]'
    case V2NIMMessageType.V2NIM_MESSAGE_TYPE_LOCATION:
      return '[地理位置]'
    case V2NIMMessageType.V2NIM_MESSAGE_TYPE_CALL: {
      const text = (message.attachment as V2NIMMessageCallAttachment | undefined)?.text || ''

      if (text.includes('视频')) {
        return '[视频通话]'
      }

      if (text.includes('音频') || text.includes('语音')) {
        return '[音频通话]'
      }

      return '[音视频通话]'
    }
    case V2NIMMessageType.V2NIM_MESSAGE_TYPE_CUSTOM: {
      const merged = parseMergedForwardPayload(message)
      return merged ? '[聊天记录]' : '[未知消息体]'
    }
    default:
      return '[未知消息体]'
  }
}

export function parseMergedForwardPayload(message: V2NIMMessage) {
  if (
    message.messageType !== V2NIMMessageType.V2NIM_MESSAGE_TYPE_CUSTOM ||
    message.subType !== MERGED_FORWARD_SUBTYPE
  ) {
    return null
  }

  const payload = parseRawAttachment(message.attachment)

  if (!payload || !Array.isArray(payload.messages)) {
    return null
  }

  return payload
}

export function isMergedForwardMessage(message: V2NIMMessage) {
  return !!parseMergedForwardPayload(message)
}

export function isSelectableMessage(
  message: V2NIMMessage,
  revokedText?: string | null,
  includeSystem = false
) {
  if (revokedText) {
    return false
  }

  if (!includeSystem) {
    return (
      message.messageType !== V2NIMMessageType.V2NIM_MESSAGE_TYPE_NOTIFICATION &&
      message.messageType !== V2NIMMessageType.V2NIM_MESSAGE_TYPE_TIPS
    )
  }

  return true
}

export function isForwardableMessage(message: V2NIMMessage, revokedText?: string | null) {
  if (!isSelectableMessage(message, revokedText)) {
    return false
  }

  if (message.sendingState !== V2NIMMessageSendingState.V2NIM_MESSAGE_SENDING_STATE_SUCCEEDED) {
    return false
  }

  return (
    message.messageType !== V2NIMMessageType.V2NIM_MESSAGE_TYPE_AUDIO &&
    message.messageType !== V2NIMMessageType.V2NIM_MESSAGE_TYPE_CALL &&
    !(
      message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_CUSTOM &&
      !parseMergedForwardPayload(message)
    )
  )
}

export function getMergedForwardNestedLevel(message: V2NIMMessage) {
  return parseMergedForwardPayload(message)?.nestedLevel || 0
}
