import { Image } from 'expo-image'
import { router } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Image as RNImage,
  LayoutChangeEvent,
  Platform,
  Pressable,
  requireNativeComponent,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
  ViewStyle
} from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { EMOJI_RENDER_ICON_MAP_CONFIG } from '@/src/NEUIKit/common/utils/emoji'
import { parseText } from '@/src/NEUIKit/common/utils/parseText'
import { toast } from '@/src/NEUIKit/common/utils/toast'
import { imStoreV2Bridge, messageStore, preferenceStore, teamStore } from '@/stores'
import { getAmapStaticMapUrl, resolveLocationText } from '@/utils/amap'
import { translateCurrentApp } from '@/utils/app-language'
import {
  formatCallDuration,
  getCallMessageDurationSeconds,
  getCallMessageIconType,
  getCallMessageStatusText,
  isCallMessage
} from '@/utils/callMessage'
import { normalizeDisplayErrorMessage } from '@/utils/error-message'
import { getImageRenderSource } from '@/utils/media-source'
import { getForwardPreview, getMergedForwardSummary, getMessageKey } from '@/utils/messageForward'
import { ensureNetworkAvailable } from '@/utils/network'
import {
  V2NIMConversationType,
  V2NIMMessage,
  V2NIMMessageAudioAttachment,
  V2NIMMessageFileAttachment,
  V2NIMMessageImageAttachment,
  V2NIMMessageLocationAttachment,
  V2NIMMessageSendingState,
  V2NIMMessageType,
  V2NIMMessageVideoAttachment
} from '@/utils/nim-sdk'
import { getTeamNotificationAccountIds, getTeamNotificationText } from '@/utils/teamNotification'

import { UIKitChatRichText, UIKitMessageReadIndicator } from './chat'
import { UIKitUserAvatar } from './components'
import { getUIKitIconSource, NEUIKitIconName, UIKitIcon } from './icon'
import { ensureUIKitUserProfiles, getUIKitAppellation, resolveUIKitProfileRoute } from './identity'

const FRIEND_DELETED_SEND_TIP = () => translateCurrentApp('messageStoreFriendDeletedTip' as never)
const AUDIO_PLAY_FRAME_INTERVAL_MS = 330
const AUDIO_PLAY_RIGHT_FRAMES: NEUIKitIconName[] = [
  'audio-play-right-1',
  'audio-play-right-2',
  'audio-play-right-3'
]
const AUDIO_PLAY_LEFT_FRAMES: NEUIKitIconName[] = [
  'audio-play-left-1',
  'audio-play-left-2',
  'audio-play-left-3'
]
const CHAT_LIST_HORIZONTAL_PADDING = 32
const MESSAGE_AVATAR_SPACE = 56
const MESSAGE_SELECTION_SPACE = 40
const MESSAGE_RECEIPT_SPACE = 32
const MESSAGE_RETRY_SPACE = 34
const MESSAGE_BUBBLE_HORIZONTAL_PADDING = 28
const MIN_MESSAGE_BUBBLE_WIDTH = 120
const MERGED_FORWARD_MAX_TOTAL_LINES = 3
const MERGED_FORWARD_SUMMARY_LINE_HEIGHT = 19
const MERGED_FORWARD_SUMMARY_EMOJI_SIZE = 16
const ATTACHMENT_SENDING_MIN_PROGRESS = 0.02

type NativeAttachmentProgressProps = {
  variant: 'file' | 'media'
  progress: number
  style?: StyleProp<ViewStyle>
}

const NativeAttachmentProgressView =
  Platform.OS === 'android' || Platform.OS === 'ios'
    ? requireNativeComponent<NativeAttachmentProgressProps>('NIMAttachmentProgressView')
    : null

export function getUIKitMessagePreview(message: V2NIMMessage) {
  if (message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_NOTIFICATION) {
    return (
      getTeamNotificationText(message) ||
      translateCurrentApp('conversationNotificationText' as never)
    )
  }

  if (message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_TIPS) {
    return (
      normalizeDisplayErrorMessage(message.text || '') ||
      translateCurrentApp('commonTipMessagePreview' as never)
    )
  }

  return getForwardPreview(message)
}

function isAntispamTipMessage(message: V2NIMMessage) {
  const blockedPrefix = translateCurrentApp('commonSensitiveContentBlocked')
  return (
    message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_TIPS &&
    !!message.text?.includes(blockedPrefix.slice(0, Math.min(4, blockedPrefix.length)))
  )
}

function isFriendDeletedTipMessage(message: V2NIMMessage) {
  return (
    message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_TIPS &&
    message.text === FRIEND_DELETED_SEND_TIP()
  )
}

export function getUIKitReplySourcePreview(message: V2NIMMessage) {
  if (message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_FILE) {
    return translateCurrentApp('fileMsgTitleText' as never)
  }

  return getForwardPreview(message)
}

function splitMergedForwardTitle(title: string) {
  const suffix = translateCurrentApp('mergedForwardTitleSuffix' as never)

  if (!title.endsWith(suffix)) {
    return { prefix: title, suffix: '' }
  }

  return {
    prefix: title.slice(0, -suffix.length),
    suffix
  }
}

function getMergedForwardPreviewLineClamps(naturalLineCounts: number[]) {
  let remaining = MERGED_FORWARD_MAX_TOTAL_LINES

  return naturalLineCounts.map((lineCount) => {
    // Allocate the shared 3-line budget in order:
    // first summary line can use up to 3 lines,
    // the second uses whatever remains,
    // and the third only uses the leftover after that.
    const allocated = Math.min(Math.max(1, lineCount), Math.max(0, remaining))
    remaining -= allocated
    return allocated
  })
}

function splitMergedForwardPreviewItem(item: string) {
  const separatorIndex = item.indexOf(': ')

  if (separatorIndex < 0) {
    return {
      senderName: '',
      content: item,
      fullText: item
    }
  }

  return {
    senderName: item.slice(0, separatorIndex),
    content: item.slice(separatorIndex + 2),
    fullText: item
  }
}

function hasMergedForwardRenderableEmoji(text: string) {
  try {
    return parseText(text).some(
      (item) => item.type === 'emoji' && !!EMOJI_RENDER_ICON_MAP_CONFIG[item.value]
    )
  } catch {
    return false
  }
}

function MergedForwardSummaryRichText({
  text,
  lineLimit,
  onLayout
}: {
  text: string
  lineLimit?: number
  onLayout?: (event: LayoutChangeEvent) => void
}) {
  const parts = useMemo(() => {
    try {
      return parseText(text)
    } catch {
      return [{ type: 'text' as const, value: text, key: 'text-0' }]
    }
  }, [text])

  return (
    <ThemedText
      numberOfLines={lineLimit}
      ellipsizeMode="tail"
      onLayout={onLayout}
      style={styles.mergedForwardLineText}
    >
      {parts.map((part) => {
        if (part.type !== 'emoji') {
          return part.value
        }

        const iconType = EMOJI_RENDER_ICON_MAP_CONFIG[part.value] as NEUIKitIconName | undefined

        if (!iconType) {
          return part.value
        }

        return (
          <RNImage
            key={part.key}
            source={getUIKitIconSource(iconType)}
            resizeMode="contain"
            style={styles.mergedForwardLineEmoji}
          />
        )
      })}
    </ThemedText>
  )
}

function MergedForwardPreviewLine({
  item,
  lineLimit,
  onMeasureLineCount,
  measureOnly = false
}: {
  item: string
  lineLimit?: number
  onMeasureLineCount?: (lineCount: number) => void
  measureOnly?: boolean
}) {
  const { senderName, content } = splitMergedForwardPreviewItem(item)
  const [displaySenderName, setDisplaySenderName] = useState(senderName)

  useEffect(() => {
    setDisplaySenderName(senderName)
  }, [senderName])

  const resolvedText =
    senderName && displaySenderName ? `${displaySenderName}: ${content}` : content

  const hasRenderableEmoji = hasMergedForwardRenderableEmoji(resolvedText)

  const handleRichTextLayout = (event: LayoutChangeEvent) => {
    if (!measureOnly || !onMeasureLineCount) {
      return
    }

    const measuredHeight = event.nativeEvent.layout.height
    const nextLineCount = Math.max(
      1,
      Math.round(measuredHeight / MERGED_FORWARD_SUMMARY_LINE_HEIGHT)
    )
    onMeasureLineCount(nextLineCount)
  }

  const renderSummaryContent = (text: string) => {
    if (!hasRenderableEmoji) {
      return (
        <ThemedText
          numberOfLines={lineLimit}
          ellipsizeMode="tail"
          onTextLayout={
            onMeasureLineCount
              ? (event) => onMeasureLineCount(Math.max(1, event.nativeEvent.lines.length))
              : undefined
          }
          style={styles.mergedForwardLineText}
        >
          {text}
        </ThemedText>
      )
    }

    return (
      <MergedForwardSummaryRichText
        text={text}
        lineLimit={lineLimit}
        onLayout={measureOnly ? handleRichTextLayout : undefined}
      />
    )
  }

  if (!senderName) {
    return renderSummaryContent(content)
  }

  return (
    <View style={styles.mergedForwardLineTextWrap}>
      <ThemedText
        onTextLayout={(event) => {
          const measuredSenderName = event.nativeEvent.lines[0]?.text?.trim() || senderName

          if (!measuredSenderName || measuredSenderName === displaySenderName) {
            return
          }

          setDisplaySenderName(measuredSenderName)
        }}
        numberOfLines={1}
        ellipsizeMode="tail"
        style={[styles.mergedForwardLineText, styles.mergedForwardLineSenderMeasure]}
      >
        {senderName}
      </ThemedText>
      {renderSummaryContent(resolvedText)}
    </View>
  )
}

function getMessageDisplayName(
  accountId: string,
  conversationType?: V2NIMConversationType,
  teamId?: string
) {
  return getUIKitAppellation({
    account: accountId,
    teamId:
      conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM ? teamId : undefined
  })
}

