import * as FileSystem from 'expo-file-system/legacy'

import { translateCurrentApp } from '@/utils/app-language'
import { getCallMessagePreviewText, getMergedForwardCallPreviewText } from '@/utils/callMessage'
import {
  V2NIMMessage,
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
export const MERGED_FORWARD_CUSTOM_TYPE = 101

const MERGED_FORWARD_CACHE_DIR = `${FileSystem.cacheDirectory}merged-forward/`

export type MergedForwardItem = {
  messageId: string
  senderId: string
  senderName: string
  senderAvatar?: string
  createTime: number
  messageType: number
  preview: string
  text?: string
  attachmentName?: string
  attachmentExt?: string
  attachmentUrl?: string
  attachmentSize?: number
  attachmentDuration?: number
  attachmentDurations?: {
    duration?: number
  }[]
  attachmentStatus?: number | string
  attachmentType?: number | string
  attachmentWidth?: number
  attachmentHeight?: number
  attachmentAddress?: string
  attachmentLatitude?: number
  attachmentLongitude?: number
  mergedPayload?: MergedForwardPayload
  mergedForwardData?: StandardMergedForwardData
}

export type MergedForwardPayload = {
  title: string
  previewList: string[]
  messages: MergedForwardItem[]
  nestedLevel: number
}

export type MultiForwardAbstract = {
  senderNick: string
  content: string
  userAccId: string
}

export type StandardMergedForwardData = {
  sessionId?: string
  sessionName?: string
  url?: string
  md5?: string
  depth?: number
  abstracts?: MultiForwardAbstract[]
}

export type StandardMergedForwardPayload = {
  type: number
  data?: StandardMergedForwardData
}

export type MergedForwardSummary = {
  title: string
  previewList: string[]
}

type ForwardPreviewScene = 'default' | 'merged'

function parseJson<T>(value: unknown): T | null {
  if (!value) {
    return null
  }

  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T
    } catch {
      return null
    }
  }

  if (typeof value === 'object') {
    return value as T
  }

  return null
}

function getNestedPayloadCandidates(value: unknown) {
  const payload = parseJson<Record<string, unknown>>(value)

  if (!payload) {
    return []
  }

  return [
    payload.raw,
    payload.payload,
    payload.content,
    payload.data,
    payload.attach,
    payload.attachment
  ]
}

function parseLegacyMergedForwardPayload(value: unknown): MergedForwardPayload | null {
  const payload = parseJson<MergedForwardPayload>(value)

  if (payload && Array.isArray(payload.messages)) {
    return payload
  }

  for (const candidate of getNestedPayloadCandidates(value)) {
    const nestedPayload = parseLegacyMergedForwardPayload(candidate)

    if (nestedPayload) {
      return nestedPayload
    }
  }

  return null
}

function parseStandardPayloadValue(value: unknown): StandardMergedForwardPayload | null {
  const payload = parseJson<StandardMergedForwardPayload>(value)

  if (payload?.type === MERGED_FORWARD_CUSTOM_TYPE) {
    return payload
  }

  for (const candidate of getNestedPayloadCandidates(value)) {
    const nestedPayload = parseStandardPayloadValue(candidate)

    if (nestedPayload) {
      return nestedPayload
    }
  }

  return null
}

function getMergedForwardPayloadCandidates(
  message: Pick<V2NIMMessage, 'attachment' | 'text' | 'messageType'>
) {
  const messageLike = message as Record<string, unknown>
  const attachment = messageLike.attachment
  const attachmentLike = attachment as
    | (V2NIMMessageCustomAttachment & Record<string, unknown>)
    | null

  return [
    attachmentLike?.raw,
    attachmentLike?.payload,
    attachmentLike?.data,
    attachmentLike?.content,
    attachmentLike?.attach,
    attachmentLike?.attachment,
    attachment,
    messageLike.rawAttachment,
    messageLike.customAttachment,
    messageLike.messageAttachment,
    messageLike.attach,
    messageLike.raw,
    messageLike.payload,
    messageLike.data,
    messageLike.content,
    message.text
  ]
}

function getStandardMergedForwardPayload(
  message: Pick<V2NIMMessage, 'attachment' | 'text' | 'messageType'>
) {
  if (message.messageType !== V2NIMMessageType.V2NIM_MESSAGE_TYPE_CUSTOM) {
    return null
  }

  for (const candidate of getMergedForwardPayloadCandidates(message)) {
    const payload = parseStandardPayloadValue(candidate)

    if (payload) {
      return payload
    }
  }

  return null
}

function getMergedForwardPreviewListFromAbstracts(abstracts?: MultiForwardAbstract[]) {
  return (
    abstracts?.slice(0, 3).map((item) => {
      const sender = item.senderNick || item.userAccId || ''
      const content = item.content || translateCurrentApp('commonMergedChatHistory')
      return sender ? `${sender}: ${content}` : content
    }) || []
  )
}

function getMergedForwardPreviewListFallback(value: unknown) {
  return (
    Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
  )
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3)
}

function parseStandardPayload(message: Pick<V2NIMMessage, 'attachment' | 'text' | 'messageType'>) {
  return getStandardMergedForwardPayload(message)
}

export function getMessageKey(message: Pick<V2NIMMessage, 'messageClientId' | 'messageServerId'>) {
  return message.messageClientId || message.messageServerId
}

