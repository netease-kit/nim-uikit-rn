import { useFocusEffect } from '@react-navigation/native'
import { router, Stack } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ListRenderItemInfo,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewToken
} from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { useAppTranslation } from '@/hooks/useAppTranslation'
import { useNavigationLock } from '@/hooks/useNavigationLock'
import { toast } from '@/src/NEUIKit/common/utils/toast'
import {
  ensureUIKitUserProfiles,
  getUIKitConversationIdentity,
  getUIKitOnlineStatusText,
  isUIKitAIUser,
  NEUIKitColors,
  UIKitActionSheet,
  UIKitConversationRow,
  UIKitDropdownMenu,
  UIKitEmptyState,
  UIKitIcon,
  UIKitNoticeBanner,
  UIKitSwipeActionRow,
  UIKitUserAvatar,
  UIKitWhitePage,
  useUIKitUserStatusSubscription
} from '@/src/NEUIKit/rn'
import {
  authStore,
  conversationListUIStore,
  conversationStore,
  friendStore,
  imStoreV2Bridge,
  messageStore,
  nimStore,
  teamStore,
  userStore
} from '@/stores'
import { resolveLocationText } from '@/utils/amap'
import { type AppLanguage, type AppTranslationKey, translateApp } from '@/utils/app-language'
import { getCallMessagePreviewText } from '@/utils/callMessage'
import { normalizeDisplayErrorMessage } from '@/utils/error-message'
import { isMergedForwardMessage } from '@/utils/messageForward'
import {
  ensureNetworkAvailable,
  getNetworkUnavailableMessage,
  NETWORK_UNAVAILABLE_MESSAGE
} from '@/utils/network'
import {
  V2NIMConversationType,
  V2NIMMessage,
  V2NIMMessageAttachment,
  V2NIMMessageFileAttachment,
  V2NIMMessageLocationAttachment,
  V2NIMMessageSendingState,
  V2NIMMessageType
} from '@/utils/nim-sdk'

const LAST_MESSAGE_STATE_REVOKE = 1

type ConversationPreviewMessage = {
  messageType?: V2NIMMessageType
  lastMessageState?: number
  text?: string
  subType?: number
  attachment?: V2NIMMessageAttachment
  messageRefer?: { createTime?: number; messageClientId?: string; messageServerId?: string }
}

type ConversationListSourceItem = {
  conversationId: string
  name?: string
  avatar?: string
  type?: V2NIMConversationType
  sortOrder?: number
  lastMessage?: ConversationPreviewMessage & { messageRefer?: { createTime?: number } }
  updateTime?: number
  unreadCount?: number
  mute?: boolean
  stickTop?: boolean
  aitMsgs?: unknown[]
}

type ConversationMutationStore = {
  removeConversation?: (conversationIds: string[]) => void
}

type FormattedConversation = {
  id: string
  title: string
  avatar?: string
  avatarAccount?: string
  statusAccountId?: string
  targetAccountId?: string
  subtitle: string
  timeText: string
  unread: number
  muted: boolean
  stickTop: boolean
}

type MentionAwareConversation = {
  conversationId: string
  unreadCount?: number
  aitMsgs?: unknown[]
}

type PinnedAIUser = {
  accountId: string
  name?: string
  avatar?: string
}

type ConversationListHeaderProps = {
  securityTipText: string
  networkBannerText: string | null
  pinnedAiUsers: PinnedAIUser[]
  onPressAiUser: (accountId: string) => void
}

type ConversationListItemProps = {
  item: FormattedConversation
  interactionMode: 'swipe' | 'longPress'
  isSwipeOpen: boolean
  pinLabel: string
  deleteLabel: string
  onOpen: (conversationId: string) => void
  onClose: (conversationId: string) => void
  onToggleStickTop: (conversationId: string, stickTop: boolean) => void
  onDelete: (conversationId: string) => void
  onPress: (conversationId: string, isSwipeOpen: boolean) => void
  onLongPress: (conversationId: string) => void
}

const DELETE_CONVERSATION_NETWORK_ERROR = getNetworkUnavailableMessage()
const CONVERSATION_ROW_HEIGHT = 74
const CONVERSATION_WINDOW_SIZE = 14
const CONVERSATION_INITIAL_RENDER_COUNT = 14
const CONVERSATION_BATCH_RENDER_COUNT = 16
const CONVERSATION_PREFETCH_REMAINING_COUNT = 18
const CONVERSATION_INITIAL_STATUS_SUBSCRIBE_COUNT = CONVERSATION_INITIAL_RENDER_COUNT
const INITIAL_EMPTY_STATE_DELAY_MS = 600
const CONVERSATION_VIEWABILITY_CONFIG = {
  itemVisiblePercentThreshold: 20
} as const
const CONVERSATION_INTERACTION_MODE = Platform.OS === 'android' ? 'swipe' : 'longPress'

type PreviewTranslator = ReturnType<typeof useAppTranslation>['t']

const PREVIEW_LANGUAGES: readonly AppLanguage[] = ['zh', 'en']
const NORMALIZED_PREVIEW_KEYS = [
  'conversationListNoMessage',
  'commonImageMessage',
  'commonAudioMessage',
  'commonVideoMessage',
  'commonLocationMessage',
  'callMsgText',
  'commonSendFailedShort',
  'commonSensitiveContentBlocked',
  'commonRecallByYou',
  'commonRecallByOther',
  'commonRecalledMessage',
  'messageStoreBlacklistedTip',
  'messageStoreFriendDeletedTip',
  'messageStoreReminderMessage',
  'commonTipMessagePreview',
  'commonMergedChatHistory',
  'commonUnknownMessageBody',
  'conversationNotificationText'
] satisfies AppTranslationKey[]

const NORMALIZED_PREVIEW_TEXT_MAP = new Map<string, AppTranslationKey>(
  PREVIEW_LANGUAGES.flatMap((language) =>
    NORMALIZED_PREVIEW_KEYS.map((key) => [translateApp(language, key).trim(), key] as const)
  )
)

function getTranslatedPreviewVariants(
  key: AppTranslationKey,
  params?: Record<string, string | number>
) {
  return PREVIEW_LANGUAGES.map((language) => translateApp(language, key, params).trim())
}

function matchesTranslatedPreviewText(
  text: string | undefined,
  key: AppTranslationKey,
  params?: Record<string, string | number>
) {
  const trimmedText = text?.trim()

  if (!trimmedText) {
    return false
  }

  return getTranslatedPreviewVariants(key, params).some((item) => item === trimmedText)
}

function areStringArraysEqual(left: string[], right: string[]) {
  return left.length === right.length && left.every((item, index) => item === right[index])
}