function getBubbleReplySourceMessage(conversationId: string, message: V2NIMMessage) {
  if (!message.threadReply) {
    return null
  }

  return (
    messageStore.getMessageById(conversationId, message.threadReply.messageClientId) ||
    (message.threadReply.messageServerId
      ? messageStore.getMessageById(conversationId, message.threadReply.messageServerId)
      : null)
  )
}

function canOpenReplySourceMessage(
  replySourceMessage: V2NIMMessage | null,
  ignoreRevokedState?: boolean
) {
  if (!replySourceMessage) {
    return false
  }

  if (ignoreRevokedState) {
    return true
  }

  return !messageStore.getRevokedText(replySourceMessage)
}

function getAttachmentSource(
  attachment?:
    | V2NIMMessageImageAttachment
    | V2NIMMessageVideoAttachment
    | V2NIMMessageFileAttachment
    | V2NIMMessageAudioAttachment
    | null
) {
  return getImageRenderSource(attachment as V2NIMMessageImageAttachment | null | undefined)
}

function shouldRemoveOuterBubbleFrame(message: V2NIMMessage) {
  return (
    !!getMergedForwardSummary(message) ||
    message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_CALL ||
    message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_IMAGE ||
    message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_VIDEO ||
    message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_AUDIO ||
    message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_FILE ||
    message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_LOCATION
  )
}

function getVideoPreviewSource(attachment?: V2NIMMessageVideoAttachment | null) {
  const source = attachment?.url || attachment?.path || ''

  if (!source) {
    return ''
  }

  if (source.startsWith('file://') || source.startsWith('content://')) {
    return source
  }

  return `${source}${source.includes('?') ? '&' : '?'}vframe=1`
}

function formatVideoDuration(duration?: number) {
  if (!duration) {
    return '00:01'
  }

  const seconds = duration > 1000 ? Math.floor(duration / 1000) : Math.floor(duration)
  const normalizedSeconds = Math.max(1, seconds)
  const minutes = Math.floor(normalizedSeconds / 60)
  const remains = normalizedSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(remains).padStart(2, '0')}`
}

function formatAudioDuration(duration?: number) {
  if (!duration) {
    return '0s'
  }

  const seconds = duration > 1000 ? Math.round(duration / 1000) : Math.round(duration)
  return `${Math.max(1, seconds)}s`
}

function getAudioBubbleWidth(duration?: number) {
  const seconds = duration
    ? duration > 1000
      ? Math.floor(duration / 1000)
      : Math.round(duration)
    : 0

  if (seconds <= 2) {
    return 80
  }

  return Math.min(80 + (seconds - 2) * 8, 250)
}

function formatFileSize(size?: number) {
  if (!size) {
    return translateCurrentApp('commonUnknownSize' as never)
  }

  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`
  }

  if (size >= 1024) {
    return `${Math.round(size / 1024)} KB`
  }

  return `${size} B`
}

function splitFileNameForDisplay(name?: string) {
  const fileName = name?.split('?')[0]?.split('/').pop() || ''
  const extensionIndex = fileName.lastIndexOf('.')

  if (extensionIndex <= 0 || extensionIndex === fileName.length - 1) {
    return {
      prefix: fileName.length > 2 ? fileName.slice(0, -2) : '',
      preservedTail: fileName.length > 2 ? fileName.slice(-2) : fileName,
      suffix: ''
    }
  }

  const baseName = fileName.slice(0, extensionIndex)

  return {
    prefix: baseName.length > 2 ? baseName.slice(0, -2) : '',
    preservedTail: baseName.length > 2 ? baseName.slice(-2) : baseName,
    suffix: fileName.slice(extensionIndex)
  }
}

const FILE_TYPE_TOKEN_EXTENSION_MAP: Record<string, string> = {
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.ms-powerpoint': 'ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'application/pdf': 'pdf',
  'text/plain': 'txt',
  'text/html': 'html',
  'text/csv': 'csv',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/tiff': 'tiff',
  'audio/mpeg': 'mp3',
  'audio/mp3': 'mp3',
  'audio/wav': 'wav',
  'audio/x-wav': 'wav',
  'audio/aac': 'aac',
  'audio/mp4': 'm4a',
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
  'application/zip': 'zip',
  'application/x-zip-compressed': 'zip',
  'application/vnd.rar': 'rar',
  'application/x-rar-compressed': 'rar',
  'application/x-7z-compressed': '7z',
  'com.adobe.pdf': 'pdf',
  'com.microsoft.word.doc': 'doc',
  'org.openxmlformats.wordprocessingml.document': 'docx',
  'com.microsoft.excel.xls': 'xls',
  'org.openxmlformats.spreadsheetml.sheet': 'xlsx',
  'com.microsoft.powerpoint.ppt': 'ppt',
  'org.openxmlformats.presentationml.presentation': 'pptx',
  'com.pkware.zip-archive': 'zip',
  'com.rarlab.rar-archive': 'rar',
  'public.jpeg': 'jpeg',
  'public.jpg': 'jpg',
  'public.png': 'png',
  'public.gif': 'gif',
  'public.tiff': 'tiff',
  'public.plain-text': 'txt',
  'public.html': 'html',
  'public.mpeg-4': 'mp4',
  'public.mp3': 'mp3',
  'public.wav': 'wav'
}

function resolveFileExtensionLike(extension?: string | null, fileName?: string) {
  const rawToken = (extension || '').trim()
  const normalizedToken = rawToken.toLowerCase().replace(/^\./, '')
  const mapped = FILE_TYPE_TOKEN_EXTENSION_MAP[normalizedToken]
  if (mapped) {
    return mapped
  }

  if (normalizedToken.includes('/')) {
    const mime = normalizedToken
    const mimeMapped = FILE_TYPE_TOKEN_EXTENSION_MAP[mime]
    if (mimeMapped) {
      return mimeMapped
    }
  }

  if (
    normalizedToken.startsWith('public.') ||
    normalizedToken.startsWith('com.') ||
    normalizedToken.startsWith('org.')
  ) {
    const last = normalizedToken.split('.').pop() || ''
    if (last && last.length <= 6 && /^[a-z0-9]+$/.test(last)) {
      return last
    }
  }

  const extractedFromName =
    fileName?.split('?')[0]?.split('/').pop()?.split('.').pop()?.toLowerCase().replace(/^\./, '') ||
    ''

  return extractedFromName || normalizedToken
}

function getFileIconTypeByExtension(extension?: string | null, fileName?: string): NEUIKitIconName {
  const normalizedExtension = resolveFileExtensionLike(extension, fileName)

  if (normalizedExtension === 'doc' || normalizedExtension === 'docx') {
    return 'icon-Word'
  }

  if (
    normalizedExtension === 'xls' ||
    normalizedExtension === 'xlsx' ||
    normalizedExtension === 'csv'
  ) {
    return 'icon-Excel'
  }

  if (normalizedExtension === 'ppt' || normalizedExtension === 'pptx') {
    return 'icon-PPT'
  }

  if (
    normalizedExtension === 'jpg' ||
    normalizedExtension === 'png' ||
    normalizedExtension === 'jpeg' ||
    normalizedExtension === 'tiff' ||
    normalizedExtension === 'gif' ||
    normalizedExtension === 'webp'
  ) {
    return 'icon-tupian2'
  }

  if (
    normalizedExtension === 'zip' ||
    normalizedExtension === '7z' ||
    normalizedExtension === 'tar' ||
    normalizedExtension === 'rar'
  ) {
    return 'icon-RAR1'
  }

  if (normalizedExtension === 'pdf' || normalizedExtension === 'rtf') {
    return 'icon-PPT'
  }

  if (normalizedExtension === 'txt' || normalizedExtension === 'html') {
    return 'icon-qita'
  }

  if (
    normalizedExtension === 'mp3' ||
    normalizedExtension === 'wav' ||
    normalizedExtension === 'aac' ||
    normalizedExtension === 'flac' ||
    normalizedExtension === 'wma'
  ) {
    return 'icon-yinle'
  }

  if (
    normalizedExtension === 'mp4' ||
    normalizedExtension === 'avi' ||
    normalizedExtension === 'wmv' ||
    normalizedExtension === 'mpeg' ||
    normalizedExtension === 'm4v' ||
    normalizedExtension === 'mov' ||
    normalizedExtension === 'asf' ||
    normalizedExtension === 'flv' ||
    normalizedExtension === 'f4v' ||
    normalizedExtension === 'rmvb' ||
    normalizedExtension === 'rm' ||
    normalizedExtension === '3gp'
  ) {
    return 'icon-shipin'
  }

  return 'icon-weizhiwenjian'
}

