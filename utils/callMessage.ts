import { type AppTranslationKey, translateCurrentApp } from '@/utils/app-language'
import {
  type V2NIMMessage,
  type V2NIMMessageCallAttachment,
  V2NIMMessageType
} from '@/utils/nim-sdk'

type CallAttachmentWithDurations = V2NIMMessageCallAttachment & {
  durations?: Array<{
    duration?: number
  }>
  duration?: number
  status?: number | string
  type?: number | string
}

const CALL_STATUS_TEXT_MAP: Record<number, AppTranslationKey> = {
  1: 'callDurationText',
  2: 'callCancelText',
  3: 'callRejectedText',
  4: 'callTimeoutText',
  5: 'callBusyText'
}

type CallMessageLike = Pick<V2NIMMessage, 'attachment'> & {
  messageType?: V2NIMMessage['messageType']
}

function normalizeCallAttachment(message: CallMessageLike) {
  if (message.messageType !== V2NIMMessageType.V2NIM_MESSAGE_TYPE_CALL) {
    return null
  }

  return (message.attachment as CallAttachmentWithDurations | undefined) || null
}

export function isCallMessage(
  message:
    | Pick<V2NIMMessage, 'messageType'>
    | { messageType?: V2NIMMessage['messageType'] }
    | null
    | undefined
) {
  return message?.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_CALL
}

export function getCallMessagePreviewText(message: CallMessageLike) {
  if (!isCallMessage(message)) {
    return ''
  }

  return `[${translateCurrentApp('callMsgText')}]`
}

export function getMergedForwardCallPreviewText(message: CallMessageLike) {
  if (!isCallMessage(message)) {
    return ''
  }

  const attachment = normalizeCallAttachment(message)
  const isVoiceCall = Number(attachment?.type) === 1

  return `[${translateCurrentApp(isVoiceCall ? 'voiceCallText' : 'videoCallText')}]`
}

export function getCallMessageStatusText(message: CallMessageLike) {
  const attachment = normalizeCallAttachment(message)
  const status = Number(attachment?.status)

  if (!Number.isFinite(status)) {
    return translateCurrentApp('callFailedText')
  }

  return translateCurrentApp(CALL_STATUS_TEXT_MAP[status] || 'callFailedText')
}

export function getCallMessageDurationSeconds(message: CallMessageLike) {
  const attachment = normalizeCallAttachment(message)
  const rawDuration = attachment?.durations?.[0]?.duration ?? attachment?.duration

  if (typeof rawDuration !== 'number' || !Number.isFinite(rawDuration) || rawDuration <= 0) {
    return 0
  }

  return rawDuration > 1000 ? Math.round(rawDuration / 1000) : Math.round(rawDuration)
}

export function formatCallDuration(durationSeconds: number) {
  if (!durationSeconds) {
    return '00:00'
  }

  const normalizedSeconds = Math.max(0, Math.round(durationSeconds))
  const hours = Math.floor(normalizedSeconds / 3600)
  const minutes = Math.floor((normalizedSeconds % 3600) / 60)
  const seconds = normalizedSeconds % 60

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function getCallMessageIconType(message: CallMessageLike) {
  const attachment = normalizeCallAttachment(message)
  return Number(attachment?.type) === 1 ? 'icon-yuyin8' : 'icon-shipin8'
}