function extractTranslatedPreviewSuffix(
  text: string | undefined,
  key: AppTranslationKey,
  params?: Record<string, string | number>
) {
  const trimmedText = text?.trim()

  if (!trimmedText) {
    return null
  }

  for (const prefix of getTranslatedPreviewVariants(key, params)) {
    if (!prefix) {
      continue
    }

    if (trimmedText === prefix) {
      return ''
    }

    if (trimmedText.startsWith(`${prefix} `)) {
      return trimmedText.slice(prefix.length).trim()
    }
  }

  return null
}

function normalizeExactPreviewText(text: string | undefined, translate: PreviewTranslator) {
  const trimmedText = text?.trim()

  if (!trimmedText) {
    return null
  }

  const key = NORMALIZED_PREVIEW_TEXT_MAP.get(trimmedText)

  return key ? translate(key) : null
}

function normalizeLocalizedPreviewText(text: string | undefined, translate: PreviewTranslator) {
  const normalizedErrorText = normalizeDisplayErrorMessage(text || '')

  if (normalizedErrorText && normalizedErrorText !== text?.trim()) {
    return normalizedErrorText
  }

  const normalizedExactText = normalizeExactPreviewText(text, translate)

  if (normalizedExactText) {
    return normalizedExactText
  }

  const locationDescription = extractTranslatedPreviewSuffix(text, 'commonLocationMessage')

  if (locationDescription !== null) {
    return locationDescription
      ? `${translate('commonLocationMessage')} ${locationDescription}`.trim()
      : translate('commonLocationMessage')
  }

  const fileName = extractTranslatedPreviewSuffix(text, 'commonFileMessage', {
    name: ''
  })

  if (fileName !== null) {
    return translate('commonFileMessage', { name: fileName || '' }).trim()
  }

  return null
}

function getLocationPreviewText(message: ConversationPreviewMessage, translate: PreviewTranslator) {
  const attachment = message.attachment as V2NIMMessageLocationAttachment | undefined
  const cachedDescription = extractTranslatedPreviewSuffix(message.text, 'commonLocationMessage')
  const normalizedLocationText =
    cachedDescription !== null ? cachedDescription || undefined : message.text

  if (!attachment?.address && cachedDescription !== null) {
    return cachedDescription
      ? `${translate('commonLocationMessage')} ${cachedDescription}`.trim()
      : translate('commonLocationMessage')
  }

  const locationText = resolveLocationText(normalizedLocationText, attachment?.address)
  const title = locationText.title?.trim() || ''
  const subtitle = locationText.subtitle?.trim() || ''
  const hasMeaningfulTitle =
    !!title &&
    !matchesTranslatedPreviewText(title, 'commonLocationTitle') &&
    !matchesTranslatedPreviewText(title, 'commonLocationMessage')
  const hasMeaningfulSubtitle =
    !!subtitle && !matchesTranslatedPreviewText(subtitle, 'conversationPreviewNoDetailAddress')
  const description =
    hasMeaningfulTitle && hasMeaningfulSubtitle
      ? `${title} ${subtitle}`
      : hasMeaningfulTitle
        ? title
        : hasMeaningfulSubtitle
          ? subtitle
          : ''

  return description
    ? `${translate('commonLocationMessage')} ${description}`.trim()
    : translate('commonLocationMessage')
}

function getFilePreviewText(message: ConversationPreviewMessage, translate: PreviewTranslator) {
  const attachmentName = (
    message.attachment as V2NIMMessageFileAttachment | undefined
  )?.name?.trim()

  if (attachmentName) {
    return translate('commonFileMessage', { name: attachmentName }).trim()
  }

  const cachedFileName = extractTranslatedPreviewSuffix(message.text, 'commonFileMessage', {
    name: ''
  })

  return translate('commonFileMessage', { name: cachedFileName || '' }).trim()
}

function formatConversationTime(timestamp?: number) {
  if (!timestamp) {
    return ''
  }

  const date = new Date(timestamp)
  const now = new Date()
  const year = date.getFullYear()
  const month = padDatePart(date.getMonth() + 1)
  const day = padDatePart(date.getDate())
  const time = `${padDatePart(date.getHours())}:${padDatePart(date.getMinutes())}`
  const isToday =
    year === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()

  if (isToday) {
    return time
  }

  if (year === now.getFullYear()) {
    return `${month}月${day}日 ${time}`
  }

  return `${year}年${month}月${day}日`
}

function padDatePart(value: number) {
  return String(value).padStart(2, '0')
}

function getConversationDisplayTimestamp(conversation: {
  lastMessage?: { messageRefer?: { createTime?: number } }
  updateTime?: number
}) {
  return conversation.lastMessage?.messageRefer?.createTime || conversation.updateTime
}

function isRecalledConversationPreviewMessage(message?: ConversationPreviewMessage | null) {
  if (!message) {
    return false
  }

  if (message.lastMessageState === LAST_MESSAGE_STATE_REVOKE) {
    return true
  }

  const normalizedKey = NORMALIZED_PREVIEW_TEXT_MAP.get(message.text?.trim() || '')

  return normalizedKey === 'commonRecalledMessage' || normalizedKey === 'commonRecallByYou'
}

function getPreviewMessageReferKeys(message?: ConversationPreviewMessage | null) {
  return [message?.messageRefer?.messageClientId, message?.messageRefer?.messageServerId].filter(
    (key): key is string => !!key
  )
}

function normalizeRecalledConversationPreview(
  conversationId: string,
  message: ConversationPreviewMessage | null | undefined,
  translate: PreviewTranslator
) {
  if (!message) {
    return message
  }

  if (isRecalledConversationPreviewMessage(message)) {
    return {
      ...message,
      lastMessageState: LAST_MESSAGE_STATE_REVOKE,
      text: translate('commonRecalledMessage')
    } satisfies ConversationPreviewMessage
  }

  const revokedMap = messageStore.revokedMessageMap[conversationId]
  const isPreviewReferRevoked =
    !!revokedMap && getPreviewMessageReferKeys(message).some((key) => !!revokedMap[key])

  if (isPreviewReferRevoked) {
    return {
      ...message,
      messageType: V2NIMMessageType.V2NIM_MESSAGE_TYPE_TIPS,
      lastMessageState: LAST_MESSAGE_STATE_REVOKE,
      text: translate('commonRecalledMessage')
    } satisfies ConversationPreviewMessage
  }

  const latestLocalMessage = messageStore.getConversationMessages(conversationId).list.at(-1)
  const latestLocalMessageKey = latestLocalMessage ? getMessageKey(latestLocalMessage) : ''
  const latestLocalMessageRevoked = !!revokedMap?.[latestLocalMessageKey]
  const previewTimestamp = message.messageRefer?.createTime || 0
  const latestLocalTimestamp = latestLocalMessage?.createTime || 0

  if (!latestLocalMessageRevoked || latestLocalTimestamp < previewTimestamp) {
    return message
  }

  return {
    ...message,
    messageType: V2NIMMessageType.V2NIM_MESSAGE_TYPE_TIPS,
    lastMessageState: LAST_MESSAGE_STATE_REVOKE,
    text: translate('commonRecalledMessage'),
    messageRefer: {
      ...message.messageRefer,
      createTime: latestLocalTimestamp || message.messageRefer?.createTime
    }
  } satisfies ConversationPreviewMessage
}

