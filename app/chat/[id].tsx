import { useHeaderHeight } from '@react-navigation/elements'
import * as Clipboard from 'expo-clipboard'
import * as DocumentPicker from 'expo-document-picker'
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { EMOJI_ICON_MAP_CONFIG } from '@/src/NEUIKit/common/utils/emoji'
import {
  getUIKitAppellation,
  getUIKitConversationIdentity,
  UIKitChatActionGrid,
  UIKitChatHeaderTitle,
  UIKitChatRichText,
  UIKitChatToolbarAction,
  UIKitEmojiPanel,
  UIKitIcon,
  UIKitMessageReadIndicator,
  UIKitUserAvatar
} from '@/src/NEUIKit/rn'
import {
  collectionStore,
  conversationStore,
  imStoreV2Bridge,
  messageStore,
  nimStore
} from '@/stores'
import { persistFileToLocal, resolveFileName } from '@/utils/fileTransfer'
import {
  getForwardPreview,
  getMergedForwardNestedLevel,
  getMessageKey,
  isForwardableMessage,
  isSelectableMessage,
  MAX_BATCH_DELETE,
  MAX_MERGED_FORWARD,
  MAX_SERIAL_FORWARD,
  parseMergedForwardPayload
} from '@/utils/messageForward'
import { ensureNetworkAvailable, NETWORK_UNAVAILABLE_MESSAGE } from '@/utils/network'
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
import { ensureCameraPermission, ensureMediaLibraryPermission } from '@/utils/permissions'

type TimelineItem =
  | { key: string; type: 'time'; label: string }
  | { key: string; type: 'message'; message: V2NIMMessage }

type ReplyDraft = {
  message: V2NIMMessage
  mentionPrefix: string
}