function UIKitAttachmentSendingProgress({
  variant,
  progress
}: {
  variant: 'file' | 'media'
  progress?: number
}) {
  const isMedia = variant === 'media'
  const normalizedProgress = Math.max(
    ATTACHMENT_SENDING_MIN_PROGRESS,
    Math.min(0.99, progress ?? 0)
  )
  const nativeStyle = isMedia ? styles.mediaSendingIndicator : styles.fileSendingIndicator

  if (NativeAttachmentProgressView) {
    return (
      <NativeAttachmentProgressView
        variant={variant}
        progress={normalizedProgress}
        style={nativeStyle}
      />
    )
  }

  const progressStyles = isMedia
    ? {
        fillColor: '#FFFFFF',
        coverColor: 'rgba(0, 0, 0, 0.3)',
        centerColor: 'rgba(0, 0, 0, 0.53)',
        containerStyle: styles.mediaSendingIndicator,
        rightCoverStyle: styles.mediaSendingRightCover,
        leftCoverStyle: styles.mediaSendingLeftCover,
        centerStyle: styles.mediaSendingCenterMask,
        pauseIconStyle: styles.mediaSendingPauseIcon,
        pauseBarStyle: styles.mediaSendingPauseBar
      }
    : {
        fillColor: '#FFFFFF',
        coverColor: 'rgba(0, 0, 0, 0.3)',
        centerColor: 'rgba(0, 0, 0, 0.53)',
        containerStyle: styles.fileSendingIndicator,
        rightCoverStyle: styles.fileSendingRightCover,
        leftCoverStyle: styles.fileSendingLeftCover,
        centerStyle: styles.fileSendingCenterMask,
        pauseIconStyle: styles.fileSendingPauseIcon,
        pauseBarStyle: styles.fileSendingPauseBar
      }
  const rightCoverDeg = Math.min(normalizedProgress, 0.5) * 360
  const leftCoverDeg = Math.max(normalizedProgress - 0.5, 0) * 360

  return (
    <View
      style={[
        styles.attachmentSendingIndicator,
        progressStyles.containerStyle,
        { backgroundColor: progressStyles.fillColor }
      ]}
    >
      <View
        style={[
          styles.attachmentSendingCover,
          styles.attachmentSendingRightCover,
          progressStyles.rightCoverStyle,
          {
            backgroundColor: progressStyles.coverColor,
            transform: [{ rotate: `${rightCoverDeg}deg` }]
          }
        ]}
      />
      <View
        style={[
          styles.attachmentSendingCover,
          styles.attachmentSendingLeftCover,
          progressStyles.leftCoverStyle,
          {
            backgroundColor: progressStyles.coverColor,
            transform: [{ rotate: `${leftCoverDeg}deg` }]
          }
        ]}
      />
      <View
        style={[
          styles.attachmentSendingCenterMask,
          progressStyles.centerStyle,
          { backgroundColor: progressStyles.centerColor }
        ]}
      />
      <View style={[styles.attachmentSendingPauseIcon, progressStyles.pauseIconStyle]}>
        <View style={[styles.attachmentSendingPauseBar, progressStyles.pauseBarStyle]} />
        <View style={[styles.attachmentSendingPauseBar, progressStyles.pauseBarStyle]} />
      </View>
    </View>
  )
}

function shouldShowAttachmentSendStatusLoading(message: V2NIMMessage, alignAsMyMessage: boolean) {
  if (
    !alignAsMyMessage ||
    message.sendingState !== V2NIMMessageSendingState.V2NIM_MESSAGE_SENDING_STATE_SENDING
  ) {
    return false
  }

  if (message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_FILE) {
    return Platform.OS === 'ios'
  }

  return (
    message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_IMAGE ||
    message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_VIDEO
  )
}

function shouldShowTextSendStatusLoading(message: V2NIMMessage, alignAsMyMessage: boolean) {
  return (
    alignAsMyMessage &&
    message.sendingState === V2NIMMessageSendingState.V2NIM_MESSAGE_SENDING_STATE_SENDING &&
    (message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_TEXT ||
      message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_CUSTOM)
  )
}