function mergeLocalRecalledPreview(
  conversation: ConversationListSourceItem,
  localConversation?: ConversationListSourceItem | null
) {
  const localLastMessage = localConversation?.lastMessage

  if (!isRecalledConversationPreviewMessage(localLastMessage)) {
    return conversation
  }

  const localTimestamp =
    localLastMessage?.messageRefer?.createTime ||
    localConversation?.sortOrder ||
    localConversation?.updateTime ||
    0
  const sourceTimestamp =
    conversation.lastMessage?.messageRefer?.createTime ||
    conversation.sortOrder ||
    conversation.updateTime ||
    0

  if (localTimestamp < sourceTimestamp) {
    return conversation
  }

  return {
    ...conversation,
    sortOrder: Math.max(
      conversation.sortOrder || 0,
      localConversation?.sortOrder || 0,
      localTimestamp
    ),
    updateTime: Math.max(
      conversation.updateTime || 0,
      localConversation?.updateTime || 0,
      localTimestamp
    ),
    lastMessage: {
      ...localLastMessage,
      lastMessageState: LAST_MESSAGE_STATE_REVOKE
    }
  } satisfies ConversationListSourceItem
}

function getFallbackConversationPreviewMessage(
  conversationId: string,
  translate: PreviewTranslator
) {
  const messages = messageStore.getConversationMessages(conversationId).list
  const latestMessage = messages[messages.length - 1]

  if (!latestMessage) {
    return null
  }

  if (latestMessage.sendingState === V2NIMMessageSendingState.V2NIM_MESSAGE_SENDING_STATE_FAILED) {
    return {
      messageType: V2NIMMessageType.V2NIM_MESSAGE_TYPE_TIPS,
      text: latestMessage.text || translate('commonSendFailedShort'),
      messageRefer: {
        createTime: latestMessage.createTime
      }
    } satisfies ConversationPreviewMessage
  }

  const latestMessageKey = getMessageKey(latestMessage)
  const latestMessageRevoked = !!messageStore.revokedMessageMap[conversationId]?.[latestMessageKey]

  if (latestMessageRevoked) {
    return {
      messageType: V2NIMMessageType.V2NIM_MESSAGE_TYPE_TIPS,
      lastMessageState: LAST_MESSAGE_STATE_REVOKE,
      text: translate('commonRecalledMessage'),
      messageRefer: {
        createTime: latestMessage.createTime
      }
    } satisfies ConversationPreviewMessage
  }

  return {
    messageType: latestMessage.messageType,
    lastMessageState: 0,
    text: latestMessage.text,
    subType: latestMessage.subType,
    attachment: latestMessage.attachment,
    messageRefer: {
      createTime: latestMessage.createTime
    }
  } satisfies ConversationPreviewMessage
}

function getPreviewText(
  message: ConversationPreviewMessage | null | undefined,
  translate: PreviewTranslator,
  beMentioned = false
) {
  if (!message) {
    return translate('conversationListNoMessage')
  }

  const baseText = (() => {
    if (message.lastMessageState === LAST_MESSAGE_STATE_REVOKE) {
      return translate('commonRecalledMessage')
    }

    switch (message.messageType) {
      case V2NIMMessageType.V2NIM_MESSAGE_TYPE_TEXT:
        return (
          normalizeLocalizedPreviewText(message.text, translate) ||
          message.text ||
          translate('conversationListNoMessage')
        )
      case V2NIMMessageType.V2NIM_MESSAGE_TYPE_IMAGE:
        return translate('commonImageMessage')
      case V2NIMMessageType.V2NIM_MESSAGE_TYPE_FILE:
        return getFilePreviewText(message, translate)
      case V2NIMMessageType.V2NIM_MESSAGE_TYPE_AUDIO:
        return translate('commonAudioMessage')
      case V2NIMMessageType.V2NIM_MESSAGE_TYPE_VIDEO:
        return translate('commonVideoMessage')
      case V2NIMMessageType.V2NIM_MESSAGE_TYPE_LOCATION:
        return getLocationPreviewText(message, translate)
      case V2NIMMessageType.V2NIM_MESSAGE_TYPE_CALL: {
        return getCallMessagePreviewText(message) || `[${translate('callMsgText')}]`
      }
      case V2NIMMessageType.V2NIM_MESSAGE_TYPE_NOTIFICATION:
        return translate('conversationNotificationText')
      case V2NIMMessageType.V2NIM_MESSAGE_TYPE_TIPS:
        return (
          normalizeLocalizedPreviewText(message.text, translate) ||
          message.text ||
          translate('commonTipMessagePreview')
        )
      case V2NIMMessageType.V2NIM_MESSAGE_TYPE_CUSTOM:
        return isMergedForwardMessage(message as V2NIMMessage)
          ? translate('commonMergedChatHistory')
          : translate('commonUnknownMessageBody')
      default:
        return (
          normalizeLocalizedPreviewText(message.text, translate) ||
          translate('commonUnknownMessageBody')
        )
    }
  })()

  return beMentioned ? `${translate('conversationMentionPrefix')}${baseText}` : baseText
}

function getImConversationStore() {
  const preferCloudConversation = imStoreV2Bridge.preferCloudConversation
  const localConversationStore = imStoreV2Bridge.rootStore?.localConversationStore
  const conversationStore = imStoreV2Bridge.rootStore?.conversationStore

  if (preferCloudConversation && conversationStore) {
    return conversationStore
  }

  return localConversationStore || conversationStore || null
}

function shouldSkipHistoryPreloadForInvalidTeamConversation(conversationId: string) {
  return (
    imStoreV2Bridge.isInvalidTeamConversation(conversationId) ||
    conversationStore.isInvalidTeamConversation(conversationId)
  )
}

function getMessageKey(message: Pick<V2NIMMessage, 'messageClientId' | 'messageServerId'>) {
  return message.messageClientId || message.messageServerId
}