function getReplySourceMessage(conversationId: string, message: V2NIMMessage) {
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

function formatTimeLabel(timestamp: number) {
  const date = new Date(timestamp)
  return date.toLocaleString([], {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function shouldInsertTimeDivider(previousTime: number | null, currentTime: number) {
  if (!previousTime) {
    return true
  }

  return currentTime - previousTime > 5 * 60 * 1000
}

function getMessagePreview(message: V2NIMMessage) {
  if (message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_NOTIFICATION) {
    return '[通知消息]'
  }

  if (message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_TIPS) {
    return message.text || '[提示消息]'
  }

  return getForwardPreview(message)
}

const composerEmojiTokens = Object.keys(EMOJI_ICON_MAP_CONFIG).sort(
  (left, right) => right.length - left.length
)

function deleteTrailingEmojiToken(text: string) {
  const matchedToken = composerEmojiTokens.find((token) => text.endsWith(token))

  if (matchedToken) {
    return text.slice(0, -matchedToken.length)
  }

  return text.slice(0, -1)
}

function isAntispamTipMessage(message: V2NIMMessage) {
  return (
    message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_TIPS &&
    !!message.text?.includes('内容可能')
  )
}

function getReplySourcePreview(message: V2NIMMessage) {
  return getForwardPreview(message)
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

function getAttachmentSource(
  attachment?:
    | V2NIMMessageImageAttachment
    | V2NIMMessageVideoAttachment
    | V2NIMMessageFileAttachment
    | V2NIMMessageAudioAttachment
    | null
) {
  return attachment?.path || attachment?.url || ''
}

function formatDuration(duration?: number) {
  if (!duration) {
    return '00:00'
  }

  const seconds = duration > 1000 ? Math.round(duration / 1000) : Math.round(duration)
  const minutes = Math.floor(seconds / 60)
  const remains = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(remains).padStart(2, '0')}`
}

function formatFileSize(size?: number) {
  if (!size) {
    return '未知大小'
  }

  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`
  }

  if (size >= 1024) {
    return `${Math.round(size / 1024)} KB`
  }

  return `${size} B`
}

function isUnknownMessage(message: V2NIMMessage) {
  return (
    message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_CUSTOM &&
    !parseMergedForwardPayload(message)
  )
}

function MessageBubble({
  message,
  currentUserId,
  conversationId,
  conversationType,
  targetId,
  onLongPress,
  onPressMessage,
  onPressReplyMessage,
  onRetry,
  downloadingFileIds,
  downloadedFileMap,
  selectionMode,
  selected,
  selectable,
  onToggleSelect
}: {
  message: V2NIMMessage
  currentUserId: string | null
  conversationId: string
  conversationType?: V2NIMConversationType
  targetId?: string
  onLongPress: (message: V2NIMMessage) => void
  onPressMessage: (message: V2NIMMessage) => void
  onPressReplyMessage: (message: V2NIMMessage) => void
  onRetry: (message: V2NIMMessage) => void
  downloadingFileIds: string[]
  downloadedFileMap: Record<string, string>
  selectionMode: boolean
  selected: boolean
  selectable: boolean
  onToggleSelect: (message: V2NIMMessage) => void
}) {
  const isMyMessage = message.senderId === currentUserId
  const attachment = message.attachment
  const revokedText = messageStore.getRevokedText(message)
  const replyToMessage = getReplySourceMessage(conversationId, message)
  const replyPreviewText =
    replyToMessage && !messageStore.getRevokedText(replyToMessage)
      ? getReplySourcePreview(replyToMessage)
      : '该消息已撤回或删除'
  const replySenderName = message.threadReply
    ? getMessageDisplayName(message.threadReply.senderId, conversationType, targetId)
    : ''
  const isFailedMessage =
    isMyMessage &&
    message.sendingState === V2NIMMessageSendingState.V2NIM_MESSAGE_SENDING_STATE_FAILED
  const antispamReason = messageStore.getAntispamReason(message)
  const isAntispamBlocked = !!antispamReason
  const mergedForwardPayload = parseMergedForwardPayload(message)
  const isPinned = messageStore.isMessagePinned(message)
  const showSenderName =
    !isMyMessage &&
    conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM &&
    !!targetId
  const senderName = showSenderName
    ? getMessageDisplayName(message.senderId, conversationType, targetId)
    : ''

  const renderBubbleContent = () => {
    if (mergedForwardPayload) {
      return (
        <View style={styles.mergedForwardCard}>
          <ThemedText
            numberOfLines={1}
            style={[
              styles.mergedForwardTitle,
              isMyMessage ? styles.myMessageText : styles.otherMessageText
            ]}
          >
            {mergedForwardPayload.title}
          </ThemedText>
          {mergedForwardPayload.previewList.slice(0, 3).map((item, index) => (
            <ThemedText
              key={`${getMessageKey(message)}-${index}`}
              numberOfLines={1}
              style={[
                styles.mergedForwardLine,
                isMyMessage ? styles.myMessageText : styles.otherMessageText
              ]}
            >
              {item}
            </ThemedText>
          ))}
          <ThemedText
            style={[
              styles.mergedForwardFooter,
              isMyMessage ? styles.myMessageText : styles.otherMessageText
            ]}
          >
            聊天记录
          </ThemedText>
        </View>
      )
    }

    if (message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_IMAGE) {
      const imageAttachment = attachment as V2NIMMessageImageAttachment | undefined
      const imageSource = getAttachmentSource(imageAttachment)

      if (imageSource) {
        return <Image source={imageSource} style={styles.imageMessage} contentFit="cover" />
      }
    }

    if (message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_VIDEO) {
      const videoAttachment = attachment as V2NIMMessageVideoAttachment | undefined

      return (
        <View style={styles.videoCard}>
          <View style={styles.videoPlayBadge}>
            <ThemedText style={styles.videoPlayBadgeText}>播放</ThemedText>
          </View>
          <ThemedText
            numberOfLines={1}
            style={[
              styles.messageText,
              isMyMessage ? styles.myMessageText : styles.otherMessageText
            ]}
          >
            {videoAttachment?.name || '视频消息'}
          </ThemedText>
          <ThemedText
            style={[
              styles.attachmentMeta,
              isMyMessage ? styles.myMessageText : styles.otherMessageText
            ]}
          >
            时长 {formatDuration(videoAttachment?.duration)}
          </ThemedText>
        </View>
      )
    }

    if (message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_AUDIO) {
      const audioAttachment = attachment as V2NIMMessageAudioAttachment | undefined

      return (
        <View style={styles.audioCard}>
          <ThemedText
            style={[
              styles.messageText,
              isMyMessage ? styles.myMessageText : styles.otherMessageText
            ]}
          >
            语音消息
          </ThemedText>
          <ThemedText
            style={[
              styles.attachmentMeta,
              isMyMessage ? styles.myMessageText : styles.otherMessageText
            ]}
          >
            时长 {formatDuration(audioAttachment?.duration)}
          </ThemedText>
        </View>
      )
    }

    if (message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_FILE) {
      const fileAttachment = attachment as V2NIMMessageFileAttachment | undefined
      const fileMessageKey = getMessageKey(message)
      const isDownloading = downloadingFileIds.includes(fileMessageKey)
      const isDownloaded = !!downloadedFileMap[fileMessageKey]

      return (
        <View style={styles.fileCard}>
          <ThemedText
            numberOfLines={1}
            style={[
              styles.messageText,
              isMyMessage ? styles.myMessageText : styles.otherMessageText
            ]}
          >
            {fileAttachment?.name || '文件消息'}
          </ThemedText>
          <ThemedText
            style={[
              styles.attachmentMeta,
              isMyMessage ? styles.myMessageText : styles.otherMessageText
            ]}
          >
            {isDownloading
              ? '下载中...'
              : isDownloaded
                ? `已下载 · ${formatFileSize(fileAttachment?.size)}`
                : formatFileSize(fileAttachment?.size)}
          </ThemedText>
        </View>
      )
    }

    if (message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_LOCATION) {
      const locationAttachment = attachment as V2NIMMessageLocationAttachment | undefined

      return (
        <View style={styles.locationCard}>
          <ThemedText
            numberOfLines={2}
            style={[
              styles.messageText,
              isMyMessage ? styles.myMessageText : styles.otherMessageText
            ]}
          >
            {locationAttachment?.address || '地理位置'}
          </ThemedText>
          <ThemedText
            style={[
              styles.attachmentMeta,
              isMyMessage ? styles.myMessageText : styles.otherMessageText
            ]}
          >
            点击查看地图详情
          </ThemedText>
        </View>
      )
    }

    return (
      <UIKitChatRichText
        text={getMessagePreview(message)}
        ext={message.serverExtension}
        textStyle={[
          styles.messageText,
          isMyMessage ? styles.myMessageText : styles.otherMessageText
        ]}
        containerStyle={styles.messageRichText}
      />
    )
  }

  if (revokedText) {
    return (
      <View style={styles.systemRow}>
        <View style={styles.systemBubble}>
          <ThemedText style={styles.systemText}>{revokedText}</ThemedText>
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
            <ThemedText style={styles.antispamTipText}>{getMessagePreview(message)}</ThemedText>
            <TouchableOpacity
              style={styles.antispamReportButton}
              onPress={() =>
                router.push({
                  pathname: '/chat/report',
                  params: { reason: getMessagePreview(message) }
                } as never)
              }
            >
              <ThemedText style={styles.antispamReportButtonText}>举报</ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.systemBubble}>
            <ThemedText style={styles.systemText}>{getMessagePreview(message)}</ThemedText>
          </View>
        )}
      </View>
    )
  }

  return (
    <View style={isMyMessage ? styles.myMessageRow : styles.otherMessageRow}>
      {selectionMode ? (
        <TouchableOpacity
          style={[
            styles.selectBox,
            selected && styles.selectBoxActive,
            !selectable && styles.selectBoxDisabled
          ]}
          disabled={!selectable}
          onPress={() => onToggleSelect(message)}
        >
          {selected ? <ThemedText style={styles.selectBoxText}>✓</ThemedText> : null}
        </TouchableOpacity>
      ) : null}
      {!isMyMessage ? (
        <View style={styles.messageBubbleAvatar}>
          <UIKitUserAvatar
            account={message.senderId}
            teamId={
              conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM
                ? targetId
                : undefined
            }
            size={42}
          />
        </View>
      ) : null}
      {isMyMessage ? (
        <MessageReceipt
          message={message}
          conversationId={conversationId}
          conversationType={conversationType}
          targetId={targetId}
        />
      ) : null}
      <View
        style={[
          styles.messageBubbleContainer,
          isPinned && styles.messageBubbleContainerPinned,
          isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer
        ]}
      >
        {showSenderName ? (
          <ThemedText numberOfLines={1} style={styles.messageSenderName}>
            {senderName}
          </ThemedText>
        ) : null}
        <Pressable
          onLongPress={selectionMode ? undefined : () => onLongPress(message)}
          onPress={() => {
            if (selectionMode) {
              onToggleSelect(message)
              return
            }

            onPressMessage(message)
          }}
          style={[
            styles.messageBubble,
            isMyMessage ? styles.myMessage : styles.otherMessage,
            isPinned && styles.messageBubblePinned
          ]}
        >
          {message.threadReply ? (
            <TouchableOpacity
              style={[
                styles.replyPreview,
                isMyMessage ? styles.replyPreviewMy : styles.replyPreviewOther
              ]}
              activeOpacity={replyToMessage ? 0.8 : 1}
              onPress={() => {
                if (replyToMessage) {
                  onPressReplyMessage(replyToMessage)
                }
              }}
            >
              <ThemedText
                numberOfLines={1}
                style={[
                  styles.replyPreviewTitle,
                  isMyMessage ? styles.myMessageText : styles.otherMessageText
                ]}
              >
                {replySenderName}
              </ThemedText>
              <ThemedText
                numberOfLines={1}
                style={[
                  styles.replyPreviewText,
                  isMyMessage ? styles.myMessageText : styles.otherMessageText
                ]}
              >
                {replyPreviewText}
              </ThemedText>
            </TouchableOpacity>
          ) : null}
          {renderBubbleContent()}
        </Pressable>
        {isPinned ? <ThemedText style={styles.pinBadge}>已标记消息</ThemedText> : null}
      </View>
      {isFailedMessage ? (
        <TouchableOpacity
          style={[styles.retryButton, isAntispamBlocked && styles.retryButtonMuted]}
          onPress={isAntispamBlocked ? undefined : () => onRetry(message)}
          disabled={isAntispamBlocked}
        >
          <ThemedText
            style={[styles.retryButtonText, isAntispamBlocked && styles.retryButtonTextMuted]}
          >
            !
          </ThemedText>
        </TouchableOpacity>
      ) : null}
      {isMyMessage ? (
        <View style={styles.messageBubbleAvatar}>
          <UIKitUserAvatar account={message.senderId} size={42} />
        </View>
      ) : null}
    </View>
  )
}