export const UIKitChatMessageBubble = observer(function UIKitChatMessageBubble({
  message,
  currentUserId,
  conversationId,
  conversationType,
  targetId,
  onLongPress,
  onLongPressAvatar,
  onPressMessage,
  onPressReplyMessage,
  onReeditMessage,
  reeditHidden,
  onRetry,
  downloadingVideoIds,
  downloadedVideoMap,
  videoDownloadProgressMap,
  downloadingFileIds,
  downloadedFileMap,
  fileDownloadProgressMap,
  playingAudioMessageId,
  selectionMode,
  selected,
  selectable,
  onToggleSelect,
  showReadReceipt = true,
  readOnly = false,
  highlighted = false,
  hideIdentity = false,
  hideReplyPreview = false,
  ignoreRevokedState = false,
  disableAvatarPress = false,
  senderAccountOverride,
  senderNameOverride,
  senderAvatarOverride,
  richTextNumberOfLines,
  attachmentUploadProgress,
  videoUploadPreview
}: {
  message: V2NIMMessage
  currentUserId: string | null
  conversationId: string
  conversationType?: V2NIMConversationType
  targetId?: string
  onLongPress: (context: UIKitChatMessageLongPressContext) => void
  onLongPressAvatar?: (message: V2NIMMessage) => void
  onPressMessage: (message: V2NIMMessage) => void
  onPressReplyMessage: (message: V2NIMMessage) => void
  onReeditMessage: (message: V2NIMMessage) => void
  reeditHidden: boolean
  onRetry: (message: V2NIMMessage) => void
  downloadingVideoIds: string[]
  downloadedVideoMap: Record<string, string>
  videoDownloadProgressMap?: Record<string, number>
  downloadingFileIds: string[]
  downloadedFileMap: Record<string, string>
  fileDownloadProgressMap?: Record<string, number>
  playingAudioMessageId?: string | null
  selectionMode: boolean
  selected: boolean
  selectable: boolean
  onToggleSelect: (message: V2NIMMessage) => void
  showReadReceipt?: boolean
  readOnly?: boolean
  highlighted?: boolean
  hideIdentity?: boolean
  hideReplyPreview?: boolean
  ignoreRevokedState?: boolean
  disableAvatarPress?: boolean
  senderAccountOverride?: string
  senderNameOverride?: string
  senderAvatarOverride?: string
  richTextNumberOfLines?: number
  attachmentUploadProgress?: number
  videoUploadPreview?: string
}) {
  const { width: windowWidth } = useWindowDimensions()
  const bubblePressableRef = useRef<View | null>(null)
  const displaySenderAccount = senderAccountOverride || message.senderId
  const isMyMessage = displaySenderAccount === currentUserId
  const alignAsMyMessage = isMyMessage && !readOnly
  const attachment = message.attachment
  const [audioPlayFrame, setAudioPlayFrame] = useState(3)
  const revokedText = ignoreRevokedState ? null : messageStore.getRevokedText(message)
  const replyToMessage = getBubbleReplySourceMessage(conversationId, message)
  const replySourceUnavailable =
    !!message.threadReply &&
    (!replyToMessage || (!ignoreRevokedState && !!messageStore.getRevokedText(replyToMessage)))
  const canOpenReplySource = canOpenReplySourceMessage(replyToMessage, ignoreRevokedState)
  const replyPreviewText =
    !replySourceUnavailable && replyToMessage
      ? getUIKitReplySourcePreview(replyToMessage)
      : translateCurrentApp('commonReplySourceUnavailable' as never)
  const replySenderName =
    !replySourceUnavailable && message.threadReply
      ? getMessageDisplayName(message.threadReply.senderId, conversationType, targetId)
      : ''

  useEffect(() => {
    if (message.messageType !== V2NIMMessageType.V2NIM_MESSAGE_TYPE_NOTIFICATION) {
      return
    }

    const accountIds = getTeamNotificationAccountIds(message)
    if (accountIds.length === 0) {
      return
    }

    ensureUIKitUserProfiles(accountIds).catch(() => undefined)
  }, [message])

  const isFailedMessage =
    isMyMessage &&
    message.sendingState === V2NIMMessageSendingState.V2NIM_MESSAGE_SENDING_STATE_FAILED
  const canRenderReadReceipt =
    alignAsMyMessage &&
    showReadReceipt &&
    message.sendingState === V2NIMMessageSendingState.V2NIM_MESSAGE_SENDING_STATE_SUCCEEDED
  const isSendingAudioMessage =
    alignAsMyMessage &&
    message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_AUDIO &&
    message.sendingState === V2NIMMessageSendingState.V2NIM_MESSAGE_SENDING_STATE_SENDING
  const showAttachmentSendStatusLoading = shouldShowAttachmentSendStatusLoading(
    message,
    alignAsMyMessage
  )
  const showTextSendStatusLoading = shouldShowTextSendStatusLoading(message, alignAsMyMessage)
  const antispamReason = messageStore.getAntispamReason(message)
  const isAntispamBlocked = !!antispamReason
  const removeOuterBubbleFrame = shouldRemoveOuterBubbleFrame(message)
  const mergedForwardSummary = getMergedForwardSummary(message)
  const mergedForwardPreviewItems = useMemo(
    () => mergedForwardSummary?.previewList.slice(0, 3) || [],
    [mergedForwardSummary?.previewList]
  )
  const [mergedForwardNaturalLines, setMergedForwardNaturalLines] = useState<number[]>([])
  const [mergedForwardMeasured, setMergedForwardMeasured] = useState(false)
  const handleOpenActionMenu = () => {
    bubblePressableRef.current?.measureInWindow((x, y, width, height) => {
      onLongPress({
        message,
        align: alignAsMyMessage ? 'right' : 'left',
        anchorRect: { x, y, width, height }
      })
    })
  }
  const mergedForwardTitleParts = mergedForwardSummary
    ? splitMergedForwardTitle(mergedForwardSummary.title)
    : null
  const isPinned = !readOnly && !!messageStore.isMessagePinned(message)
  const pinInfo = isPinned ? messageStore.getPinnedMessageInfo(message) : null
  const pinOperatorId =
    (pinInfo as { operatorId?: string; opeartorId?: string } | null)?.operatorId ||
    pinInfo?.opeartorId ||
    ''
  const pinOperatorDisplayName =
    pinOperatorId && pinOperatorId !== currentUserId
      ? getMessageDisplayName(pinOperatorId, conversationType, targetId)
      : ''
  const pinTipSuffix =
    pinOperatorId && pinOperatorId === currentUserId
      ? translateCurrentApp('chatPinnedByYou' as never)
      : translateCurrentApp('chatPinnedMessage' as never)
  const showSenderName =
    !!senderNameOverride ||
    (!isMyMessage &&
      conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM &&
      !!targetId)
  const senderName = showSenderName
    ? senderNameOverride || getMessageDisplayName(displaySenderAccount, conversationType, targetId)
    : ''
  const availableRowWidth = Math.max(0, windowWidth - CHAT_LIST_HORIZONTAL_PADDING)
  const occupiedRowWidth =
    MESSAGE_AVATAR_SPACE +
    (selectionMode ? MESSAGE_SELECTION_SPACE : 0) +
    (canRenderReadReceipt ? MESSAGE_RECEIPT_SPACE : 0) +
    (isFailedMessage && !readOnly ? MESSAGE_RETRY_SPACE : 0)
  const messageBubbleMaxWidth = Math.max(
    MIN_MESSAGE_BUBBLE_WIDTH,
    availableRowWidth - occupiedRowWidth
  )
  const messageContentMaxWidth = Math.max(
    MIN_MESSAGE_BUBBLE_WIDTH - MESSAGE_BUBBLE_HORIZONTAL_PADDING,
    messageBubbleMaxWidth - MESSAGE_BUBBLE_HORIZONTAL_PADDING
  )
  const mergedForwardCardWidth = Math.min(260, messageContentMaxWidth)
  const toggleCurrentMessageSelection = () => {
    if (!selectionMode) {
      return false
    }

    onToggleSelect(message)
    return true
  }
  const swallowSelectionModeInteraction = () => selectionMode

  useEffect(() => {
    const messageKey = getMessageKey(message)

    if (
      message.messageType !== V2NIMMessageType.V2NIM_MESSAGE_TYPE_AUDIO ||
      playingAudioMessageId !== messageKey
    ) {
      setAudioPlayFrame(3)
      return
    }

    setAudioPlayFrame(1)
    const timer = setInterval(() => {
      setAudioPlayFrame((current) => (current >= 3 ? 1 : current + 1))
    }, AUDIO_PLAY_FRAME_INTERVAL_MS)

    return () => clearInterval(timer)
  }, [message, playingAudioMessageId])

  useEffect(() => {
    setMergedForwardNaturalLines((current) => (current.length === 0 ? current : []))
    setMergedForwardMeasured(false)
  }, [
    message.messageClientId,
    message.messageServerId,
    mergedForwardCardWidth,
    mergedForwardPreviewItems,
    mergedForwardSummary?.title
  ])

  useEffect(() => {
    if (
      mergedForwardPreviewItems.length > 0 &&
      mergedForwardNaturalLines.length === mergedForwardPreviewItems.length &&
      mergedForwardNaturalLines.every((lineCount) => lineCount > 0)
    ) {
      setMergedForwardMeasured(true)
    }
  }, [mergedForwardNaturalLines, mergedForwardPreviewItems.length])

  const mergedForwardLineClamps = useMemo(() => {
    if (mergedForwardNaturalLines.length !== mergedForwardPreviewItems.length) {
      return []
    }

    return getMergedForwardPreviewLineClamps(mergedForwardNaturalLines)
  }, [mergedForwardNaturalLines, mergedForwardPreviewItems.length])

  const renderBubbleContent = () => {
    if (mergedForwardSummary) {
      return (
        <View
          style={[
            styles.mergedForwardCard,
            {
              width: mergedForwardCardWidth
            }
          ]}
        >
          <View style={styles.mergedForwardTitleRow}>
            <ThemedText
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[styles.mergedForwardTitle, styles.mergedForwardTitlePrefix]}
            >
              {mergedForwardTitleParts?.prefix || mergedForwardSummary.title}
            </ThemedText>
            {mergedForwardTitleParts?.suffix ? (
              <ThemedText style={[styles.mergedForwardTitle, styles.mergedForwardTitleSuffix]}>
                {mergedForwardTitleParts.suffix}
              </ThemedText>
            ) : null}
          </View>
          <View style={styles.mergedForwardContent}>
            {!mergedForwardMeasured ? (
              <View pointerEvents="none" style={styles.mergedForwardMeasureLayer}>
                {mergedForwardPreviewItems.map((item, index) => {
                  return (
                    <View
                      key={`${getMessageKey(message)}-measure-${index}`}
                      style={styles.mergedForwardLineRow}
                    >
                      <MergedForwardPreviewLine
                        item={item}
                        measureOnly
                        onMeasureLineCount={(nextLineCount) => {
                          if (mergedForwardNaturalLines[index]) {
                            return
                          }

                          setMergedForwardNaturalLines((current) => {
                            if (current[index] === nextLineCount) {
                              return current
                            }

                            const next = current.slice()
                            next[index] = nextLineCount
                            return next
                          })
                        }}
                      />
                    </View>
                  )
                })}
              </View>
            ) : null}
            {mergedForwardPreviewItems.map((item, index) => {
              const lineLimit = mergedForwardMeasured
                ? mergedForwardLineClamps[index]
                : index === 0
                  ? MERGED_FORWARD_MAX_TOTAL_LINES
                  : 0

              if (typeof lineLimit === 'number' && lineLimit <= 0) {
                return null
              }

              return (
                <View
                  key={`${getMessageKey(message)}-${index}`}
                  style={styles.mergedForwardLineRow}
                >
                  <MergedForwardPreviewLine item={item} lineLimit={lineLimit} />
                </View>
              )
            })}
          </View>
          <View style={styles.mergedForwardFooter}>
            <ThemedText style={styles.mergedForwardFooterText}>
              {translateCurrentApp('chatMergedForwardFooter' as never)}
            </ThemedText>
          </View>
        </View>
      )
    }

    if (message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_IMAGE) {
      const imageAttachment = attachment as V2NIMMessageImageAttachment | undefined
      const imageSource = getAttachmentSource(imageAttachment)
      const isPortraitImage =
        typeof imageAttachment?.width === 'number' &&
        typeof imageAttachment?.height === 'number' &&
        imageAttachment.height > imageAttachment.width
      const isSendingImage =
        message.sendingState === V2NIMMessageSendingState.V2NIM_MESSAGE_SENDING_STATE_SENDING
      const imageStyle = [styles.imageMessage, isPortraitImage ? styles.imageMessagePortrait : null]
      const imageWidth = Math.min(isPortraitImage ? 144 : 184, messageContentMaxWidth)

      if (imageSource || isSendingImage) {
        return (
          <View
            style={[
              imageStyle,
              {
                width: imageWidth,
                height: isPortraitImage
                  ? Math.round(imageWidth * (196 / 144))
                  : Math.round(imageWidth * (160 / 184))
              }
            ]}
          >
            {imageSource ? (
              <Image source={imageSource} style={styles.imageMessagePreview} contentFit="cover" />
            ) : null}
            {isSendingImage ? (
              <View style={styles.mediaProgressOverlay}>
                <View style={styles.mediaProgressCircle}>
                  <ActivityIndicator color="#FFFFFF" />
                </View>
              </View>
            ) : null}
          </View>
        )
      }
    }

    if (message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_VIDEO) {
      const videoAttachment = attachment as V2NIMMessageVideoAttachment | undefined
      const videoMessageKey = getMessageKey(message)
      const isSendingVideo =
        message.sendingState === V2NIMMessageSendingState.V2NIM_MESSAGE_SENDING_STATE_SENDING
      const videoPreviewSource =
        isSendingVideo && videoUploadPreview
          ? videoUploadPreview
          : getVideoPreviewSource(videoAttachment)
      const isDownloadingVideo = downloadingVideoIds.includes(videoMessageKey)
      const videoDownloadProgress = videoDownloadProgressMap?.[videoMessageKey]
      const isPortraitVideo =
        typeof videoAttachment?.width === 'number' &&
        typeof videoAttachment?.height === 'number' &&
        videoAttachment.height > videoAttachment.width
      const videoWidth = Math.min(isPortraitVideo ? 152 : 190, messageContentMaxWidth)
      const showVideoProgress = isSendingVideo || isDownloadingVideo

      return (
        <View
          style={[
            styles.videoCard,
            isPortraitVideo ? styles.videoCardPortrait : null,
            {
              width: videoWidth,
              height: isPortraitVideo
                ? Math.round(videoWidth * (204 / 152))
                : Math.round(videoWidth * (160 / 190))
            }
          ]}
        >
          {videoPreviewSource ? (
            <Image
              source={videoPreviewSource}
              style={styles.videoPreviewImage}
              contentFit="cover"
            />
          ) : (
            <View style={styles.videoPreviewFallback} />
          )}
          {showVideoProgress ? (
            <View style={styles.mediaProgressOverlay}>
              {isSendingVideo ? (
                <UIKitAttachmentSendingProgress
                  variant="media"
                  progress={attachmentUploadProgress}
                />
              ) : (
                <UIKitAttachmentSendingProgress variant="media" progress={videoDownloadProgress} />
              )}
            </View>
          ) : (
            <View style={styles.videoPlayBadge}>
              <View style={styles.videoPlayCircle}>
                <View style={styles.videoPlayTriangle} />
              </View>
            </View>
          )}
          <View style={styles.videoDurationBadge}>
            <ThemedText style={styles.videoDurationText}>
              {formatVideoDuration(videoAttachment?.duration)}
            </ThemedText>
          </View>
        </View>
      )
    }

    if (message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_AUDIO) {
      const audioAttachment = attachment as V2NIMMessageAudioAttachment | undefined
      const audioMessageKey = getMessageKey(message)
      const isPlayingAudio = playingAudioMessageId === audioMessageKey
      const durationText = formatAudioDuration(audioAttachment?.duration)
      const audioFrameIndex = Math.max(0, Math.min(2, audioPlayFrame - 1))
      const audioIconType = alignAsMyMessage
        ? isPlayingAudio
          ? AUDIO_PLAY_RIGHT_FRAMES[audioFrameIndex]
          : 'audio-play-right-3'
        : isPlayingAudio
          ? AUDIO_PLAY_LEFT_FRAMES[audioFrameIndex]
          : 'audio-play-left-3'
      const icon = (
        <View style={styles.audioIconWrap}>
          <UIKitIcon type={audioIconType} size={28} />
        </View>
      )
      const time = (
        <ThemedText numberOfLines={1} style={styles.audioDuration}>
          {durationText}
        </ThemedText>
      )

      return (
        <View
          style={[
            styles.audioCard,
            alignAsMyMessage ? styles.audioCardMyMessage : styles.audioCardOtherMessage,
            {
              width: Math.min(
                getAudioBubbleWidth(audioAttachment?.duration),
                messageContentMaxWidth
              )
            },
            alignAsMyMessage && styles.audioCardRight
          ]}
        >
          {alignAsMyMessage ? time : icon}
          {alignAsMyMessage ? icon : time}
        </View>
      )
    }

    if (message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_FILE) {
      const fileAttachment = attachment as V2NIMMessageFileAttachment | undefined
      const fileMessageKey = getMessageKey(message)
      const isDownloading = downloadingFileIds.includes(fileMessageKey)
      const fileDownloadProgress = fileDownloadProgressMap?.[fileMessageKey]
      const isDownloaded = !!downloadedFileMap[fileMessageKey]
      const isSendingFile =
        message.sendingState === V2NIMMessageSendingState.V2NIM_MESSAGE_SENDING_STATE_SENDING
      const fileIconType = getFileIconTypeByExtension(fileAttachment?.ext, fileAttachment?.name)
      const fileNameDisplay = splitFileNameForDisplay(fileAttachment?.name)
      const showFileProgress = isSendingFile || isDownloading

      return (
        <View
          style={[
            styles.fileCard,
            {
              width: messageContentMaxWidth
            }
          ]}
        >
          <View style={styles.fileIconWrap}>
            <View style={styles.fileIcon}>
              <UIKitIcon type={fileIconType} size={32} />
            </View>
            {showFileProgress ? (
              <View style={styles.fileProgressOverlay}>
                {isSendingFile ? (
                  <UIKitAttachmentSendingProgress
                    variant="file"
                    progress={attachmentUploadProgress}
                  />
                ) : (
                  <UIKitAttachmentSendingProgress variant="file" progress={fileDownloadProgress} />
                )}
              </View>
            ) : null}
          </View>
          <View style={styles.fileMeta}>
            <View style={styles.fileNameRow}>
              <View style={styles.fileNameBase}>
                <ThemedText
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={[
                    styles.messageText,
                    styles.fileNamePrefix,
                    alignAsMyMessage ? styles.myMessageText : styles.otherMessageText
                  ]}
                >
                  {fileNameDisplay.prefix}
                </ThemedText>
                {fileNameDisplay.preservedTail ? (
                  <ThemedText
                    style={[
                      styles.messageText,
                      styles.fileNameTail,
                      alignAsMyMessage ? styles.myMessageText : styles.otherMessageText
                    ]}
                  >
                    {fileNameDisplay.preservedTail}
                  </ThemedText>
                ) : null}
              </View>
              {fileNameDisplay.suffix ? (
                <ThemedText
                  style={[
                    styles.messageText,
                    styles.fileNameSuffix,
                    alignAsMyMessage ? styles.myMessageText : styles.otherMessageText
                  ]}
                >
                  {fileNameDisplay.suffix}
                </ThemedText>
              ) : null}
            </View>
            <ThemedText
              style={[
                styles.attachmentMeta,
                alignAsMyMessage ? styles.myMessageText : styles.otherMessageText
              ]}
            >
              {isDownloaded
                ? translateCurrentApp('commonDownloadedSize' as never, {
                    size: formatFileSize(fileAttachment?.size)
                  })
                : formatFileSize(fileAttachment?.size)}
            </ThemedText>
          </View>
        </View>
      )
    }

    if (message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_LOCATION) {
      const locationAttachment = attachment as V2NIMMessageLocationAttachment | undefined
      const locationText = resolveLocationText(message.text, locationAttachment?.address)
      const mapImageUrl = getAmapStaticMapUrl(
        locationAttachment?.latitude,
        locationAttachment?.longitude
      )

      return (
        <View style={[styles.locationCard, { width: Math.min(242, messageContentMaxWidth) }]}>
          <View style={styles.locationTextWrap}>
            <ThemedText numberOfLines={1} style={styles.locationTitle}>
              {locationText.title}
            </ThemedText>
            <ThemedText numberOfLines={1} style={styles.locationSubtitle}>
              {locationText.subtitle}
            </ThemedText>
          </View>
          <View style={styles.locationMapWrap}>
            {mapImageUrl ? (
              <Image
                source={{ uri: mapImageUrl }}
                style={styles.locationMapImage}
                contentFit="cover"
              />
            ) : (
              <View style={styles.locationMapPlaceholder} />
            )}
            <View style={styles.locationMarker}>
              <View style={styles.locationMarkerDot} />
            </View>
          </View>
        </View>
      )
    }

    if (isCallMessage(message)) {
      const durationSeconds = getCallMessageDurationSeconds(message)
      const statusText = getCallMessageStatusText(message)
      const iconType = getCallMessageIconType(message)
      const showDuration = durationSeconds > 0

      return (
        <View
          style={[
            styles.callMessageCard,
            alignAsMyMessage ? styles.callMessageCardMy : styles.callMessageCardOther
          ]}
        >
          <UIKitIcon type={iconType} size={28} />
          <ThemedText
            numberOfLines={1}
            style={[
              styles.callMessageStatus,
              alignAsMyMessage ? styles.myMessageText : styles.otherMessageText
            ]}
          >
            {statusText}
          </ThemedText>
          {showDuration ? (
            <ThemedText
              numberOfLines={1}
              style={[
                styles.callMessageDuration,
                alignAsMyMessage ? styles.myMessageText : styles.otherMessageText
              ]}
            >
              {formatCallDuration(durationSeconds)}
            </ThemedText>
          ) : null}
        </View>
      )
    }

    if (richTextNumberOfLines) {
      return (
        <UIKitChatRichText
          text={getUIKitMessagePreview(message)}
          ext={message.serverExtension}
          numberOfLines={richTextNumberOfLines}
          ellipsizeMode="tail"
          textStyle={[
            styles.messageText,
            alignAsMyMessage ? styles.myMessageText : styles.otherMessageText
          ]}
          containerStyle={styles.messageRichText}
          onPressLink={() => {
            if (swallowSelectionModeInteraction()) {
              return
            }
          }}
          onLongPressLink={selectionMode ? undefined : handleOpenActionMenu}
        />
      )
    }

    return (
      <UIKitChatRichText
        text={getUIKitMessagePreview(message)}
        ext={message.serverExtension}
        textStyle={[
          styles.messageText,
          alignAsMyMessage ? styles.myMessageText : styles.otherMessageText
        ]}
        containerStyle={styles.messageRichText}
        onPressLink={() => {
          if (swallowSelectionModeInteraction()) {
            return
          }
        }}
        onLongPressLink={selectionMode ? undefined : handleOpenActionMenu}
      />
    )
  }

  if (revokedText) {
    const canReedit =
      revokedText === translateCurrentApp('commonRecallByYou' as never) &&
      message.senderId === currentUserId &&
      message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_TEXT &&
      !!message.text &&
      !reeditHidden

    return (
      <View style={styles.systemRow}>
        <View style={[styles.systemBubble, canReedit && styles.reeditSystemBubble]}>
          <ThemedText style={styles.systemText}>{revokedText}</ThemedText>
          {canReedit ? (
            <TouchableOpacity
              onPress={() => {
                if (swallowSelectionModeInteraction()) {
                  return
                }

                onReeditMessage(message)
              }}
            >
              <ThemedText style={styles.reeditText}>
                {translateCurrentApp('reeditText' as never)}
              </ThemedText>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    )
  }

  if (
    message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_NOTIFICATION ||
    message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_TIPS
  ) {
    return (
      <View style={styles.systemRow}>
        {isAntispamTipMessage(message) ? (
          <View style={styles.antispamTipBubble}>
            <ThemedText style={styles.antispamTipText}>
              {getUIKitMessagePreview(message)}
            </ThemedText>
          </View>
        ) : isFriendDeletedTipMessage(message) ? (
          <View style={styles.friendDeletedTipBubble}>
            <ThemedText style={styles.friendDeletedTipText}>
              {translateCurrentApp('sendFailWithDeleteText' as never)}
            </ThemedText>
            <TouchableOpacity
              onPress={async () => {
                if (swallowSelectionModeInteraction()) {
                  return
                }

                const pathname = await resolveUIKitProfileRoute(message.receiverId)
                router.push({
                  pathname,
                  params: { accountId: message.receiverId }
                } as never)
              }}
            >
              <ThemedText style={styles.friendVerificationText}>
                {translateCurrentApp('friendVerificationText' as never)}
              </ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.systemBubble}>
            <ThemedText style={styles.systemText}>{getUIKitMessagePreview(message)}</ThemedText>
          </View>
        )}
      </View>
    )
  }

  return (
    <View
      style={[
        alignAsMyMessage ? styles.myMessageRow : styles.otherMessageRow,
        selectionMode && styles.selectionModeRow,
        highlighted && styles.highlightedMessageRow
      ]}
    >
      {isPinned && selectionMode ? (
        <View pointerEvents="none" style={styles.pinBackgroundSelectionRow} />
      ) : null}
      {selectionMode ? (
        <TouchableOpacity
          style={[
            styles.selectBox,
            styles.selectBoxSelectionMode,
            selected && styles.selectBoxActive,
            !selectable && styles.selectBoxDisabled
          ]}
          disabled={!selectable}
          onPress={() => onToggleSelect(message)}
        >
          {selected ? <ThemedText style={styles.selectBoxText}>✓</ThemedText> : null}
        </TouchableOpacity>
      ) : null}
      {!alignAsMyMessage && !hideIdentity ? (
        disableAvatarPress ? (
          <View style={[styles.messageBubbleAvatar, styles.messageBubbleAvatarLeft]}>
            <UIKitUserAvatar
              account={displaySenderAccount}
              teamId={
                conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM
                  ? targetId
                  : undefined
              }
              avatar={senderAvatarOverride}
              fallbackLabel={senderNameOverride}
              size={42}
            />
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.messageBubbleAvatar, styles.messageBubbleAvatarLeft]}
            onPress={async () => {
              if (swallowSelectionModeInteraction()) {
                return
              }

              const pathname = await resolveUIKitProfileRoute(displaySenderAccount)
              router.push({
                pathname,
                params: { accountId: displaySenderAccount }
              } as never)
            }}
            onLongPress={selectionMode ? undefined : () => onLongPressAvatar?.(message)}
            delayLongPress={250}
          >
            <UIKitUserAvatar
              account={displaySenderAccount}
              teamId={
                conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM
                  ? targetId
                  : undefined
              }
              avatar={senderAvatarOverride}
              fallbackLabel={senderNameOverride}
              size={42}
            />
          </TouchableOpacity>
        )
      ) : null}
      <View
        style={[
          styles.messageBubbleContainer,
          isPinned && styles.messageBubbleContainerPinned,
          isPinned && selectionMode && styles.messageBubbleContainerPinnedSelectionMode,
          alignAsMyMessage ? styles.myMessageContainer : styles.otherMessageContainer
        ]}
      >
        {isPinned && !selectionMode ? (
          <View
            pointerEvents="none"
            style={[
              styles.pinBackground,
              alignAsMyMessage ? styles.pinBackgroundMyMessage : styles.pinBackgroundOtherMessage
            ]}
          />
        ) : null}
        {isFailedMessage && !readOnly ? (
          <TouchableOpacity
            style={[
              styles.retryButton,
              alignAsMyMessage && styles.retryButtonForMyMessage,
              isAntispamBlocked && styles.retryButtonMuted
            ]}
            onPress={
              selectionMode
                ? () => undefined
                : isAntispamBlocked
                  ? undefined
                  : () => onRetry(message)
            }
            disabled={!selectionMode && isAntispamBlocked}
          >
            <ThemedText
              style={[styles.retryButtonText, isAntispamBlocked && styles.retryButtonTextMuted]}
            >
              !
            </ThemedText>
          </TouchableOpacity>
        ) : null}
        {showSenderName && !hideIdentity ? (
          <ThemedText numberOfLines={1} style={styles.messageSenderName}>
            {senderName}
          </ThemedText>
        ) : null}
        {showAttachmentSendStatusLoading ? (
          <View
            pointerEvents="none"
            style={[
              styles.attachmentSendStatusLoading,
              Platform.OS === 'ios'
                ? styles.attachmentSendStatusLoadingIOS
                : styles.attachmentSendStatusLoadingAndroid
            ]}
          >
            <ActivityIndicator
              color={Platform.OS === 'ios' ? '#8E8E93' : undefined}
              size="small"
              style={[
                styles.attachmentSendStatusSpinner,
                Platform.OS === 'ios'
                  ? styles.attachmentSendStatusSpinnerIOS
                  : styles.attachmentSendStatusSpinnerAndroid
              ]}
            />
          </View>
        ) : null}
        <View
          style={[
            styles.messageBubbleContentRow,
            {
              maxWidth: messageBubbleMaxWidth + (canRenderReadReceipt ? MESSAGE_RECEIPT_SPACE : 0)
            },
            alignAsMyMessage
              ? styles.messageBubbleContentRowMyMessage
              : styles.messageBubbleContentRowOtherMessage
          ]}
        >
          <View
            style={[
              styles.messageBubbleWrap,
              {
                maxWidth: messageBubbleMaxWidth + (canRenderReadReceipt ? MESSAGE_RECEIPT_SPACE : 0)
              },
              alignAsMyMessage
                ? styles.messageBubbleWrapMyMessage
                : styles.messageBubbleWrapOtherMessage,
              isPinned && styles.messageBubbleWrapPinned
            ]}
          >
            <View
              style={[
                styles.messageBubbleInlineRow,
                alignAsMyMessage
                  ? styles.messageBubbleInlineRowMyMessage
                  : styles.messageBubbleInlineRowOtherMessage
              ]}
            >
              {canRenderReadReceipt ? (
                <UIKitChatMessageReceipt
                  message={message}
                  conversationId={conversationId}
                  conversationType={conversationType}
                  targetId={targetId}
                  selectionMode={selectionMode}
                />
              ) : null}
              <View
                style={[
                  styles.messageBubbleSurfaceWrap,
                  { maxWidth: messageBubbleMaxWidth },
                  showTextSendStatusLoading && styles.messageBubbleWrapSendingText,
                  isSendingAudioMessage && styles.messageBubbleWrapSendingAudio,
                  alignAsMyMessage
                    ? styles.messageBubbleSurfaceWrapMyMessage
                    : styles.messageBubbleSurfaceWrapOtherMessage
                ]}
              >
                {showTextSendStatusLoading ? (
                  <ActivityIndicator
                    color="#337EFF"
                    size="small"
                    style={styles.textSendingIndicator}
                  />
                ) : null}
                {isSendingAudioMessage ? (
                  <ActivityIndicator
                    color="#337EFF"
                    size="small"
                    style={styles.audioSendingIndicator}
                  />
                ) : null}
                <Pressable
                  ref={bubblePressableRef}
                  onLongPress={selectionMode ? undefined : handleOpenActionMenu}
                  onPress={() => {
                    if (toggleCurrentMessageSelection()) {
                      return
                    }

                    onPressMessage(message)
                  }}
                  style={[
                    styles.messageBubble,
                    alignAsMyMessage ? styles.myMessage : styles.otherMessage,
                    removeOuterBubbleFrame && styles.messageBubbleFrameless,
                    isPinned && !removeOuterBubbleFrame && styles.messageBubblePinned,
                    highlighted && styles.highlightedMessageBubble
                  ]}
                >
                  {message.threadReply && !hideReplyPreview ? (
                    <TouchableOpacity
                      style={[
                        styles.replyPreview,
                        alignAsMyMessage ? styles.replyPreviewMy : styles.replyPreviewOther
                      ]}
                      activeOpacity={canOpenReplySource ? 0.8 : 1}
                      onPress={() => {
                        if (swallowSelectionModeInteraction()) {
                          return
                        }

                        if (canOpenReplySource && replyToMessage) {
                          onPressReplyMessage(replyToMessage)
                        }
                      }}
                    >
                      {replySenderName ? (
                        <ThemedText
                          numberOfLines={1}
                          style={[
                            styles.replyPreviewTitle,
                            alignAsMyMessage ? styles.myMessageText : styles.otherMessageText
                          ]}
                        >
                          {replySenderName}
                        </ThemedText>
                      ) : null}
                      <ThemedText
                        numberOfLines={1}
                        style={[
                          styles.replyPreviewText,
                          alignAsMyMessage ? styles.myMessageText : styles.otherMessageText
                        ]}
                      >
                        {replyPreviewText}
                      </ThemedText>
                    </TouchableOpacity>
                  ) : null}
                  {renderBubbleContent()}
                </Pressable>
              </View>
            </View>
            {isPinned ? (
              <View
                style={[
                  styles.pinBadge,
                  alignAsMyMessage ? styles.pinBadgeMyMessage : styles.pinBadgeOtherMessage
                ]}
              >
                <UIKitIcon type="icon-green-pin" size={16} />
                <View
                  style={[
                    styles.pinBadgeTextWrap,
                    alignAsMyMessage && styles.pinBadgeTextWrapMyMessage
                  ]}
                >
                  {pinOperatorDisplayName ? (
                    <ThemedText numberOfLines={1} ellipsizeMode="tail" style={styles.pinBadgeName}>
                      {pinOperatorDisplayName}
                    </ThemedText>
                  ) : null}
                  <ThemedText style={styles.pinBadgeText}>{pinTipSuffix}</ThemedText>
                </View>
              </View>
            ) : null}
          </View>
        </View>
      </View>
      {alignAsMyMessage && !hideIdentity ? (
        disableAvatarPress ? (
          <View style={[styles.messageBubbleAvatar, styles.messageBubbleAvatarRight]}>
            <UIKitUserAvatar
              account={displaySenderAccount}
              avatar={senderAvatarOverride}
              fallbackLabel={senderNameOverride}
              size={42}
            />
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.messageBubbleAvatar, styles.messageBubbleAvatarRight]}
            onPress={async () => {
              if (swallowSelectionModeInteraction()) {
                return
              }

              const pathname = await resolveUIKitProfileRoute(displaySenderAccount)
              router.push({
                pathname,
                params: { accountId: displaySenderAccount }
              } as never)
            }}
            onLongPress={selectionMode ? undefined : () => onLongPressAvatar?.(message)}
            delayLongPress={250}
          >
            <UIKitUserAvatar
              account={displaySenderAccount}
              avatar={senderAvatarOverride}
              fallbackLabel={senderNameOverride}
              size={42}
            />
          </TouchableOpacity>
        )
      ) : null}
    </View>
  )
})