function shouldShowUnreadMention(item: MentionAwareConversation) {
  const unreadCount = item.unreadCount || 0

  if (unreadCount <= 0) {
    return false
  }

  const localMentionVisible = conversationStore.hasMention(item.conversationId)

  const aitMessageIds =
    item.aitMsgs?.filter((messageId): messageId is string => typeof messageId === 'string') || []

  if (aitMessageIds.length > 0) {
    const unreadMessages = messageStore
      .getConversationMessages(item.conversationId)
      .list.reduceRight<string[]>((messageIds, message) => {
        if (messageIds.length >= unreadCount) {
          return messageIds
        }

        const messageId = getMessageKey(message)

        if (
          !messageId ||
          messageStore.revokedMessageMap[item.conversationId]?.[messageId] ||
          message.senderId === nimStore.getLoginUser()
        ) {
          return messageIds
        }

        messageIds.unshift(messageId)
        return messageIds
      }, [])

    if (unreadMessages.length > 0) {
      const unreadMessageIdSet = new Set(unreadMessages)
      return (
        localMentionVisible ||
        aitMessageIds.some(
          (messageId) =>
            unreadMessageIdSet.has(messageId) &&
            !messageStore.revokedMessageMap[item.conversationId]?.[messageId]
        )
      )
    }
  }

  return localMentionVisible
}

const ConversationListHeader = React.memo(function ConversationListHeader({
  securityTipText,
  networkBannerText,
  pinnedAiUsers,
  onPressAiUser
}: ConversationListHeaderProps) {
  return (
    <View>
      <View style={styles.securityTip}>
        <ThemedText style={styles.securityTipText}>{securityTipText}</ThemedText>
      </View>
      {networkBannerText ? <UIKitNoticeBanner text={networkBannerText} /> : null}
      {pinnedAiUsers.length > 0 ? (
        <View style={styles.aiHeaderSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.aiHeaderScrollContent}
          >
            {pinnedAiUsers.map((item) => {
              const displayName = item.name || item.accountId

              return (
                <Pressable
                  key={item.accountId}
                  style={styles.aiHeaderCard}
                  onPress={() => onPressAiUser(item.accountId)}
                >
                  <UIKitUserAvatar account={item.accountId} avatar={item.avatar} size={42} />
                  <ThemedText numberOfLines={1} style={styles.aiHeaderName}>
                    {displayName}
                  </ThemedText>
                </Pressable>
              )
            })}
          </ScrollView>
        </View>
      ) : null}
    </View>
  )
})

const ConversationListItem = observer(function ConversationListItem({
  item,
  interactionMode,
  isSwipeOpen,
  pinLabel,
  deleteLabel,
  onOpen,
  onClose,
  onToggleStickTop,
  onDelete,
  onPress,
  onLongPress
}: ConversationListItemProps) {
  const onlineStatus = item.statusAccountId
    ? getUIKitOnlineStatusText(item.statusAccountId)
    : undefined
  const row = (
    <UIKitConversationRow
      title={item.title}
      subtitle={item.subtitle}
      avatar={item.avatar}
      avatarAccount={item.avatarAccount}
      onlineStatus={onlineStatus}
      badge={item.unread}
      muted={item.muted}
      pinned={item.stickTop}
      meta={item.timeText}
      onPress={() => {
        onPress(item.id, interactionMode === 'swipe' && isSwipeOpen)
      }}
      onLongPress={
        interactionMode === 'longPress'
          ? () => {
              onLongPress(item.id)
            }
          : undefined
      }
    />
  )

  if (interactionMode === 'longPress') {
    return row
  }

  return (
    <UIKitSwipeActionRow
      open={isSwipeOpen}
      onOpen={() => {
        onOpen(item.id)
      }}
      onClose={() => {
        onClose(item.id)
      }}
      actions={[
        {
          label: pinLabel,
          color: NEUIKitColors.primary,
          onPress: () => {
            onToggleStickTop(item.id, item.stickTop)
          }
        },
        {
          label: deleteLabel,
          color: '#A8ABB6',
          onPress: () => {
            onDelete(item.id)
          }
        }
      ]}
    >
      {row}
    </UIKitSwipeActionRow>
  )
})