function MessageReceipt({
  message,
  conversationId,
  conversationType,
  targetId
}: {
  message: V2NIMMessage
  conversationId: string
  conversationType?: V2NIMConversationType
  targetId?: string
}) {
  const localOptions = imStoreV2Bridge.rootStore?.localOptions
  const p2pMsgReceiptVisible = localOptions?.p2pMsgReceiptVisible ?? true
  const teamMsgReceiptVisible = localOptions?.teamMsgReceiptVisible ?? true

  if (
    message.sendingState !== V2NIMMessageSendingState.V2NIM_MESSAGE_SENDING_STATE_SUCCEEDED ||
    message.messageConfig?.readReceiptEnabled === false
  ) {
    return null
  }

  if (conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P) {
    if (!p2pMsgReceiptVisible) {
      return null
    }

    return (
      <UIKitMessageReadIndicator
        progress={messageStore.isPeerRead(message) ? 1 : 0}
        style={styles.receiptIndicator}
      />
    )
  }

  if (conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM) {
    if (!teamMsgReceiptVisible) {
      return null
    }

    const receipt = messageStore.getTeamReadReceipt(message)
    const readCount = receipt?.readCount || 0
    const unreadCount = receipt?.unreadCount || 0
    const totalCount = readCount + unreadCount
    const progress = totalCount > 0 ? readCount / totalCount : 0
    const canOpenDetail =
      !!targetId && !!(message.messageClientId || message.messageServerId) && progress < 1

    return (
      <UIKitMessageReadIndicator
        progress={progress}
        style={styles.receiptIndicator}
        onPress={
          canOpenDetail
            ? () =>
                router.push({
                  pathname: '/chat/read-detail',
                  params: {
                    conversationId,
                    messageId: message.messageClientId || message.messageServerId,
                    teamId: targetId
                  }
                } as never)
            : undefined
        }
      />
    )
  }

  return null
}

type MessageActionKey =
  | 'copy'
  | 'delete'
  | 'revoke'
  | 'reply'
  | 'resend'
  | 'forward'
  | 'pin'
  | 'collect'
type BatchForwardMode = 'serial' | 'merged'

function getMessageActionItems(message: V2NIMMessage, currentUserId: string | null) {
  const isSelf = message.senderId === currentUserId
  const isTextMessage = message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_TEXT
  const isAntispamBlocked = messageStore.isAntispamBlocked(message)
  const limitedActionMessage =
    message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_CALL ||
    isUnknownMessage(message) ||
    isAntispamBlocked
  const canCopy = isTextMessage
  const canRevoke =
    !limitedActionMessage &&
    isSelf &&
    message.sendingState === V2NIMMessageSendingState.V2NIM_MESSAGE_SENDING_STATE_SUCCEEDED
  const canReply =
    !limitedActionMessage &&
    message.messageType !== V2NIMMessageType.V2NIM_MESSAGE_TYPE_NOTIFICATION &&
    message.messageType !== V2NIMMessageType.V2NIM_MESSAGE_TYPE_TIPS &&
    !messageStore.getRevokedText(message)
  const canForward =
    !limitedActionMessage && isForwardableMessage(message, messageStore.getRevokedText(message))
  const canPin = canForward
  const canCollect = canForward
  const canResend =
    !isAntispamBlocked &&
    !limitedActionMessage &&
    isSelf &&
    message.sendingState === V2NIMMessageSendingState.V2NIM_MESSAGE_SENDING_STATE_FAILED

  return [
    canCopy ? { key: 'copy' as const, label: '复制', icon: 'icon-fuzhi1' as const } : null,
    canReply ? { key: 'reply' as const, label: '回复', icon: 'icon-huifu' as const } : null,
    canForward ? { key: 'forward' as const, label: '转发', icon: 'icon-zhuanfa' as const } : null,
    canCollect
      ? {
          key: 'collect' as const,
          label: collectionStore.isCollected(message) ? '取消收藏' : '收藏',
          icon: 'icon-collection' as const
        }
      : null,
    canPin
      ? {
          key: 'pin' as const,
          label: messageStore.isMessagePinned(message) ? '取消标记' : '标记',
          icon: messageStore.isMessagePinned(message)
            ? ('icon-quxiaozhiding' as const)
            : ('icon-xiaoxizhiding' as const)
        }
      : null,
    { key: 'multi' as const, label: '多选' },
    canResend ? { key: 'resend' as const, label: '重发' } : null,
    { key: 'delete' as const, label: '删除', destructive: true, icon: 'icon-shanchu' as const },
    canRevoke ? { key: 'revoke' as const, label: '撤回', icon: 'icon-chehui' as const } : null
  ].filter(Boolean) as {
    key: MessageActionKey | 'multi'
    label: string
    icon?: React.ComponentProps<typeof UIKitChatActionGrid>['items'][number]['icon']
    destructive?: boolean
  }[]
}