export type UIKitChatMessageLongPressContext = {
  message: V2NIMMessage
  align: 'left' | 'right'
  anchorRect: {
    x: number
    y: number
    width: number
    height: number
  }
}

const UIKitChatMessageReceipt = observer(function UIKitChatMessageReceipt({
  message,
  conversationId,
  conversationType,
  targetId,
  selectionMode = false,
  style
}: {
  message: V2NIMMessage
  conversationId: string
  conversationType?: V2NIMConversationType
  targetId?: string
  selectionMode?: boolean
  style?: StyleProp<ViewStyle>
}) {
  const localOptions = imStoreV2Bridge.rootStore?.localOptions
  const p2pMsgReceiptVisible = localOptions?.p2pMsgReceiptVisible ?? true
  const teamMsgReceiptVisible = localOptions?.teamMsgReceiptVisible ?? true
  const readReceiptEnabled = preferenceStore.preferences.readReceiptEnabled

  if (message.sendingState !== V2NIMMessageSendingState.V2NIM_MESSAGE_SENDING_STATE_SUCCEEDED) {
    return null
  }

  if (!readReceiptEnabled) {
    return null
  }

  if (conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P) {
    if (!p2pMsgReceiptVisible) {
      return null
    }

    const isRead = messageStore.isPeerRead(message)

    return (
      <UIKitMessageReadIndicator
        progress={isRead ? 1 : 0}
        style={[styles.receiptIndicator, style]}
      />
    )
  }

  if (conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM) {
    if (!teamMsgReceiptVisible) {
      return null
    }

    const memberCount = targetId
      ? teamStore.getTeam(targetId)?.memberCount || teamStore.getMembers(targetId).length || 0
      : 0

    if (memberCount > 100) {
      return null
    }

    const receipt = messageStore.getTeamReadReceipt(message)
    const readCount = receipt?.readCount || 0
    const unreadCount = receipt?.unreadCount || 0
    const totalCount = readCount + unreadCount
    const progress = totalCount > 0 ? readCount / totalCount : 0
    const canOpenDetail = !!targetId && !!(message.messageClientId || message.messageServerId)

    return (
      <UIKitMessageReadIndicator
        progress={progress}
        style={[styles.receiptIndicator, style]}
        onPress={
          !selectionMode && canOpenDetail
            ? async () => {
                try {
                  await ensureNetworkAvailable()
                  router.push({
                    pathname: '/chat/read-detail',
                    params: {
                      readConversationId: conversationId,
                      messageId: message.messageClientId || message.messageServerId,
                      teamId: targetId
                    }
                  } as never)
                } catch {
                  toast.alert(
                    translateCurrentApp('commonTip' as never),
                    translateCurrentApp('offlineText' as never)
                  )
                }
              }
            : undefined
        }
      />
    )
  }

  return null
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  keyboardAvoidingView: {
    flex: 1
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF'
  },
  securityTip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFF7E8',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#F2E1C4',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F2E1C4',
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  securityTipText: {
    flex: 1,
    color: '#9A5B00',
    fontSize: 13,
    lineHeight: 18
  },
  securityTipClose: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
  securityTipCloseText: {
    color: '#9A5B00',
    fontSize: 22,
    lineHeight: 24
  },
  newMessageNotice: {
    position: 'absolute',
    right: 18,
    bottom: 104,
    minHeight: 38,
    borderRadius: 19,
    backgroundColor: '#337EFF',
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#337EFF',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4
  },
  newMessageNoticeRaised: {
    bottom: 238
  },
  newMessageNoticeVoiceRaised: {
    bottom: 116
  },
  newMessageNoticeText: {
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700'
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerButtonText: {
    color: '#337EFF',
    fontWeight: '700'
  },
  historyButton: {
    alignSelf: 'center',
    minHeight: 32,
    minWidth: 118,
    borderRadius: 16,
    backgroundColor: '#F2F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    marginBottom: 16
  },
  historyButtonText: {
    color: '#8B95A5',
    fontSize: 12,
    fontWeight: '600'
  },
  emptyState: {
    paddingVertical: 48,
    alignItems: 'center'
  },
  timeDivider: {
    alignItems: 'center',
    marginBottom: 18
  },
  timeDividerText: {
    fontSize: 12,
    color: '#97A2B2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#F5F7FA'
  },
  systemRow: {
    alignItems: 'center',
    marginBottom: 18
  },
  systemBubble: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4
  },
  reeditSystemBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  antispamTipBubble: {
    maxWidth: '92%',
    paddingHorizontal: 4
  },
  antispamTipText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#8A95A5',
    textAlign: 'center'
  },
  friendDeletedTipBubble: {
    maxWidth: '92%',
    paddingHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  friendDeletedTipText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#8A95A5',
    textAlign: 'center'
  },
  friendVerificationText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#337EFF',
    fontWeight: '700'
  },
  inlineFriendDeletedTip: {
    maxWidth: 240,
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end'
  },
  systemText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#8A95A5',
    textAlign: 'center'
  },
  reeditText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#337EFF',
    fontWeight: '700'
  },
  myMessageRow: {
    flexDirection: 'row',
    marginBottom: 18,
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    position: 'relative'
  },
  otherMessageRow: {
    flexDirection: 'row',
    marginBottom: 18,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    position: 'relative'
  },
  selectionModeRow: {
    width: '100%',
    paddingLeft: MESSAGE_SELECTION_SPACE
  },
  highlightedMessageRow: {
    borderRadius: 24,
    backgroundColor: '#FFF6CC',
    paddingVertical: 8,
    marginHorizontal: -8,
    paddingHorizontal: 8
  },
  messageBubbleContainer: {
    // maxWidth: '100%',
    position: 'relative'
  },
  messageBubbleContentRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    position: 'relative',
    zIndex: 2,
    elevation: 2
  },
  messageBubbleContentRowMyMessage: {
    justifyContent: 'flex-end',
    alignSelf: 'flex-end'
  },
  messageBubbleContentRowOtherMessage: {
    justifyContent: 'flex-start',
    alignSelf: 'flex-start'
  },
  messageBubbleInlineRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    flexWrap: 'nowrap',
    position: 'relative',
    zIndex: 3,
    elevation: 3
  },
  messageBubbleInlineRowMyMessage: {
    justifyContent: 'flex-end',
    alignSelf: 'flex-end'
  },
  messageBubbleInlineRowOtherMessage: {
    justifyContent: 'flex-start',
    alignSelf: 'flex-start'
  },
  messageBubbleContainerPinned: {
    alignSelf: 'stretch',
    width: '100%',
    paddingTop: 12,
    paddingBottom: 10
  },
  messageBubbleContainerPinnedSelectionMode: {
    flexShrink: 1
  },
  pinBackground: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderRadius: 22,
    backgroundColor: '#FFFBEA'
  },
  pinBackgroundSelectionRow: {
    position: 'absolute',
    top: -8,
    bottom: 0,
    left: -16,
    right: -16,
    borderRadius: 0,
    backgroundColor: '#FFFBEA',
    zIndex: 0
  },
  pinBackgroundMyMessage: {
    top: -8,
    left: 0,
    right: -70
  },
  pinBackgroundOtherMessage: {
    top: -8,
    left: -100,
    right: 0
  },
  myMessageContainer: {
    alignItems: 'flex-end'
  },
  otherMessageContainer: {
    alignItems: 'flex-start'
  },
  messageSenderName: {
    marginBottom: 6,
    marginLeft: 8,
    color: '#97A0AD',
    fontSize: 12,
    lineHeight: 16
  },
  attachmentSendStatusLoading: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2
  },
  attachmentSendStatusLoadingIOS: {
    left: -38,
    top: '50%',
    width: 22,
    height: 22,
    transform: [{ translateY: -11 }]
  },
  attachmentSendStatusLoadingAndroid: {
    left: -19,
    bottom: 0,
    width: 16,
    height: 16
  },
  attachmentSendStatusSpinner: {},
  attachmentSendStatusSpinnerIOS: {
    width: 22,
    height: 22
  },
  attachmentSendStatusSpinnerAndroid: {
    width: 16,
    height: 16
  },
  messageBubble: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 20
  },
  messageBubbleFrameless: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    backgroundColor: 'transparent'
  },
  messageBubbleWrap: {
    position: 'relative',
    zIndex: 2,
    elevation: 2
  },
  messageBubbleSurfaceWrap: {
    position: 'relative',
    flexShrink: 1,
    zIndex: 2,
    elevation: 2
  },
  messageBubbleSurfaceWrapMyMessage: {
    alignSelf: 'flex-end'
  },
  messageBubbleSurfaceWrapOtherMessage: {
    alignSelf: 'flex-start'
  },
  messageBubbleWrapSendingText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  messageBubbleWrapSendingAudio: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  messageBubbleWrapMyMessage: {
    alignSelf: 'flex-end'
  },
  messageBubbleWrapOtherMessage: {
    alignSelf: 'flex-start'
  },
  messageBubbleWrapPinned: {
    paddingBottom: 30
  },
  selectBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#C5CFDC',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    marginBottom: 8
  },
  selectBoxSelectionMode: {
    position: 'absolute',
    left: 0,
    top: 2,
    marginHorizontal: 0,
    zIndex: 5
  },
  selectBoxActive: {
    backgroundColor: '#337EFF',
    borderColor: '#337EFF'
  },
  selectBoxDisabled: {
    opacity: 0
  },
  selectBoxText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    transform: [{ translateY: -1 }]
  },
  replyPreview: {
    borderLeftWidth: 3,
    paddingLeft: 8,
    marginBottom: 8
  },
  replyPreviewMy: {
    borderLeftColor: 'rgba(255, 255, 255, 0.72)'
  },
  replyPreviewOther: {
    borderLeftColor: '#D9E1EC'
  },
  replyPreviewTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2
  },
  replyPreviewText: {
    fontSize: 12,
    opacity: 0.78
  },
  myMessage: {
    backgroundColor: '#CBE7FF',
    borderTopRightRadius: 8
  },
  otherMessage: {
    backgroundColor: '#F2F5F8',
    borderTopLeftRadius: 8
  },
  messageBubblePinned: {
    borderWidth: 0
  },
  highlightedMessageBubble: {
    borderWidth: 1,
    borderColor: '#F4C430'
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24
  },
  messageRichText: {
    maxWidth: '100%'
  },
  myMessageText: {
    color: '#203040'
  },
  otherMessageText: {
    color: '#263242'
  },
  imageMessage: {
    width: 184,
    height: 160,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E5E8',
    backgroundColor: '#D1D5DB',
    overflow: 'hidden'
  },
  imageMessagePortrait: {
    width: 144,
    height: 196
  },
  imageMessagePreview: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#D1D5DB'
  },
  mediaProgressOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.53)'
  },
  mediaProgressCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2
  },
  videoCard: {
    width: 190,
    height: 160,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E5E8',
    backgroundColor: 'rgba(17, 24, 39, 0.16)',
    overflow: 'hidden',
    justifyContent: 'flex-end'
  },
  videoCardPortrait: {
    width: 152,
    height: 204
  },
  videoPreviewImage: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#111827'
  },
  videoPreviewFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#374151'
  },
  videoPlayBadge: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -30,
    marginTop: -30,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center'
  },
  videoPlayCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  videoPlayTriangle: {
    width: 0,
    height: 0,
    marginLeft: 4,
    borderTopWidth: 11,
    borderBottomWidth: 11,
    borderLeftWidth: 18,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#FFFFFF'
  },
  videoDurationBadge: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 4,
    paddingVertical: 1
  },
  videoDurationText: {
    color: '#FFFFFF',
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '500'
  },
  audioCard: {
    minHeight: 46,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 6
  },
  audioCardMyMessage: {
    backgroundColor: '#CBE7FF',
    borderTopRightRadius: 8,
    justifyContent: 'flex-end'
  },
  audioCardOtherMessage: {
    backgroundColor: '#F2F5F8',
    borderTopLeftRadius: 8
  },
  audioCardRight: {
    alignSelf: 'flex-end'
  },
  audioIconWrap: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center'
  },
  audioDuration: {
    color: '#333333',
    fontSize: 14,
    lineHeight: 28
  },
  audioSendingIndicator: {
    width: 20,
    height: 20
  },
  textSendingIndicator: {
    width: 20,
    height: 20
  },
  fileCard: {
    minWidth: 180,
    maxWidth: 260,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E5E8',
    backgroundColor: 'rgba(255, 255, 255, 0.32)',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  fileIconWrap: {
    width: 32,
    height: 32
  },
  fileIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center'
  },
  fileProgressOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.53)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  attachmentSendingIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.3)'
  },
  fileSendingIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10
  },
  mediaSendingIndicator: {
    width: 42,
    height: 42,
    borderRadius: 21
  },
  attachmentSendingCover: {
    position: 'absolute',
    top: 0,
    width: '50%',
    height: '100%',
    backgroundColor: '#FFFFFF'
  },
  attachmentSendingRightCover: {
    right: 0,
    transformOrigin: 'left center'
  },
  attachmentSendingLeftCover: {
    left: 0,
    transformOrigin: 'right center'
  },
  fileSendingRightCover: {
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10
  },
  fileSendingLeftCover: {
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10
  },
  mediaSendingRightCover: {
    borderTopRightRadius: 21,
    borderBottomRightRadius: 21
  },
  mediaSendingLeftCover: {
    borderTopLeftRadius: 21,
    borderBottomLeftRadius: 21
  },
  attachmentSendingCenterMask: {
    position: 'absolute',
    alignSelf: 'center'
  },
  fileSendingCenterMask: {
    width: 16,
    height: 16,
    borderRadius: 8
  },
  mediaSendingCenterMask: {
    width: 34,
    height: 34,
    borderRadius: 17
  },
  attachmentSendingPauseIcon: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  fileSendingPauseIcon: {
    width: 6,
    height: 9
  },
  mediaSendingPauseIcon: {
    width: 13,
    height: 18
  },
  attachmentSendingPauseBar: {
    borderRadius: 1,
    backgroundColor: '#FFFFFF'
  },
  fileSendingPauseBar: {
    width: 2,
    height: 9
  },
  mediaSendingPauseBar: {
    width: 3,
    height: 18
  },
  fileMeta: {
    flex: 1,
    minWidth: 0
  },
  fileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    minWidth: 0,
    alignSelf: 'flex-start',
    maxWidth: '100%'
  },
  fileNameBase: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    minWidth: 0
  },
  fileNamePrefix: {
    flexShrink: 1,
    minWidth: 0
  },
  fileNameSuffix: {
    flexShrink: 0
  },
  fileNameTail: {
    flexShrink: 0
  },
  callMessageCard: {
    minHeight: 52,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  callMessageCardMy: {
    backgroundColor: '#CBE7FF',
    borderTopRightRadius: 8
  },
  callMessageCardOther: {
    backgroundColor: '#F2F5F8',
    borderTopLeftRadius: 8
  },
  callMessageStatus: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
    flexShrink: 1
  },
  callMessageDuration: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.72,
    flexShrink: 0
  },
  locationCard: {
    width: 242,
    height: 140,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E5E8',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden'
  },
  locationTextWrap: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
    gap: 4
  },
  locationTitle: {
    color: '#333333',
    fontSize: 16,
    lineHeight: 20
  },
  locationSubtitle: {
    color: '#999999',
    fontSize: 12,
    lineHeight: 16
  },
  locationMapWrap: {
    flex: 1,
    backgroundColor: '#EDF1F6',
    alignItems: 'center',
    justifyContent: 'center'
  },
  locationMapImage: {
    ...StyleSheet.absoluteFillObject
  },
  locationMapPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#EDF1F6'
  },
  locationMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#337EFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  locationMarkerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF'
  },
  attachmentMeta: {
    marginTop: 6,
    fontSize: 12,
    opacity: 0.74
  },
  mergedForwardCard: {
    minWidth: 200,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E5E8',
    backgroundColor: '#FFFFFF',
    padding: 12
  },
  mergedForwardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    maxWidth: '100%'
  },
  mergedForwardTitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333333',
    fontWeight: '500'
  },
  mergedForwardTitlePrefix: {
    flexShrink: 1,
    minWidth: 0
  },
  mergedForwardTitleSuffix: {
    flexShrink: 0
  },
  mergedForwardContent: {
    marginBottom: 8
  },
  mergedForwardMeasureLayer: {
    position: 'absolute',
    opacity: 0,
    left: 0,
    right: 0,
    top: 0
  },
  mergedForwardLineRow: {
    alignItems: 'flex-start',
    minWidth: 0
  },
  mergedForwardLineTextWrap: {
    width: '100%',
    minWidth: 0,
    position: 'relative'
  },
  mergedForwardLineText: {
    fontSize: 12,
    lineHeight: 19,
    color: '#666666',
    minWidth: 0,
    width: '100%'
  },
  mergedForwardLineEmoji: {
    width: MERGED_FORWARD_SUMMARY_EMOJI_SIZE,
    height: MERGED_FORWARD_SUMMARY_EMOJI_SIZE
  },
  mergedForwardLineSenderMeasure: {
    position: 'absolute',
    left: 0,
    top: 0,
    maxWidth: '50%',
    width: '50%',
    opacity: 0
  },
  mergedForwardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 8,
    minHeight: 24,
    justifyContent: 'center'
  },
  mergedForwardFooterText: {
    fontSize: 12,
    lineHeight: 16,
    color: '#999999'
  },
  messageBubbleAvatar: {
    width: 42,
    height: 42,
    position: 'relative',
    zIndex: 2,
    elevation: 2
  },
  messageBubbleAvatarLeft: {
    marginRight: 14
  },
  messageBubbleAvatarRight: {
    marginLeft: 14
  },
  receiptIndicator: {
    marginRight: 8,
    marginBottom: 6,
    width: 24,
    minWidth: 24,
    maxWidth: 24,
    height: 22,
    flexShrink: 0,
    flexGrow: 0,
    zIndex: 3,
    elevation: 3
  },
  pinBadge: {
    position: 'absolute',
    bottom: 10,
    width: 300,
    flexDirection: 'row',
    alignItems: 'flex-start',
    columnGap: 8
  },
  pinBadgeMyMessage: {
    right: 0,
    justifyContent: 'flex-end'
  },
  pinBadgeOtherMessage: {
    left: 0
  },
  pinBadgeTextWrap: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'nowrap'
  },
  pinBadgeTextWrapMyMessage: {
    flex: 0,
    maxWidth: 276
  },
  pinBadgeName: {
    maxWidth: 120,
    fontSize: 11,
    lineHeight: 16,
    color: '#3EAF96',
    flexShrink: 1
  },
  pinBadgeText: {
    fontSize: 11,
    lineHeight: 16,
    color: '#3EAF96'
  },
  retryButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FF4D4F',
    position: 'absolute',
    left: -28,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 6,
    elevation: 6
  },
  retryButtonForMyMessage: {
    left: -30
  },
  retryButtonMuted: {
    backgroundColor: '#9CA3AF'
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 16
  },
  retryButtonTextMuted: {
    color: '#F9FAFB'
  },
  actionMask: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.32)',
    justifyContent: 'center',
    paddingHorizontal: 24
  },
  actionSheet: {
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 14
  },
  actionPreviewBubble: {
    maxWidth: '82%',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 18
  },
  actionPreviewBubbleOut: {
    alignSelf: 'flex-end',
    backgroundColor: '#CBE7FF'
  },
  actionPreviewBubbleIn: {
    alignSelf: 'flex-start',
    backgroundColor: '#F2F5F8'
  },
  actionPreviewText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#2A3545'
  },
  panel: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 12,
    backgroundColor: '#EFF2F6',
    rowGap: 14
  },
  panelButton: {
    width: '33.33%',
    minHeight: 90,
    alignItems: 'center',
    justifyContent: 'center'
  },
  panelButtonIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8
  },
  panelButtonIconActive: {
    backgroundColor: '#D8EBFF'
  },
  panelButtonText: {
    color: '#768092',
    fontSize: 12
  },
  panelButtonTextActive: {
    color: '#1677FF',
    fontWeight: '700'
  },
  panelToggleText: {
    color: '#768092',
    fontSize: 24,
    fontWeight: '700'
  },
  panelToggleTextActive: {
    color: '#1677FF'
  },
  composerContainer: {
    backgroundColor: '#F4F6F9',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 10
  },
  selectionBanner: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: '#FFF8DA'
  },
  selectionBannerText: {
    color: '#6D7E2F',
    fontSize: 13,
    fontWeight: '700'
  },
  selectionActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF'
  },
  replyDraftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  replyDraftContent: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8
  },
  replyDraftTitle: {
    color: '#2A3340',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2
  },
  replyDraftText: {
    color: '#7E8795',
    fontSize: 12
  },
  replyDraftClose: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E8EDF3',
    alignItems: 'center',
    justifyContent: 'center'
  },
  inputContainer: {
    borderRadius: 18,
    backgroundColor: '#FFFFFF'
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10
  },
  toolRow: {
    minHeight: 54,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 0
  },
  input: {
    flex: 1,
    minHeight: 46,
    maxHeight: 104,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1E2837',
    textAlignVertical: 'top',
    backgroundColor: '#FFFFFF'
  },
  sendButton: {
    minWidth: 54,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#337EFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginBottom: 6
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700'
  },
  voiceRecorderButton: {
    minHeight: 54,
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  voiceRecorderText: {
    color: '#337EFF',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700'
  }
})