const HomeScreen = observer(() => {
  const [actionConversationId, setActionConversationId] = useState<string | null>(null)
  const [swipedConversationId, setSwipedConversationId] = useState<string | null>(null)
  const [isDeletingConversation, setIsDeletingConversation] = useState(false)
  const [headerMenuVisible, setHeaderMenuVisible] = useState(false)
  const [isPullRefreshing, setIsPullRefreshing] = useState(false)
  const [visibleStatusAccountIds, setVisibleStatusAccountIds] = useState<string[]>([])

  const { t } = useAppTranslation()
  const { conversations, isLoading, isLoadingMore } = conversationStore
  const { isAuthenticated, loginStatus } = authStore
  const { runWithNavigationLock } = useNavigationLock()
  const isIMConnected = nimStore.isConnected()
  const initialEmptyStateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastVisibleConversationIndexRef = useRef(-1)
  const hasUserInteractedWithListRef = useRef(false)
  const conversationListRef = useRef<FlatList<FormattedConversation> | null>(null)
  const handledUnreadJumpRequestIdRef = useRef(0)
  const openingConversationIdRef = useRef<string | null>(null)
  const [didRequestInitialRefresh, setDidRequestInitialRefresh] = useState(false)
  const [canShowInitialEmptyState, setCanShowInitialEmptyState] = useState(false)
  const hasBoundImConversationStore = imStoreV2Bridge.hasBoundStore
  const imDisplayConversations = imStoreV2Bridge.displayConversations
  const sourceConversations = useMemo(() => {
    if (!hasBoundImConversationStore) {
      return conversations
    }

    const merged = new Map<string, ConversationListSourceItem>()

    imDisplayConversations.forEach((conversation) => {
      const conversationId = (conversation as { conversationId?: string }).conversationId

      if (conversationId) {
        merged.set(
          conversationId,
          mergeLocalRecalledPreview(
            conversation as unknown as ConversationListSourceItem,
            conversationStore.getConversation(conversationId) as ConversationListSourceItem | null
          )
        )
      }
    })
    conversations.forEach((conversation) => {
      const conversationId = conversation.conversationId

      if (!conversationId || merged.has(conversationId)) {
        return
      }

      if (conversationStore.isConversationLocallyHidden(conversationId)) {
        return
      }

      const hasLocalPreview =
        !!conversation.lastMessage ||
        messageStore.getConversationMessages(conversationId).list.length > 0

      if (!hasLocalPreview) {
        return
      }

      merged.set(conversationId, conversation as ConversationListSourceItem)
    })

    return Array.from(merged.values()).sort((left, right) => {
      if (!!left.stickTop !== !!right.stickTop) {
        return left.stickTop ? -1 : 1
      }

      const leftTime = left.sortOrder || left.lastMessage?.messageRefer?.createTime || 0
      const rightTime = right.sortOrder || right.lastMessage?.messageRefer?.createTime || 0

      return rightTime - leftTime
    })
  }, [conversations, hasBoundImConversationStore, imDisplayConversations])
  const isUsingImStoreConversations = hasBoundImConversationStore
  const isInitialConversationLoading =
    isAuthenticated &&
    loginStatus === 1 &&
    sourceConversations.length === 0 &&
    !canShowInitialEmptyState

  const clearInitialEmptyStateTimer = useCallback(() => {
    if (initialEmptyStateTimerRef.current) {
      clearTimeout(initialEmptyStateTimerRef.current)
      initialEmptyStateTimerRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated || loginStatus !== 1) {
      setDidRequestInitialRefresh(false)
      clearInitialEmptyStateTimer()
      setCanShowInitialEmptyState(false)
      return
    }

    if (sourceConversations.length > 0) {
      setDidRequestInitialRefresh(true)
      clearInitialEmptyStateTimer()
      setCanShowInitialEmptyState(false)
      return
    }

    if (!didRequestInitialRefresh && !isLoading) {
      setDidRequestInitialRefresh(true)
      clearInitialEmptyStateTimer()
      setCanShowInitialEmptyState(false)

      if (hasBoundImConversationStore) {
        imStoreV2Bridge.refreshConversations().catch(() => undefined)
        return
      }

      conversationStore.refreshConversations().catch(() => undefined)
      return
    }

    if (isLoading || !didRequestInitialRefresh) {
      clearInitialEmptyStateTimer()
      setCanShowInitialEmptyState(false)
      return
    }

    clearInitialEmptyStateTimer()
    initialEmptyStateTimerRef.current = setTimeout(() => {
      setCanShowInitialEmptyState(true)
      initialEmptyStateTimerRef.current = null
    }, INITIAL_EMPTY_STATE_DELAY_MS)
  }, [
    clearInitialEmptyStateTimer,
    didRequestInitialRefresh,
    hasBoundImConversationStore,
    isLoading,
    isAuthenticated,
    loginStatus,
    sourceConversations.length
  ])

  useEffect(() => {
    return () => {
      clearInitialEmptyStateTimer()
    }
  }, [clearInitialEmptyStateTimer])

  const networkBannerText = useMemo(() => {
    if (!isAuthenticated) {
      return null
    }

    if (loginStatus === 1 && isIMConnected) {
      return null
    }

    if (loginStatus === 0) {
      return t('offlineText' as never)
    }

    return t('connectingText' as never)
  }, [isAuthenticated, isIMConnected, loginStatus, t])

  const pinnedAiUsers = (() => {
    const aiUserStore = imStoreV2Bridge.rootStore?.aiUserStore
    return (aiUserStore?.getAIPinUser?.() || []) as PinnedAIUser[]
  })()
  const aiUserAccountIdsKey = imStoreV2Bridge.aiUsers
    .map((item) => item.accountId)
    .sort()
    .join('|')
  const friendDisplayNamesVersion = friendStore.friendListVersion
  const userDisplayNamesVersion = userStore.userVersion
  const messagePreviewFallbackKey = sourceConversations
    .map((conversation) => {
      if (conversation.lastMessage) {
        return `${conversation.conversationId}:source`
      }

      const messages = messageStore.getConversationMessages(conversation.conversationId).list
      const latestMessage = messages[messages.length - 1]

      return [
        conversation.conversationId,
        latestMessage?.messageClientId || '',
        latestMessage?.messageServerId || '',
        latestMessage?.messageType || '',
        latestMessage?.sendingState || '',
        latestMessage?.createTime || 0,
        latestMessage?.text || ''
      ].join(':')
    })
    .join('|')

  const formattedConversations = useMemo(() => {
    void aiUserAccountIdsKey
    void friendDisplayNamesVersion
    void messagePreviewFallbackKey
    void userDisplayNamesVersion

    return sourceConversations
      .filter(
        (conversation) =>
          !shouldSkipHistoryPreloadForInvalidTeamConversation(conversation.conversationId)
      )
      .map((conversation) => {
        const item = conversation as typeof conversation & {
          name?: string
          avatar?: string
          type?: V2NIMConversationType
          sortOrder?: number
          lastMessage?: ConversationPreviewMessage & { messageRefer?: { createTime?: number } }
          updateTime?: number
          unreadCount?: number
          mute?: boolean
          stickTop?: boolean
          aitMsgs?: unknown[]
        }
        const identity = getUIKitConversationIdentity({
          conversationId: item.conversationId,
          type: item.type,
          name: item.name,
          avatar: item.avatar
        })
        const isP2PConversation =
          identity.type === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P && !!identity.targetId
        const shouldShowOnlineStatus =
          isP2PConversation && identity.targetId ? !isUIKitAIUser(identity.targetId) : false
        const previewMessage = normalizeRecalledConversationPreview(
          item.conversationId,
          item.lastMessage || getFallbackConversationPreviewMessage(item.conversationId, t),
          t
        )
        const displayTimestamp =
          getConversationDisplayTimestamp({
            lastMessage: previewMessage || undefined,
            updateTime: item.updateTime
          }) || item.sortOrder
        return {
          id: item.conversationId,
          title: identity.title,
          avatar: identity.avatarUri,
          avatarAccount: identity.avatarAccount,
          statusAccountId: shouldShowOnlineStatus ? identity.targetId : undefined,
          targetAccountId: isP2PConversation ? identity.targetId : undefined,
          subtitle: getPreviewText(previewMessage, t, shouldShowUnreadMention(item)),
          timeText: formatConversationTime(displayTimestamp),
          unread: item.unreadCount || 0,
          muted: !!item.mute,
          stickTop: !!item.stickTop
        }
      }) satisfies FormattedConversation[]
  }, [
    aiUserAccountIdsKey,
    friendDisplayNamesVersion,
    messagePreviewFallbackKey,
    sourceConversations,
    t,
    userDisplayNamesVersion
  ])

  const p2pConversationAccountIds = useMemo(
    () =>
      formattedConversations
        .map((item) => item.targetAccountId)
        .filter((accountId): accountId is string => !!accountId),
    [formattedConversations]
  )
  const initialProfileAccountIds = useMemo(
    () => p2pConversationAccountIds.slice(0, CONVERSATION_INITIAL_RENDER_COUNT),
    [p2pConversationAccountIds]
  )
  const initialStatusAccountIds = useMemo(
    () => p2pConversationAccountIds.slice(0, CONVERSATION_INITIAL_STATUS_SUBSCRIBE_COUNT),
    [p2pConversationAccountIds]
  )
  const conversationStatusAccountIds = useMemo(
    () =>
      Array.from(new Set([...initialStatusAccountIds, ...visibleStatusAccountIds])).filter(Boolean),
    [initialStatusAccountIds, visibleStatusAccountIds]
  )

  useEffect(() => {
    if (formattedConversations.length === 0) {
      lastVisibleConversationIndexRef.current = -1
      hasUserInteractedWithListRef.current = false
    }
  }, [formattedConversations.length])

  useEffect(() => {
    ensureUIKitUserProfiles(initialProfileAccountIds).catch(() => undefined)
  }, [initialProfileAccountIds])

  useEffect(() => {
    if (!p2pConversationAccountIds.length || aiUserAccountIdsKey) {
      return
    }

    imStoreV2Bridge.ensureAIUsersLoaded().catch(() => undefined)
  }, [aiUserAccountIdsKey, p2pConversationAccountIds.length])

  useUIKitUserStatusSubscription(conversationStatusAccountIds)

  const actionConversation = useMemo(
    () => formattedConversations.find((item) => item.id === actionConversationId),
    [actionConversationId, formattedConversations]
  )
  const pinConversationSwipeLabel = t('conversationListPin' as never)
  const unpinConversationSwipeLabel = t('conversationListUnpin' as never)
  const deleteConversationSwipeLabel = t('commonDelete' as never)
  const securityTipText = t('securityTipText' as never)
  useFocusEffect(
    useCallback(() => {
      openingConversationIdRef.current = null

      return () => {
        setHeaderMenuVisible(false)
        setActionConversationId(null)
        setIsPullRefreshing(false)
      }
    }, [])
  )

  const handleRefresh = useCallback(async () => {
    setIsPullRefreshing(true)
    lastVisibleConversationIndexRef.current = -1
    hasUserInteractedWithListRef.current = false

    try {
      if (hasBoundImConversationStore) {
        await imStoreV2Bridge.refreshConversations()
        return
      }

      await conversationStore.refreshConversations()
    } finally {
      setIsPullRefreshing(false)
    }
  }, [hasBoundImConversationStore])

  const canLoadMoreConversations = isUsingImStoreConversations
    ? !imStoreV2Bridge.isLoadingMore && imStoreV2Bridge.hasMoreConversations
    : !isLoadingMore && conversationStore.hasMore

  const clearUnread = useCallback(async (conversationId: string) => {
    conversationStore.clearMention(conversationId)

    if (getImConversationStore()) {
      await imStoreV2Bridge.clearUnread(conversationId)
      return
    }

    await conversationStore.clearUnread(conversationId)
  }, [])

  const handleUnavailableTeamConversationPress = useCallback(
    (conversationId: string) => {
      Alert.alert(
        t('commonTip'),
        t('chatTeamUnavailableTip'),
        [
          {
            text: t('actionConfirm'),
            onPress: () => {
              imStoreV2Bridge
                .deleteActiveConversation(conversationId)
                .catch(() => conversationStore.deleteConversation(conversationId, true))
                .finally(() => {
                  imStoreV2Bridge.removeTeamConversationLocally(conversationId)
                  conversationStore.removeTeamConversationLocally(conversationId)
                })
            }
          }
        ],
        { cancelable: false }
      )
    },
    [t]
  )

  const handleConversationPress = useCallback(
    async (conversationId: string) => {
      if (openingConversationIdRef.current) {
        return
      }

      if (shouldSkipHistoryPreloadForInvalidTeamConversation(conversationId)) {
        handleUnavailableTeamConversationPress(conversationId)
        return
      }

      const teamConversationType =
        nimStore.nim?.V2NIMConversationIdUtil.parseConversationType(conversationId)
      const teamId = nimStore.nim?.V2NIMConversationIdUtil.parseConversationTargetId(conversationId)

      if (
        teamConversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM &&
        teamId &&
        teamStore.hasLoadedJoinedTeams
      ) {
        const currentTeam = teamStore.getTeam(teamId)

        if (
          !currentTeam ||
          currentTeam.isValidTeam === false ||
          currentTeam.isTeamEffective === false
        ) {
          handleUnavailableTeamConversationPress(conversationId)
          return
        }
      }

      void clearUnread(conversationId).catch(() => undefined)

      const didStartNavigation = runWithNavigationLock(() => {
        openingConversationIdRef.current = conversationId
        router.push({ pathname: '/chat/[id]', params: { id: conversationId } })
      })

      if (!didStartNavigation) {
        openingConversationIdRef.current = null
      }
    },
    [clearUnread, handleUnavailableTeamConversationPress, runWithNavigationLock]
  )

  const handleAiConversationPress = useCallback(
    async (accountId: string) => {
      const conversationId = nimStore.nim?.V2NIMConversationIdUtil.p2pConversationId(accountId)

      if (!conversationId) {
        toast.alert(
          t('commonOpenFailed' as never),
          t('contactsAiUsersInvalidConversation' as never)
        )
        return
      }

      try {
        await conversationStore.createConversation(conversationId)
        void clearUnread(conversationId).catch(() => undefined)
        if (openingConversationIdRef.current) {
          return
        }

        const didStartNavigation = runWithNavigationLock(() => {
          openingConversationIdRef.current = conversationId
          router.push({ pathname: '/chat/[id]', params: { id: conversationId } })
        })

        if (!didStartNavigation) {
          openingConversationIdRef.current = null
        }
      } catch (error) {
        toast.alert(
          t('commonOpenFailed' as never),
          error instanceof Error ? error.message : t('commonRetryLater' as never)
        )
      }
    },
    [clearUnread, runWithNavigationLock, t]
  )

  const closeActions = useCallback(() => {
    setActionConversationId(null)
    setSwipedConversationId(null)
  }, [])

  const handleSwipeOpen = useCallback((conversationId: string) => {
    setSwipedConversationId(conversationId)
    setActionConversationId(null)
  }, [])

  const handleSwipeClose = useCallback((conversationId: string) => {
    setSwipedConversationId((current) => (current === conversationId ? null : current))
  }, [])

  const handleConversationRowPress = useCallback(
    (conversationId: string, isSwipeOpen: boolean) => {
      if (isSwipeOpen) {
        closeActions()
        return
      }

      handleConversationPress(conversationId).catch(() => undefined)
    },
    [closeActions, handleConversationPress]
  )

  const handleConversationRowLongPress = useCallback((conversationId: string) => {
    setActionConversationId(conversationId)
    setSwipedConversationId(null)
  }, [])

  const runConversationAction = useCallback(
    async (action: () => Promise<void>) => {
      try {
        await action()
      } catch (error) {
        toast.alert(
          t('conversationListOperationFailedTitle' as never),
          error instanceof Error ? error.message : NETWORK_UNAVAILABLE_MESSAGE
        )
      } finally {
        closeActions()
      }
    },
    [closeActions, t]
  )

  const toggleStickTop = useCallback(
    async (conversationId: string, stickTop: boolean) => {
      await runConversationAction(async () => {
        await ensureNetworkAvailable()

        const imConversationStore = getImConversationStore()
        if (imConversationStore) {
          const nextStickTop = !stickTop
          await imStoreV2Bridge.stickTopActiveConversation(conversationId, nextStickTop)
          await imStoreV2Bridge.refreshCurrentConversationSource()
          return
        }

        await conversationStore.toggleStickTop(conversationId, !stickTop)
      })
    },
    [runConversationAction]
  )

  const deleteConversation = useCallback(
    async (conversationId: string) => {
      if (isDeletingConversation) {
        return
      }

      closeActions()
      setIsDeletingConversation(true)
      try {
        try {
          await ensureNetworkAvailable()
        } catch {
          throw new Error(DELETE_CONVERSATION_NETWORK_ERROR)
        }

        const imConversationStore = getImConversationStore()
        if (imConversationStore) {
          await imConversationStore.deleteConversationActive(conversationId)
          const mutationStore = imConversationStore as ConversationMutationStore
          mutationStore.removeConversation?.([conversationId])
          conversationStore.removeConversationLocally(conversationId)
        } else {
          await conversationStore.deleteConversation(conversationId)
        }
      } catch (error) {
        toast.alert(
          t('conversationListDeleteFailedTitle' as never),
          error instanceof Error ? error.message : t('commonRetryLater' as never)
        )
      } finally {
        setIsDeletingConversation(false)
      }
    },
    [closeActions, isDeletingConversation, t]
  )

  const renderConversationItem = useCallback(
    ({ item }: ListRenderItemInfo<FormattedConversation>) => (
      <ConversationListItem
        item={item}
        interactionMode={CONVERSATION_INTERACTION_MODE}
        isSwipeOpen={swipedConversationId === item.id}
        pinLabel={item.stickTop ? unpinConversationSwipeLabel : pinConversationSwipeLabel}
        deleteLabel={deleteConversationSwipeLabel}
        onOpen={handleSwipeOpen}
        onClose={handleSwipeClose}
        onToggleStickTop={toggleStickTop}
        onDelete={deleteConversation}
        onPress={handleConversationRowPress}
        onLongPress={handleConversationRowLongPress}
      />
    ),
    [
      deleteConversation,
      deleteConversationSwipeLabel,
      handleConversationRowLongPress,
      handleConversationRowPress,
      handleSwipeClose,
      handleSwipeOpen,
      pinConversationSwipeLabel,
      swipedConversationId,
      toggleStickTop,
      unpinConversationSwipeLabel
    ]
  )

  const listHeaderComponent = useMemo(
    () => (
      <ConversationListHeader
        securityTipText={securityTipText}
        networkBannerText={networkBannerText}
        pinnedAiUsers={pinnedAiUsers}
        onPressAiUser={(accountId) => {
          handleAiConversationPress(accountId).catch(() => undefined)
        }}
      />
    ),
    [handleAiConversationPress, networkBannerText, pinnedAiUsers, securityTipText]
  )

  const triggerConversationPrefetch = useCallback(() => {
    if (!canLoadMoreConversations) {
      return
    }

    if (isUsingImStoreConversations) {
      imStoreV2Bridge.loadMoreConversations().catch(() => undefined)
      return
    }

    conversationStore.loadMoreConversations().catch(() => undefined)
  }, [canLoadMoreConversations, isUsingImStoreConversations])

  const maybePrefetchMoreConversations = useCallback(
    (lastVisibleIndex: number) => {
      if (
        lastVisibleIndex < 0 ||
        !formattedConversations.length ||
        !canLoadMoreConversations ||
        !hasUserInteractedWithListRef.current
      ) {
        return
      }

      const remainingCount = formattedConversations.length - 1 - lastVisibleIndex

      if (remainingCount <= CONVERSATION_PREFETCH_REMAINING_COUNT) {
        triggerConversationPrefetch()
      }
    },
    [canLoadMoreConversations, formattedConversations.length, triggerConversationPrefetch]
  )

  const handleVisibleItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken<FormattedConversation>[] }) => {
      if (!formattedConversations.length || viewableItems.length === 0) {
        return
      }

      const lastVisibleIndex = viewableItems.reduce((maxIndex, viewableItem) => {
        const index = typeof viewableItem.index === 'number' ? viewableItem.index : -1
        return Math.max(maxIndex, index)
      }, -1)

      if (lastVisibleIndex < 0) {
        return
      }

      lastVisibleConversationIndexRef.current = lastVisibleIndex
      const nextVisibleStatusAccountIds = viewableItems
        .map((viewableItem) => viewableItem.item.targetAccountId)
        .filter((accountId): accountId is string => !!accountId)
      setVisibleStatusAccountIds((current) =>
        areStringArraysEqual(current, nextVisibleStatusAccountIds)
          ? current
          : nextVisibleStatusAccountIds
      )
      maybePrefetchMoreConversations(lastVisibleIndex)
    },
    [formattedConversations.length, maybePrefetchMoreConversations]
  )

  const scrollToNearestUnreadConversation = useCallback(() => {
    const unreadIndex = formattedConversations.findIndex((item) => item.unread > 0)

    if (unreadIndex < 0) {
      return
    }

    hasUserInteractedWithListRef.current = true
    lastVisibleConversationIndexRef.current = unreadIndex

    requestAnimationFrame(() => {
      conversationListRef.current?.scrollToIndex({
        index: unreadIndex,
        animated: true,
        viewPosition: 0
      })
    })
  }, [formattedConversations])

  useEffect(() => {
    const requestId = conversationListUIStore.jumpToNearestUnreadRequestId

    if (requestId === 0 || requestId === handledUnreadJumpRequestIdRef.current) {
      return
    }

    if (formattedConversations.length === 0) {
      return
    }

    handledUnreadJumpRequestIdRef.current = requestId
    scrollToNearestUnreadConversation()
  }, [formattedConversations.length, scrollToNearestUnreadConversation])

  useFocusEffect(
    useCallback(() => {
      const requestId = conversationListUIStore.jumpToNearestUnreadRequestId

      if (requestId === 0 || requestId === handledUnreadJumpRequestIdRef.current) {
        return
      }

      handledUnreadJumpRequestIdRef.current = requestId
      scrollToNearestUnreadConversation()
    }, [scrollToNearestUnreadConversation])
  )

  useEffect(() => {
    if (lastVisibleConversationIndexRef.current < 0) {
      return
    }

    maybePrefetchMoreConversations(lastVisibleConversationIndexRef.current)
  }, [formattedConversations.length, maybePrefetchMoreConversations])

  return (
    <UIKitWhitePage>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <View style={styles.headerTitle}>
              <UIKitIcon type="logo" width={34} height={34} />
              <ThemedText style={styles.headerTitleText}>
                {t('conversationListTitle' as never)}
              </ThemedText>
            </View>
          ),
          headerTitleAlign: 'left',
          headerRight: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() =>
                  runWithNavigationLock(() => {
                    router.push('/conversation/search' as never)
                  })
                }
              >
                <UIKitIcon type="icon-conversation-search" size={22} tintColor="#333333" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => setHeaderMenuVisible(true)}
              >
                <UIKitIcon type="icon-addition" size={22} tintColor="#333333" />
              </TouchableOpacity>
            </View>
          )
        }}
      />

      <FlatList
        ref={conversationListRef}
        data={formattedConversations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          !isInitialConversationLoading && formattedConversations.length === 0
            ? styles.emptyListContent
            : undefined
        }
        ListHeaderComponent={listHeaderComponent}
        refreshControl={
          <RefreshControl
            refreshing={isPullRefreshing}
            onRefresh={() => {
              handleRefresh().catch(() => undefined)
            }}
          />
        }
        onScrollBeginDrag={() => {
          hasUserInteractedWithListRef.current = true
        }}
        onScrollToIndexFailed={({ index }) => {
          conversationListRef.current?.scrollToOffset({
            offset: Math.max(index, 0) * CONVERSATION_ROW_HEIGHT,
            animated: true
          })
        }}
        ListEmptyComponent={
          isInitialConversationLoading ? (
            <View style={styles.initialLoading}>
              <ActivityIndicator color={NEUIKitColors.primary} />
            </View>
          ) : (
            <UIKitEmptyState title={t('conversationEmptyText' as never)} />
          )
        }
        renderItem={renderConversationItem}
        removeClippedSubviews
        initialNumToRender={CONVERSATION_INITIAL_RENDER_COUNT}
        maxToRenderPerBatch={CONVERSATION_BATCH_RENDER_COUNT}
        windowSize={CONVERSATION_WINDOW_SIZE}
        updateCellsBatchingPeriod={8}
        getItemLayout={(_, index) => ({
          length: CONVERSATION_ROW_HEIGHT,
          offset: CONVERSATION_ROW_HEIGHT * index,
          index
        })}
        onViewableItemsChanged={handleVisibleItemsChanged}
        viewabilityConfig={CONVERSATION_VIEWABILITY_CONFIG}
        onEndReachedThreshold={0.3}
        onEndReached={() => {
          if (!hasUserInteractedWithListRef.current) {
            return
          }

          triggerConversationPrefetch()
        }}
        ListFooterComponent={
          isLoadingMore || imStoreV2Bridge.isLoadingMore ? (
            <View style={styles.footerLoading}>
              <ActivityIndicator color={NEUIKitColors.primary} />
            </View>
          ) : null
        }
        extraData={swipedConversationId}
      />

      <UIKitActionSheet
        visible={!!actionConversation}
        onClose={closeActions}
        actions={[
          {
            label: actionConversation?.stickTop
              ? t('conversationListUnpin' as never)
              : t('conversationListPinConversation' as never),
            onPress: () =>
              toggleStickTop(actionConversation!.id, !!actionConversation?.stickTop).catch(
                () => undefined
              )
          },
          {
            label: t('conversationListDeleteConversation' as never),
            danger: true,
            onPress: () => {
              deleteConversation(actionConversation!.id).catch(() => undefined)
            }
          }
        ]}
      />

      <UIKitDropdownMenu
        visible={headerMenuVisible}
        top={0}
        right={14}
        onClose={() => setHeaderMenuVisible(false)}
        actions={[
          {
            label: t('conversationListAddFriend' as never),
            icon: 'icon-tianjiahaoyou',
            onPress: () => {
              setHeaderMenuVisible(false)
              runWithNavigationLock(() => {
                router.push('/friend/add' as never)
              })
            }
          },
          {
            label: t('conversationListJoinGroup' as never),
            icon: 'icon-join',
            onPress: () => {
              setHeaderMenuVisible(false)
              runWithNavigationLock(() => {
                router.push('/team/join' as never)
              })
            }
          },
          {
            label: t('conversationListCreateDiscussion' as never),
            icon: 'icon-conversation-create-team',
            onPress: () => {
              setHeaderMenuVisible(false)
              runWithNavigationLock(() => {
                router.push({
                  pathname: '/conversation/picker',
                  params: { mode: 'discussion' }
                } as never)
              })
            }
          },
          {
            label: t('conversationListCreateAdvancedGroup' as never),
            icon: 'icon-conversation-create-team',
            onPress: () => {
              setHeaderMenuVisible(false)
              runWithNavigationLock(() => {
                router.push({
                  pathname: '/conversation/picker',
                  params: { mode: 'group' }
                } as never)
              })
            }
          }
        ]}
      />
    </UIKitWhitePage>
  )
})

const styles = StyleSheet.create({
  securityTip: {
    minHeight: 50,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFF5E1',
    justifyContent: 'center'
  },
  securityTipText: {
    color: '#EB9718',
    fontSize: 14,
    lineHeight: 20
  },
  aiHeaderSection: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8ECF1'
  },
  aiHeaderScrollContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10
  },
  aiHeaderCard: {
    width: 72,
    minHeight: 74,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    paddingVertical: 4
  },
  aiHeaderName: {
    marginTop: 6,
    color: '#333333',
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'center'
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  headerTitleText: {
    color: '#222222',
    fontSize: 22,
    fontWeight: '700'
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 8
  },
  headerButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center'
  },
  footerLoading: {
    paddingVertical: 20
  },
  emptyListContent: {
    flexGrow: 1
  },
  initialLoading: {
    paddingVertical: 56,
    alignItems: 'center',
    justifyContent: 'center'
  }
})

export default HomeScreen