const ChatScreen = observer(() => {
  const [inputText, setInputText] = useState('')
  const [composerMode, setComposerMode] = useState<'text' | 'voice'>('text')
  const [panelVisible, setPanelVisible] = useState(false)
  const [emojiPanelVisible, setEmojiPanelVisible] = useState(false)
  const [actionMessage, setActionMessage] = useState<V2NIMMessage | null>(null)
  const [replyDraft, setReplyDraft] = useState<ReplyDraft | null>(null)
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([])
  const [downloadedVideoMap, setDownloadedVideoMap] = useState<Record<string, string>>({})
  const [downloadingVideoIds, setDownloadingVideoIds] = useState<string[]>([])
  const [downloadedFileMap, setDownloadedFileMap] = useState<Record<string, string>>({})
  const [downloadingFileIds, setDownloadingFileIds] = useState<string[]>([])
  const [isNearBottom, setIsNearBottom] = useState(true)
  const [showNewMessageNotice, setShowNewMessageNotice] = useState(false)
  const messageScrollRef = useRef<ScrollView>(null)
  const inputRef = useRef<TextInput>(null)
  const hasUserScrolledRef = useRef(false)
  const lastMessageCountRef = useRef(0)
  const hasInitialBottomAlignedRef = useRef(false)
  const pendingInitialBottomRef = useRef(false)
  const initialBottomRetryTimersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const headerHeight = useHeaderHeight()
  const insets = useSafeAreaInsets()

  const { id } = useLocalSearchParams()
  const conversationId = typeof id === 'string' ? id : ''
  const conversation = conversationStore.getConversation(conversationId)
  const currentUserId = nimStore.getLoginUser()
  const messageState = messageStore.getConversationMessages(conversationId)

  useEffect(() => {
    initialBottomRetryTimersRef.current.forEach((timer) => clearTimeout(timer))
    initialBottomRetryTimersRef.current = []
    hasUserScrolledRef.current = false
    lastMessageCountRef.current = 0
    hasInitialBottomAlignedRef.current = false
    pendingInitialBottomRef.current = false
    setIsNearBottom(true)
    setShowNewMessageNotice(false)
    setPanelVisible(false)
    setEmojiPanelVisible(false)
    setReplyDraft(null)
  }, [conversationId])

  const scrollToBottom = useCallback((animated = true) => {
    messageScrollRef.current?.scrollToEnd({ animated })
    setIsNearBottom(true)
    setShowNewMessageNotice(false)
  }, [])

  const clearInitialBottomRetries = useCallback(() => {
    initialBottomRetryTimersRef.current.forEach((timer) => clearTimeout(timer))
    initialBottomRetryTimersRef.current = []
  }, [])

  const finishInitialBottomAlignment = useCallback(() => {
    pendingInitialBottomRef.current = false
    hasInitialBottomAlignedRef.current = true
    lastMessageCountRef.current = messageState.list.length
  }, [messageState.list.length])

  const scheduleInitialBottomAlignment = useCallback(() => {
    if (hasUserScrolledRef.current || messageState.list.length === 0) {
      return
    }

    pendingInitialBottomRef.current = true
    clearInitialBottomRetries()

    const retryDelays = [0, 100, 250, 500, 800]

    retryDelays.forEach((delay, index) => {
      const timer = setTimeout(() => {
        if (!pendingInitialBottomRef.current || hasUserScrolledRef.current) {
          return
        }

        requestAnimationFrame(() => {
          if (!pendingInitialBottomRef.current || hasUserScrolledRef.current) {
            return
          }

          scrollToBottom(false)

          if (index === retryDelays.length - 1) {
            finishInitialBottomAlignment()
          }
        })
      }, delay)

      initialBottomRetryTimersRef.current.push(timer)
    })
  }, [
    clearInitialBottomRetries,
    finishInitialBottomAlignment,
    messageState.list.length,
    scrollToBottom
  ])

  const flushPendingInitialBottom = useCallback(() => {
    if (
      !pendingInitialBottomRef.current ||
      hasUserScrolledRef.current ||
      messageState.list.length === 0
    ) {
      return
    }

    requestAnimationFrame(() => {
      if (!pendingInitialBottomRef.current || hasUserScrolledRef.current) {
        return
      }

      scrollToBottom(false)
    })
  }, [messageState.list.length, scrollToBottom])

  useEffect(() => {
    if (!currentUserId || messageState.isSync || !conversationId) {
      return
    }

    messageStore.loadHistory(conversationId).catch(() => undefined)
  }, [conversationId, currentUserId, messageState.isSync])

  useEffect(() => {
    if (conversationId) {
      conversationStore.clearUnread(conversationId).catch(() => undefined)
    }
  }, [conversationId])

  useEffect(() => {
    messageStore.setActiveConversation(conversationId || null)

    return () => {
      messageStore.setActiveConversation(null)
    }
  }, [conversationId])

  useEffect(() => {
    if (!conversationId || messageState.list.length === 0) {
      return
    }

    messageStore.sendChatReadReceipts(conversationId).catch(() => undefined)
    messageStore.refreshReadState(conversationId).catch(() => undefined)
  }, [conversationId, messageState.list.length])

  const timeline = useMemo<TimelineItem[]>(() => {
    let previousTime: number | null = null
    const nextItems: TimelineItem[] = []

    messageState.list.forEach((message) => {
      const currentTime = message.createTime || Date.now()

      if (shouldInsertTimeDivider(previousTime, currentTime)) {
        nextItems.push({
          key: `time-${message.messageClientId}-${currentTime}`,
          type: 'time',
          label: formatTimeLabel(currentTime)
        })
      }

      nextItems.push({
        key: message.messageClientId || message.messageServerId,
        type: 'message',
        message
      })

      previousTime = currentTime
    })

    return nextItems
  }, [messageState.list])

  useEffect(() => {
    if (
      !conversationId ||
      timeline.length === 0 ||
      hasInitialBottomAlignedRef.current ||
      hasUserScrolledRef.current
    ) {
      return
    }

    scheduleInitialBottomAlignment()

    const timer = setTimeout(() => {
      if (
        hasInitialBottomAlignedRef.current ||
        hasUserScrolledRef.current ||
        timeline.length === 0
      ) {
        return
      }

      scrollToBottom(false)
    }, 100)

    initialBottomRetryTimersRef.current.push(timer)

    return () => {
      clearTimeout(timer)
      initialBottomRetryTimersRef.current = initialBottomRetryTimersRef.current.filter(
        (currentTimer) => currentTimer !== timer
      )
    }
  }, [conversationId, scheduleInitialBottomAlignment, scrollToBottom, timeline.length])

  useEffect(() => {
    const currentCount = messageState.list.length
    const previousCount = lastMessageCountRef.current

    if (currentCount === previousCount) {
      return
    }

    if (currentCount < previousCount) {
      lastMessageCountRef.current = currentCount
      return
    }

    if (previousCount === 0 && !hasInitialBottomAlignedRef.current) {
      lastMessageCountRef.current = currentCount
      return
    }

    const latestMessage = messageState.list[currentCount - 1]
    const isOwnLatestMessage = latestMessage?.senderId === currentUserId
    const shouldAutoScroll =
      currentCount > 0 &&
      (previousCount === 0 || !hasUserScrolledRef.current || isNearBottom || isOwnLatestMessage)

    if (shouldAutoScroll) {
      setShowNewMessageNotice(false)
      setTimeout(() => {
        scrollToBottom(previousCount !== 0)
      }, 0)
    } else if (!isOwnLatestMessage) {
      setShowNewMessageNotice(true)
    }

    lastMessageCountRef.current = currentCount
  }, [
    currentUserId,
    isNearBottom,
    messageState.list,
    scheduleInitialBottomAlignment,
    scrollToBottom
  ])

  useEffect(() => {
    if (!selectionMode) {
      return
    }

    const availableIds = new Set(
      messageState.list
        .filter((message) => isSelectableMessage(message, messageStore.getRevokedText(message)))
        .map((message) => getMessageKey(message))
    )

    setSelectedMessageIds((current) => current.filter((item) => availableIds.has(item)))
  }, [messageState.list, selectionMode])

  const handleSendMessage = async () => {
    if (!inputText.trim()) {
      return
    }

    try {
      if (replyDraft) {
        await messageStore.replyTextMessage(conversationId, inputText.trim(), replyDraft.message)
        setReplyDraft(null)
      } else {
        await messageStore.sendMessage(conversationId, inputText.trim())
      }
      setInputText('')
      setPanelVisible(false)
      setEmojiPanelVisible(false)
    } catch (error) {
      Alert.alert('发送失败', error instanceof Error ? error.message : '消息发送失败')
    }
  }

  const handlePickImage = async () => {
    if (!(await ensureMediaLibraryPermission())) {
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 9,
      quality: 1
    })

    if (result.canceled || !result.assets?.length) {
      return
    }

    try {
      for (const asset of result.assets) {
        if (!asset.uri) {
          continue
        }

        await messageStore.sendImageMessage(
          conversationId,
          asset.uri,
          asset.fileName || 'image.jpg'
        )
      }
      setPanelVisible(false)
    } catch (error) {
      Alert.alert('发送失败', error instanceof Error ? error.message : '图片发送失败')
    }
  }

  const handleTakePhoto = async () => {
    if (!(await ensureCameraPermission())) {
      return
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 1
    })

    if (result.canceled || !result.assets?.[0]?.uri) {
      return
    }

    try {
      await messageStore.sendImageMessage(
        conversationId,
        result.assets[0].uri,
        result.assets[0].fileName || 'camera.jpg'
      )
      setPanelVisible(false)
    } catch (error) {
      Alert.alert('发送失败', error instanceof Error ? error.message : '消息发送失败')
    }
  }

  const handlePickVideo = async () => {
    if (!(await ensureMediaLibraryPermission())) {
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsMultipleSelection: false,
      quality: 1
    })

    if (result.canceled || !result.assets?.[0]?.uri) {
      return
    }

    try {
      await messageStore.sendVideoMessage(conversationId, result.assets[0].uri, {
        name: result.assets[0].fileName || 'video.mp4',
        duration: result.assets[0].duration ? Math.round(result.assets[0].duration / 1000) : 0,
        width: result.assets[0].width,
        height: result.assets[0].height
      })
      setPanelVisible(false)
    } catch (error) {
      Alert.alert('发送失败', error instanceof Error ? error.message : '视频发送失败')
    }
  }

  const handleRecordVideo = async () => {
    if (!(await ensureCameraPermission())) {
      return
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['videos'],
      quality: 1,
      videoMaxDuration: 60
    })

    if (result.canceled || !result.assets?.[0]?.uri) {
      return
    }

    try {
      await messageStore.sendVideoMessage(conversationId, result.assets[0].uri, {
        name: result.assets[0].fileName || 'camera-video.mp4',
        duration: result.assets[0].duration ? Math.round(result.assets[0].duration / 1000) : 0,
        width: result.assets[0].width,
        height: result.assets[0].height
      })
      setPanelVisible(false)
    } catch (error) {
      Alert.alert('发送失败', error instanceof Error ? error.message : '视频发送失败')
    }
  }

  const handlePickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: false
    })

    if (result.canceled || !result.assets?.[0]?.uri) {
      return
    }

    try {
      await messageStore.sendFileMessage(
        conversationId,
        result.assets[0].uri,
        result.assets[0].name || 'file'
      )
      setPanelVisible(false)
    } catch (error) {
      Alert.alert('发送失败', error instanceof Error ? error.message : '文件发送失败')
    }
  }

  const handlePickLocation = () => {
    setPanelVisible(false)
    setEmojiPanelVisible(false)
    Alert.alert('暂未支持', '当前 Expo Demo 暂未接入位置发送')
  }

  const handleOpenEmoji = () => {
    setComposerMode('text')
    setPanelVisible(false)
    setEmojiPanelVisible((current) => {
      const nextVisible = !current

      if (nextVisible) {
        Keyboard.dismiss()
      } else {
        requestAnimationFrame(() => {
          inputRef.current?.focus()
        })
      }

      return nextVisible
    })
  }

  const handleEmojiPress = (emoji: { key: string; type: string }) => {
    setComposerMode('text')
    setPanelVisible(false)
    setInputText((current) => `${current}${emoji.key}`)
  }

  const handleEmojiDelete = () => {
    setInputText((current) => {
      if (!current) {
        return current
      }

      return deleteTrailingEmojiToken(current)
    })
  }

  const handleMessageListScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent
    const distanceToBottom = contentSize.height - (contentOffset.y + layoutMeasurement.height)
    const nextIsNearBottom = distanceToBottom < 72

    setIsNearBottom(nextIsNearBottom)

    if (nextIsNearBottom) {
      setShowNewMessageNotice(false)
    }
  }

  const conversationType =
    nimStore.nim?.V2NIMConversationIdUtil.parseConversationType(conversationId)
  const targetId = nimStore.nim?.V2NIMConversationIdUtil.parseConversationTargetId(conversationId)
  const conversationIdentity = getUIKitConversationIdentity({
    conversationId,
    type: conversationType,
    name: conversation?.name,
    avatar: conversation?.avatar
  })
  const title = conversationIdentity.title || '聊天详情'
  const actionItems = actionMessage ? getMessageActionItems(actionMessage, currentUserId) : []
  const replyPreviewText = replyDraft ? getReplySourcePreview(replyDraft.message) : ''
  const replySenderName = replyDraft
    ? getMessageDisplayName(replyDraft.message.senderId, conversationType, targetId)
    : ''

  const openMessage = async (message: V2NIMMessage) => {
    const messageKey = getMessageKey(message)
    const mergedForwardPayload = parseMergedForwardPayload(message)

    if (mergedForwardPayload) {
      router.push({
        pathname: '/chat/merged-forward-detail',
        params: {
          conversationId,
          messageId: messageKey
        }
      } as never)
      return
    }

    if (message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_IMAGE) {
      router.push({
        pathname: '/chat/media-viewer',
        params: {
          conversationId,
          messageId: messageKey
        }
      } as never)
      return
    }

    if (message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_VIDEO) {
      const videoAttachment = message.attachment as V2NIMMessageVideoAttachment | undefined
      const source = getAttachmentSource(videoAttachment)

      if (!source) {
        Alert.alert('打开失败', '当前视频不存在或尚未可用')
        return
      }

      const downloadedUri = downloadedVideoMap[messageKey]
      const isLocalSource = source.startsWith('file://') || source.startsWith('content://')

      if (!isLocalSource && !downloadedUri) {
        if (downloadingVideoIds.includes(messageKey)) {
          Alert.alert('请稍候', '当前视频正在下载中')
          return
        }

        try {
          setDownloadingVideoIds((current) => [...current, messageKey])
          const localUri = await persistFileToLocal(
            source,
            resolveFileName(source, videoAttachment?.name || 'video.mp4')
          )
          setDownloadedVideoMap((current) => ({
            ...current,
            [messageKey]: localUri
          }))
          Alert.alert('下载完成', '视频已保存到本地，再次点击即可播放')
        } catch (error) {
          Alert.alert('下载失败', error instanceof Error ? error.message : '视频下载失败')
        } finally {
          setDownloadingVideoIds((current) => current.filter((item) => item !== messageKey))
        }
        return
      }

      router.push({
        pathname: '/chat/media-viewer',
        params: {
          conversationId,
          messageId: messageKey,
          uri: downloadedUri || source,
          type: 'video'
        }
      } as never)
      return
    }

    if (message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_LOCATION) {
      router.push({
        pathname: '/chat/location-detail',
        params: {
          conversationId,
          messageId: messageKey
        }
      } as never)
      return
    }

    if (message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_FILE) {
      const fileAttachment = message.attachment as V2NIMMessageFileAttachment | undefined
      const source = getAttachmentSource(fileAttachment)
      const downloadedUri = downloadedFileMap[messageKey]
      const isLocalSource = source.startsWith('file://') || source.startsWith('content://')

      if (!source) {
        Alert.alert('打开失败', '当前文件不存在或尚未可用')
        return
      }

      if (!isLocalSource && !downloadedUri) {
        if (downloadingFileIds.includes(messageKey)) {
          Alert.alert('请稍候', '当前文件正在下载中')
          return
        }

        try {
          setDownloadingFileIds((current) => [...current, messageKey])
          const localUri = await persistFileToLocal(
            source,
            resolveFileName(source, fileAttachment?.name || 'attachment')
          )
          setDownloadedFileMap((current) => ({
            ...current,
            [messageKey]: localUri
          }))
          Alert.alert('下载完成', '文件已保存到本地，再次点击即可打开')
        } catch (error) {
          Alert.alert('下载失败', error instanceof Error ? error.message : '文件下载失败')
        } finally {
          setDownloadingFileIds((current) => current.filter((item) => item !== messageKey))
        }
        return
      }

      router.push({
        pathname: '/chat/file-detail',
        params: {
          conversationId,
          messageId: messageKey,
          uri: downloadedUri || source
        }
      } as never)
      return
    }

    if (message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_AUDIO) {
      const audioAttachment = message.attachment as V2NIMMessageAudioAttachment | undefined
      const source = getAttachmentSource(audioAttachment)

      if (!source) {
        Alert.alert('播放失败', '当前语音不存在或尚未可用')
        return
      }

      const canOpen = await Linking.canOpenURL(source)

      if (!canOpen) {
        Alert.alert('播放失败', '当前设备无法直接播放该语音')
        return
      }

      await Linking.openURL(source)
    }
  }

  const openReplyMessage = async (message: V2NIMMessage) => {
    if (
      message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_TEXT ||
      isUnknownMessage(message)
    ) {
      router.push({
        pathname: '/chat/message-preview',
        params: {
          conversationId,
          messageId: getMessageKey(message)
        }
      } as never)
      return
    }

    await openMessage(message)
  }

  const startReply = (message: V2NIMMessage) => {
    const mentionPrefix =
      conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM &&
      message.senderId !== currentUserId
        ? `@${getMessageDisplayName(message.senderId, conversationType, targetId)} `
        : ''

    setReplyDraft({ message, mentionPrefix })
    setInputText((current) => {
      if (!mentionPrefix || current.startsWith(mentionPrefix)) {
        return current
      }

      return mentionPrefix + current
    })
    setPanelVisible(false)
    setEmojiPanelVisible(false)
    setComposerMode('text')
    setActionMessage(null)
    requestAnimationFrame(() => {
      inputRef.current?.focus()
    })
  }

  const handleResendMessage = async (message: V2NIMMessage) => {
    try {
      await ensureNetworkAvailable()
      const result = await messageStore.resendMessage(message)

      if (!result) {
        Alert.alert('重发失败', '暂不支持重发该消息')
      }
    } catch (error) {
      Alert.alert('重发失败', error instanceof Error ? error.message : NETWORK_UNAVAILABLE_MESSAGE)
    }
  }

  const toggleMessageSelection = (message: V2NIMMessage) => {
    const revokedText = messageStore.getRevokedText(message)

    if (!isSelectableMessage(message, revokedText)) {
      return
    }

    const messageId = getMessageKey(message)
    setSelectedMessageIds((current) =>
      current.includes(messageId)
        ? current.filter((item) => item !== messageId)
        : [...current, messageId]
    )
  }

  const enterSelectionMode = (message?: V2NIMMessage) => {
    setSelectionMode(true)
    setPanelVisible(false)
    setEmojiPanelVisible(false)
    setReplyDraft(null)
    setActionMessage(null)
    Keyboard.dismiss()

    if (message) {
      const revokedText = messageStore.getRevokedText(message)

      setSelectedMessageIds(
        isSelectableMessage(message, revokedText) ? [getMessageKey(message)] : []
      )
      return
    }

    setSelectedMessageIds([])
  }

  const exitSelectionMode = () => {
    setSelectionMode(false)
    setSelectedMessageIds([])
  }

  const selectedMessages = useMemo(
    () =>
      messageState.list.filter((message) => {
        const messageId = getMessageKey(message)
        return selectedMessageIds.includes(messageId)
      }),
    [messageState.list, selectedMessageIds]
  )

  const openBatchForward = async (mode: BatchForwardMode) => {
    const limit = mode === 'serial' ? MAX_SERIAL_FORWARD : MAX_MERGED_FORWARD

    if (selectedMessages.length === 0) {
      return
    }

    if (selectedMessages.length > limit) {
      Alert.alert(
        '操作失败',
        mode === 'serial'
          ? `逐条转发限制${MAX_SERIAL_FORWARD}条消息`
          : `合并转发限制${MAX_MERGED_FORWARD}条消息`
      )
      return
    }

    const invalidMessages = selectedMessages.filter(
      (message) => !isForwardableMessage(message, messageStore.getRevokedText(message))
    )

    if (mode === 'merged') {
      const tooDeepMessages = selectedMessages.filter(
        (message) => getMergedForwardNestedLevel(message) > 2
      )

      if (tooDeepMessages.length > 0) {
        Alert.alert('提示', '存在超出合并限制的消息，无法合并转发，是否去除后发送', [
          { text: '取消', style: 'cancel' },
          {
            text: '确定',
            onPress: () => {
              const blockedIds = new Set(tooDeepMessages.map((item) => getMessageKey(item)))
              setSelectedMessageIds((current) => current.filter((item) => !blockedIds.has(item)))
            }
          }
        ])
        return
      }
    }

    if (invalidMessages.length > 0) {
      Alert.alert('提示', '存在不可转发的消息体')
      const blockedIds = new Set(invalidMessages.map((item) => getMessageKey(item)))
      setSelectedMessageIds((current) => current.filter((item) => !blockedIds.has(item)))
      return
    }

    await ensureNetworkAvailable()
    router.push({
      pathname: '/chat/forward',
      params: {
        conversationId,
        messageIds: selectedMessages.map((item) => getMessageKey(item)).join(','),
        mode,
        sourceTitle: title
      }
    } as never)
  }

  const handleBatchDelete = () => {
    if (selectedMessages.length === 0) {
      return
    }

    if (selectedMessages.length > MAX_BATCH_DELETE) {
      Alert.alert('操作失败', `批量删除限制${MAX_BATCH_DELETE}条消息`)
      return
    }

    Alert.alert('删除消息', '确认删除选中的消息？', [
      { text: '取消', style: 'cancel' },
      {
        text: '确认',
        style: 'destructive',
        onPress: async () => {
          try {
            await ensureNetworkAvailable()

            for (const message of selectedMessages) {
              if (
                message.sendingState === V2NIMMessageSendingState.V2NIM_MESSAGE_SENDING_STATE_FAILED
              ) {
                messageStore.deleteMessage(conversationId, getMessageKey(message))
                continue
              }

              await messageStore.deleteRemoteMessage(message)
            }

            exitSelectionMode()
          } catch (error) {
            Alert.alert(
              '删除失败',
              error instanceof Error ? error.message : NETWORK_UNAVAILABLE_MESSAGE
            )
          }
        }
      }
    ])
  }

  const handleCopyMessage = async () => {
    if (!actionMessage?.text) {
      return
    }

    await Clipboard.setStringAsync(actionMessage.text)
    setActionMessage(null)
    Alert.alert('复制成功')
  }

  const handleDeleteMessage = () => {
    if (!actionMessage) {
      return
    }

    Alert.alert('删除消息', '确认删除该消息？', [
      { text: '取消', style: 'cancel' },
      {
        text: '确认',
        style: 'destructive',
        onPress: async () => {
          try {
            await ensureNetworkAvailable()
            await messageStore.deleteRemoteMessage(actionMessage)
            setActionMessage(null)
          } catch (error) {
            Alert.alert(
              '删除失败',
              error instanceof Error ? error.message : NETWORK_UNAVAILABLE_MESSAGE
            )
          }
        }
      }
    ])
  }

  const handleRevokeMessage = () => {
    if (!actionMessage) {
      return
    }

    if (Date.now() - actionMessage.createTime > 2 * 60 * 1000) {
      Alert.alert('撤回失败', '已超过时间无法撤回')
      return
    }

    Alert.alert('撤回消息', '确认撤回该消息？', [
      { text: '取消', style: 'cancel' },
      {
        text: '确认',
        onPress: async () => {
          try {
            await ensureNetworkAvailable()
            await messageStore.revokeMessage(actionMessage)
            setActionMessage(null)
          } catch (error) {
            Alert.alert(
              '撤回失败',
              error instanceof Error ? error.message : NETWORK_UNAVAILABLE_MESSAGE
            )
          }
        }
      }
    ])
  }

  const handleActionPress = async (key: MessageActionKey | 'multi') => {
    if (key === 'copy') {
      await handleCopyMessage()
      return
    }

    if (key === 'reply' && actionMessage) {
      startReply(actionMessage)
      return
    }

    if (key === 'forward' && actionMessage) {
      const messageKey = actionMessage.messageClientId || actionMessage.messageServerId
      setActionMessage(null)
      router.push({
        pathname: '/chat/forward',
        params: {
          conversationId,
          messageId: messageKey
        }
      } as never)
      return
    }

    if (key === 'multi') {
      enterSelectionMode(actionMessage || undefined)
      return
    }

    if (key === 'pin' && actionMessage) {
      const wasPinned = messageStore.isMessagePinned(actionMessage)

      try {
        await ensureNetworkAvailable()
        await messageStore.toggleMessagePin(actionMessage)
        setActionMessage(null)
        Alert.alert(wasPinned ? '取消标记成功' : '标记成功')
      } catch (error) {
        Alert.alert(
          wasPinned ? '取消标记失败' : '标记失败',
          error instanceof Error ? error.message : NETWORK_UNAVAILABLE_MESSAGE
        )
      }
      return
    }

    if (key === 'collect' && actionMessage) {
      const wasCollected = collectionStore.isCollected(actionMessage)

      try {
        await ensureNetworkAvailable()
        const collected = await collectionStore.toggleMessageCollection(actionMessage)
        setActionMessage(null)
        Alert.alert(collected ? '收藏成功' : '取消收藏成功')
      } catch (error) {
        Alert.alert(
          wasCollected ? '取消收藏失败' : '收藏失败',
          error instanceof Error ? error.message : NETWORK_UNAVAILABLE_MESSAGE
        )
      }
      return
    }

    if (key === 'resend' && actionMessage) {
      await handleResendMessage(actionMessage)
      setActionMessage(null)
      return
    }

    if (key === 'delete') {
      handleDeleteMessage()
      return
    }

    if (key === 'revoke') {
      handleRevokeMessage()
    }
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: () => (
            <UIKitChatHeaderTitle
              title={title}
              subtitle={!selectionMode && inputText.trim() ? '正在输入中...' : undefined}
            />
          ),
          headerTitleAlign: 'center',
          headerBackVisible: true,
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: '#FFFFFF'
          },
          headerRight: () => (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => {
                if (selectionMode) {
                  exitSelectionMode()
                  return
                }

                if (conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM) {
                  router.push({
                    pathname: '/team/settings',
                    params: { teamId: targetId, conversationId }
                  } as never)
                  return
                }

                router.push({
                  pathname: '/session/p2p-settings',
                  params: { conversationId }
                } as never)
              }}
            >
              {selectionMode ? (
                <ThemedText style={styles.headerButtonText}>取消</ThemedText>
              ) : (
                <UIKitIcon type="icon-More" size={28} />
              )}
            </TouchableOpacity>
          )
        }}
      />

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight : 0}
      >
        {selectionMode ? (
          <View style={styles.selectionBanner}>
            <ThemedText style={styles.selectionBannerText}>
              已选择 {selectedMessages.length} 条消息
            </ThemedText>
          </View>
        ) : null}

        <ScrollView
          key={conversationId}
          ref={messageScrollRef}
          contentContainerStyle={styles.messagesList}
          onLayout={flushPendingInitialBottom}
          onContentSizeChange={flushPendingInitialBottom}
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={() => {
            hasUserScrolledRef.current = true
          }}
          onScroll={handleMessageListScroll}
          scrollEventThrottle={16}
        >
          {messageState.hasMore ? (
            <View>
              <TouchableOpacity
                style={styles.historyButton}
                onPress={() => {
                  messageStore.loadMoreHistory(conversationId).catch((error) => {
                    Alert.alert(
                      '加载失败',
                      error instanceof Error ? error.message : '无法加载更早消息'
                    )
                  })
                }}
                disabled={messageState.loadingMore}
              >
                {messageState.loadingMore ? (
                  <ActivityIndicator color="#337EFF" />
                ) : (
                  <ThemedText style={styles.historyButtonText}>加载更早消息</ThemedText>
                )}
              </TouchableOpacity>
            </View>
          ) : null}
          {timeline.length === 0 ? (
            messageState.loading ? (
              <View style={styles.emptyState}>
                <ActivityIndicator color="#337EFF" />
              </View>
            ) : (
              <View style={styles.emptyState}>
                <ThemedText>暂无消息</ThemedText>
              </View>
            )
          ) : (
            timeline.map((item) => {
              if (item.type === 'time') {
                return (
                  <View key={item.key} style={styles.timeDivider}>
                    <ThemedText style={styles.timeDividerText}>{item.label}</ThemedText>
                  </View>
                )
              }

              return (
                <MessageBubble
                  key={item.key}
                  message={item.message}
                  currentUserId={currentUserId}
                  conversationId={conversationId}
                  conversationType={conversationType}
                  targetId={targetId}
                  onLongPress={setActionMessage}
                  onPressMessage={(message) => {
                    openMessage(message).catch((error) => {
                      Alert.alert(
                        '打开失败',
                        error instanceof Error ? error.message : '无法打开该消息'
                      )
                    })
                  }}
                  onPressReplyMessage={(message) => {
                    openReplyMessage(message).catch((error) => {
                      Alert.alert(
                        '打开失败',
                        error instanceof Error ? error.message : '无法打开被回复消息'
                      )
                    })
                  }}
                  onRetry={handleResendMessage}
                  downloadingFileIds={downloadingFileIds}
                  downloadedFileMap={downloadedFileMap}
                  selectionMode={selectionMode}
                  selected={selectedMessageIds.includes(getMessageKey(item.message))}
                  selectable={isSelectableMessage(
                    item.message,
                    messageStore.getRevokedText(item.message)
                  )}
                  onToggleSelect={toggleMessageSelection}
                />
              )
            })
          )}
        </ScrollView>

        {showNewMessageNotice && !selectionMode ? (
          <TouchableOpacity
            style={[
              styles.newMessageNotice,
              (panelVisible || emojiPanelVisible) && styles.newMessageNoticeRaised,
              composerMode === 'voice' && styles.newMessageNoticeVoiceRaised
            ]}
            onPress={() => {
              hasUserScrolledRef.current = true
              scrollToBottom()
            }}
          >
            <ThemedText style={styles.newMessageNoticeText}>有新消息</ThemedText>
          </TouchableOpacity>
        ) : null}

        <Modal
          transparent
          visible={!selectionMode && !!actionMessage}
          animationType="fade"
          onRequestClose={() => setActionMessage(null)}
        >
          <Pressable style={styles.actionMask} onPress={() => setActionMessage(null)}>
            <Pressable style={styles.actionSheet} onPress={() => undefined}>
              {actionMessage ? (
                <View
                  style={[
                    styles.actionPreviewBubble,
                    actionMessage.senderId === currentUserId
                      ? styles.actionPreviewBubbleOut
                      : styles.actionPreviewBubbleIn
                  ]}
                >
                  <ThemedText numberOfLines={2} style={styles.actionPreviewText}>
                    {getMessagePreview(actionMessage)}
                  </ThemedText>
                </View>
              ) : null}
              <UIKitChatActionGrid
                items={actionItems.map((item) => ({
                  key: item.key,
                  label: item.label,
                  icon: item.icon,
                  danger: item.destructive,
                  onPress: () => {
                    handleActionPress(item.key).catch((error) => {
                      Alert.alert(
                        '操作失败',
                        error instanceof Error ? error.message : '当前操作执行失败'
                      )
                    })
                  }
                }))}
              />
              <TouchableOpacity
                style={styles.actionCloseButton}
                onPress={() => setActionMessage(null)}
              >
                <ThemedText style={styles.actionCloseText}>取消</ThemedText>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>

        {panelVisible && !selectionMode ? (
          <View style={styles.panel}>
            <TouchableOpacity style={styles.panelButton} onPress={handleTakePhoto}>
              <View style={styles.panelButtonIcon}>
                <UIKitIcon type="icon-paishe" size={26} />
              </View>
              <ThemedText style={styles.panelButtonText}>拍照</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.panelButton} onPress={handlePickImage}>
              <View style={styles.panelButtonIcon}>
                <UIKitIcon type="icon-tupian" size={24} />
              </View>
              <ThemedText style={styles.panelButtonText}>图片</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.panelButton} onPress={handleRecordVideo}>
              <View style={styles.panelButtonIcon}>
                <UIKitIcon type="icon-shipin" size={24} />
              </View>
              <ThemedText style={styles.panelButtonText}>拍视频</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.panelButton} onPress={handlePickVideo}>
              <View style={styles.panelButtonIcon}>
                <UIKitIcon type="icon-shipin" size={24} />
              </View>
              <ThemedText style={styles.panelButtonText}>视频</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.panelButton} onPress={handlePickFile}>
              <View style={styles.panelButtonIcon}>
                <UIKitIcon type="icon-wenjian" size={24} />
              </View>
              <ThemedText style={styles.panelButtonText}>文件</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.panelButton} onPress={handlePickLocation}>
              <View style={styles.panelButtonIcon}>
                <UIKitIcon type="icon-weizhiwenjian" size={24} />
              </View>
              <ThemedText style={styles.panelButtonText}>位置</ThemedText>
            </TouchableOpacity>
          </View>
        ) : null}

        {emojiPanelVisible && !selectionMode ? (
          <UIKitEmojiPanel
            onEmojiPress={handleEmojiPress}
            onDeletePress={handleEmojiDelete}
            onSendPress={() => {
              handleSendMessage().catch((error) => {
                Alert.alert('发送失败', error instanceof Error ? error.message : '消息发送失败')
              })
            }}
          />
        ) : null}

        {selectionMode ? (
          <View style={styles.selectionActions}>
            <UIKitChatToolbarAction
              label="合并转发"
              icon="icon-zhuanfa"
              onPress={() =>
                openBatchForward('merged').catch((error) => {
                  Alert.alert(
                    '操作失败',
                    error instanceof Error ? error.message : NETWORK_UNAVAILABLE_MESSAGE
                  )
                })
              }
              active={selectedMessages.length > 0}
            />
            <UIKitChatToolbarAction
              label="逐条转发"
              icon="icon-zhuanfa"
              onPress={() =>
                openBatchForward('serial').catch((error) => {
                  Alert.alert(
                    '操作失败',
                    error instanceof Error ? error.message : NETWORK_UNAVAILABLE_MESSAGE
                  )
                })
              }
              active={selectedMessages.length > 0}
            />
            <UIKitChatToolbarAction
              label="删除"
              icon="icon-shanchu"
              onPress={handleBatchDelete}
              active={selectedMessages.length > 0}
            />
          </View>
        ) : (
          <ThemedView
            style={[styles.composerContainer, { paddingBottom: Math.max(insets.bottom, 12) }]}
          >
            {replyDraft ? (
              <View style={styles.replyDraftContainer}>
                <View style={styles.replyDraftContent}>
                  <ThemedText style={styles.replyDraftTitle} numberOfLines={1}>
                    回复 {replySenderName}
                  </ThemedText>
                  <ThemedText style={styles.replyDraftText} numberOfLines={1}>
                    {replyPreviewText}
                  </ThemedText>
                </View>
                <TouchableOpacity
                  style={styles.replyDraftClose}
                  onPress={() => setReplyDraft(null)}
                >
                  <UIKitIcon type="icon-guanbi" size={14} tintColor="#7B8594" />
                </TouchableOpacity>
              </View>
            ) : null}
            {composerMode === 'voice' ? (
              <TouchableOpacity
                style={styles.voiceRecorderButton}
                onPress={() => Alert.alert('暂未支持', '当前 Expo Demo 暂未接入语音录制')}
              >
                <UIKitIcon type="toolbar-voice" size={24} />
                <ThemedText style={styles.voiceRecorderText}>按住说话</ThemedText>
              </TouchableOpacity>
            ) : (
              <View style={styles.inputContainer}>
                <View style={styles.inputRow}>
                  <TextInput
                    ref={inputRef}
                    style={styles.input}
                    value={inputText}
                    onChangeText={setInputText}
                    onFocus={() => {
                      setComposerMode('text')
                      setPanelVisible(false)
                      setEmojiPanelVisible(false)
                    }}
                    placeholder={`发送给 ${title}`}
                    placeholderTextColor="#A0A8B4"
                    multiline
                  />
                  <TouchableOpacity
                    style={styles.sendButton}
                    onPress={() => {
                      handleSendMessage().catch((error) => {
                        Alert.alert(
                          '发送失败',
                          error instanceof Error ? error.message : '消息发送失败'
                        )
                      })
                    }}
                  >
                    <ThemedText style={styles.sendButtonText}>发送</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            <View style={styles.toolRow}>
              <UIKitChatToolbarAction
                label="语音"
                icon="toolbar-voice"
                noTint
                active={composerMode === 'voice'}
                onPress={() => {
                  setComposerMode((current) => {
                    const nextMode = current === 'voice' ? 'text' : 'voice'

                    if (nextMode === 'voice') {
                      Keyboard.dismiss()
                    } else {
                      requestAnimationFrame(() => {
                        inputRef.current?.focus()
                      })
                    }

                    return nextMode
                  })
                  setPanelVisible(false)
                  setEmojiPanelVisible(false)
                }}
              />
              <UIKitChatToolbarAction
                label="表情"
                icon="icon-biaoqing"
                active={emojiPanelVisible}
                onPress={handleOpenEmoji}
              />
              <UIKitChatToolbarAction
                label="图片"
                icon="icon-tupian"
                onPress={() => {
                  handlePickImage().catch((error) => {
                    Alert.alert('发送失败', error instanceof Error ? error.message : '图片发送失败')
                  })
                }}
              />
              <UIKitChatToolbarAction
                label="文件"
                icon="icon-wenjian"
                onPress={() => {
                  handlePickFile().catch((error) => {
                    Alert.alert('发送失败', error instanceof Error ? error.message : '文件发送失败')
                  })
                }}
              />
              <UIKitChatToolbarAction
                label="更多"
                icon="send-more"
                active={panelVisible}
                onPress={() => {
                  setComposerMode('text')
                  setEmojiPanelVisible(false)
                  setPanelVisible((current) => {
                    const nextVisible = !current

                    if (nextVisible) {
                      Keyboard.dismiss()
                    }

                    return nextVisible
                  })
                }}
              />
            </View>
          </ThemedView>
        )}
      </KeyboardAvoidingView>
    </ThemedView>
  )
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
    borderRadius: 999,
    backgroundColor: '#F3F6FA',
    paddingHorizontal: 14,
    paddingVertical: 6
  },
  antispamTipBubble: {
    maxWidth: '92%',
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  antispamTipText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: '#92400E'
  },
  antispamReportButton: {
    minHeight: 30,
    paddingHorizontal: 12,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  antispamReportButtonText: {
    color: '#337EFF',
    fontWeight: '700',
    fontSize: 12
  },
  systemText: {
    fontSize: 12,
    color: '#8A95A5'
  },
  myMessageRow: {
    flexDirection: 'row',
    marginBottom: 18,
    alignItems: 'flex-end',
    justifyContent: 'flex-end'
  },
  otherMessageRow: {
    flexDirection: 'row',
    marginBottom: 18,
    alignItems: 'flex-end',
    justifyContent: 'flex-start'
  },
  messageBubbleContainer: {
    maxWidth: '76%'
  },
  messageBubbleContainerPinned: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFF9D8'
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
  messageBubble: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 20
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
    fontWeight: '700'
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
    borderWidth: 1,
    borderColor: '#F0DE84'
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
    backgroundColor: '#D1D5DB'
  },
  videoCard: {
    width: 190,
    minHeight: 118,
    borderRadius: 16,
    backgroundColor: 'rgba(17, 24, 39, 0.16)',
    padding: 12,
    justifyContent: 'flex-end'
  },
  videoPlayBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.38)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 12
  },
  videoPlayBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
  },
  audioCard: {
    minWidth: 160,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.32)',
    padding: 12
  },
  fileCard: {
    minWidth: 180,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.32)',
    padding: 12
  },
  locationCard: {
    minWidth: 180,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.32)',
    padding: 12
  },
  attachmentMeta: {
    marginTop: 6,
    fontSize: 12,
    opacity: 0.74
  },
  mergedForwardCard: {
    minWidth: 200
  },
  mergedForwardTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6
  },
  mergedForwardLine: {
    fontSize: 13,
    lineHeight: 18
  },
  mergedForwardFooter: {
    marginTop: 8,
    fontSize: 12,
    opacity: 0.72
  },
  messageBubbleAvatar: {
    width: 42,
    height: 42,
    marginHorizontal: 14
  },
  receiptIndicator: {
    marginRight: 8,
    marginBottom: 6,
    alignSelf: 'flex-end'
  },
  pinBadge: {
    marginTop: 6,
    fontSize: 12,
    color: '#52A168',
    fontWeight: '700'
  },
  retryButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FF4D4F',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
    marginBottom: 6
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
  actionCloseButton: {
    minHeight: 44,
    borderRadius: 22,
    marginTop: 20,
    backgroundColor: '#F2F5F9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  actionCloseText: {
    color: '#596272',
    fontWeight: '700'
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
  panelButtonText: {
    color: '#768092',
    fontSize: 12
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

export default ChatScreen