export function getForwardPreview(message: V2NIMMessage, scene: ForwardPreviewScene = 'default') {
  switch (message.messageType) {
    case V2NIMMessageType.V2NIM_MESSAGE_TYPE_TEXT:
      return message.text || translateCurrentApp('commonTextMessage')
    case V2NIMMessageType.V2NIM_MESSAGE_TYPE_IMAGE:
      return translateCurrentApp('commonImageMessage')
    case V2NIMMessageType.V2NIM_MESSAGE_TYPE_FILE:
      return translateCurrentApp('commonFileMessage', {
        name: (message.attachment as V2NIMMessageFileAttachment | undefined)?.name || ''
      }).trim()
    case V2NIMMessageType.V2NIM_MESSAGE_TYPE_AUDIO:
      return translateCurrentApp('commonAudioMessage')
    case V2NIMMessageType.V2NIM_MESSAGE_TYPE_VIDEO:
      return translateCurrentApp('commonVideoMessage')
    case V2NIMMessageType.V2NIM_MESSAGE_TYPE_LOCATION:
      return translateCurrentApp('commonLocationMessage')
    case V2NIMMessageType.V2NIM_MESSAGE_TYPE_CALL:
      return scene === 'merged'
        ? getMergedForwardCallPreviewText(message) || `[${translateCurrentApp('callMsgText')}]`
        : getCallMessagePreviewText(message) || `[${translateCurrentApp('callMsgText')}]`
    case V2NIMMessageType.V2NIM_MESSAGE_TYPE_CUSTOM: {
      return isMergedForwardMessage(message)
        ? translateCurrentApp('commonMergedChatHistory')
        : translateCurrentApp('commonUnknownMessageBody')
    }
    default:
      return translateCurrentApp('commonUnknownMessageBody')
  }
}

export function parseMergedForwardPayload(message: V2NIMMessage) {
  if (message.messageType !== V2NIMMessageType.V2NIM_MESSAGE_TYPE_CUSTOM) {
    return null
  }

  for (const candidate of getMergedForwardPayloadCandidates(message)) {
    const payload = parseLegacyMergedForwardPayload(candidate)

    if (
      payload &&
      (message.subType === MERGED_FORWARD_SUBTYPE || Array.isArray(payload.previewList))
    ) {
      return payload
    }
  }

  return null
}

export function parseStandardMergedForwardData(message: V2NIMMessage) {
  return parseStandardPayload(message)?.data || null
}

export function isMergedForwardMessage(message: V2NIMMessage) {
  return !!(parseMergedForwardPayload(message) || parseStandardMergedForwardData(message))
}

export function getMergedForwardSummary(message: V2NIMMessage): MergedForwardSummary | null {
  const legacyPayload = parseMergedForwardPayload(message)

  if (legacyPayload) {
    return {
      title: legacyPayload.title,
      previewList: legacyPayload.previewList
    }
  }

  const standardPayload = parseStandardPayload(message)
  const standardData = standardPayload?.data

  if (!standardData) {
    return null
  }

  const title = standardData.sessionName
    ? `${standardData.sessionName}的消息`
    : translateCurrentApp('commonMergedChatHistory')
  const previewListFromAbstracts = getMergedForwardPreviewListFromAbstracts(standardData.abstracts)
  const previewListFallback = getMergedForwardPreviewListFallback(
    (standardPayload as { previewList?: unknown } | null)?.previewList ||
      (standardData as { previewList?: unknown }).previewList
  )
  const previewList =
    previewListFromAbstracts.length > 0 ? previewListFromAbstracts : previewListFallback

  return {
    title,
    previewList:
      previewList.length > 0 ? previewList : [translateCurrentApp('commonMergedChatHistory')]
  }
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
      !isMergedForwardMessage(message)
    )
  )
}

export function getMergedForwardNestedLevel(message: V2NIMMessage) {
  return (
    parseMergedForwardPayload(message)?.nestedLevel ||
    parseStandardMergedForwardData(message)?.depth ||
    0
  )
}

async function ensureMergedForwardCacheDir() {
  const dirInfo = await FileSystem.getInfoAsync(MERGED_FORWARD_CACHE_DIR)

  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(MERGED_FORWARD_CACHE_DIR, { intermediates: true })
  }
}

function buildMergedForwardCacheUri(
  message: Pick<V2NIMMessage, 'messageClientId' | 'messageServerId'>
) {
  return `${MERGED_FORWARD_CACHE_DIR}${getMessageKey(message) || 'merged-forward'}.txt`
}

export async function getMergedForwardCacheUri(
  message: Pick<V2NIMMessage, 'messageClientId' | 'messageServerId'>
) {
  await ensureMergedForwardCacheDir()
  return buildMergedForwardCacheUri(message)
}

export function splitMergedForwardSerializedContent(content: string) {
  const lines = content
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length === 0) {
    return {
      header: null,
      serializedMessages: []
    }
  }

  const [headerLine, ...serializedMessages] = lines

  return {
    header: parseJson<Record<string, unknown>>(headerLine),
    serializedMessages
  }
}

function stripMergedForwardServerIds(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => stripMergedForwardServerIds(item))
  }

  if (value && typeof value === 'object') {
    const next: Record<string, unknown> = {}

    Object.entries(value as Record<string, unknown>).forEach(([key, item]) => {
      // SDK serialized merged-history rows use numeric field keys.
      // `12` is the serialized messageServerId field on current payloads.
      if (key === 'messageServerId' || key === 'idServer' || key === '12') {
        return
      }

      next[key] = stripMergedForwardServerIds(item)
    })

    return next
  }

  return value
}

export function sanitizeMergedForwardSerializedMessage(serializedMessage: string) {
  const payload = parseJson<unknown>(serializedMessage)

  if (!payload) {
    return serializedMessage
  }

  return JSON.stringify(stripMergedForwardServerIds(payload))
}
