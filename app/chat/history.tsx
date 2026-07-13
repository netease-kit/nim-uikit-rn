import { router, Stack, useLocalSearchParams } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { useAppTranslation } from '@/hooks/useAppTranslation'
import { toast } from '@/src/NEUIKit/common/utils/toast'
import {
  UIKitChatEmptyState,
  UIKitChatHeaderTitle,
  UIKitChatMessageBubble,
  UIKitChatSearchBar
} from '@/src/NEUIKit/rn'
import { conversationStore, messageStore, nimStore, teamStore } from '@/stores'
import { translateCurrentApp } from '@/utils/app-language'
import { normalizeDisplayErrorMessage } from '@/utils/error-message'
import { formatAndroidAlignedListTime } from '@/utils/list-time'
import {
  getForwardPreview,
  getMergedForwardSummary,
  getMessageKey,
  isMergedForwardMessage
} from '@/utils/messageForward'
import { V2NIMConversationType, V2NIMMessage, V2NIMMessageType } from '@/utils/nim-sdk'

const CHAT_HISTORY_PREFETCH_TOP_OFFSET = 240

function getHistoryPreview(message: V2NIMMessage) {
  const revokedText = messageStore.getRevokedText(message)

  if (revokedText) {
    return revokedText
  }

  if (message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_NOTIFICATION) {
    return translateCurrentApp('conversationNotificationText' as never)
  }

  if (message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_TIPS) {
    return (
      normalizeDisplayErrorMessage(message.text || '') ||
      translateCurrentApp('commonTipMessagePreview' as never)
    )
  }

  const mergedSummary = getMergedForwardSummary(message)
  return mergedSummary ? mergedSummary.title : getForwardPreview(message)
}

const ChatHistoryScreen = observer(() => {
  const { t } = useAppTranslation()
  const { conversationId, title } = useLocalSearchParams<{
    conversationId?: string
    title?: string
  }>()
  const resolvedConversationId = typeof conversationId === 'string' ? conversationId : ''
  const resolvedTitle = typeof title === 'string' ? title : ''
  const conversation = conversationStore.getConversation(resolvedConversationId)
  const messageState = messageStore.getConversationMessages(resolvedConversationId)
  const conversationType =
    nimStore.nim?.V2NIMConversationIdUtil.parseConversationType(resolvedConversationId)
  const targetId =
    nimStore.nim?.V2NIMConversationIdUtil.parseConversationTargetId(resolvedConversationId)
  const currentUserId = nimStore.getLoginUser()
  const [initialLoadFailed, setInitialLoadFailed] = useState(false)
  const [query, setQuery] = useState('')
  const historyPrefetchTriggeredRef = React.useRef(false)

  const loadInitialHistory = useCallback(async () => {
    if (!currentUserId || !resolvedConversationId || messageState.isSync || messageState.loading) {
      return
    }

    setInitialLoadFailed(false)

    try {
      await messageStore.loadHistory(resolvedConversationId)
    } catch (error) {
      setInitialLoadFailed(true)
      toast.alert(
        t('commonLoadingFailed' as never),
        error instanceof Error ? error.message : t('chatHistoryLoadFailed' as never)
      )
    }
  }, [currentUserId, messageState.isSync, messageState.loading, resolvedConversationId, t])

  useEffect(() => {
    loadInitialHistory().catch(() => undefined)
  }, [currentUserId, loadInitialHistory])

  useEffect(() => {
    if (conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM && targetId) {
      teamStore.loadMembers(targetId).catch(() => undefined)
    }
  }, [conversationType, targetId])

  useEffect(() => {
    if (!messageState.loadingMore) {
      historyPrefetchTriggeredRef.current = false
    }
  }, [messageState.loadingMore])

  const filteredMessages = useMemo(() => {
    if (!query.trim()) {
      return messageState.list
    }

    const keyword = query.trim().toLowerCase()

    return messageState.list.filter((message) => {
      const sender = message.senderId.toLowerCase()
      const preview = getHistoryPreview(message).toLowerCase()

      return sender.includes(keyword) || preview.includes(keyword)
    })
  }, [messageState.list, query])

  const openHistoryMessage = async (message: V2NIMMessage) => {
    if (isMergedForwardMessage(message)) {
      router.push({
        pathname: '/chat/merged-forward-detail',
        params: {
          conversationId: message.conversationId,
          messageId: getMessageKey(message)
        }
      } as never)
      return
    }

    if (
      message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_TEXT ||
      message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_CUSTOM
    ) {
      router.push({
        pathname: '/chat/message-preview',
        params: {
          conversationId: message.conversationId,
          messageId: getMessageKey(message)
        }
      } as never)
      return
    }

    if (
      message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_IMAGE ||
      message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_VIDEO
    ) {
      router.push({
        pathname: '/chat/media-viewer',
        params: {
          conversationId: message.conversationId,
          messageId: getMessageKey(message),
          type:
            message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_IMAGE ? 'image' : 'video'
        }
      } as never)
      return
    }

    if (message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_LOCATION) {
      router.push({
        pathname: '/chat/location-detail',
        params: {
          conversationId: message.conversationId,
          messageId: getMessageKey(message)
        }
      } as never)
      return
    }

    if (message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_FILE) {
      router.push({
        pathname: '/chat/file-detail',
        params: {
          conversationId: message.conversationId,
          messageId: getMessageKey(message)
        }
      } as never)
      return
    }

    if (message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_AUDIO) {
      const source =
        (message.attachment as { path?: string; url?: string } | undefined)?.path ||
        (message.attachment as { path?: string; url?: string } | undefined)?.url ||
        ''

      if (!source) {
        toast.alert(t('commonOpenFailed' as never), t('chatHistoryAudioUnavailable' as never))
        return
      }

      const canOpen = await Linking.canOpenURL(source)

      if (!canOpen) {
        toast.alert(t('commonOpenFailed' as never), t('chatHistoryAttachmentUnavailable' as never))
        return
      }

      await Linking.openURL(source)
      return
    }

    router.push({
      pathname: '/chat/message-preview',
      params: {
        conversationId: message.conversationId,
        messageId: getMessageKey(message)
      }
    } as never)
  }

  const triggerLoadMoreHistory = useCallback(() => {
    messageStore.loadMoreHistory(resolvedConversationId).catch((error) => {
      toast.alert(
        t('commonLoadingFailed' as never),
        error instanceof Error ? error.message : t('chatHistoryLoadMoreFailed' as never)
      )
    })
  }, [resolvedConversationId, t])

  const handleHistoryScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (query.trim()) {
        return
      }

      const isNearTop = event.nativeEvent.contentOffset.y <= CHAT_HISTORY_PREFETCH_TOP_OFFSET

      if (!isNearTop) {
        historyPrefetchTriggeredRef.current = false
        return
      }

      if (
        historyPrefetchTriggeredRef.current ||
        messageState.loading ||
        messageState.loadingMore ||
        !messageState.hasMore
      ) {
        return
      }

      historyPrefetchTriggeredRef.current = true
      triggerLoadMoreHistory()
    },
    [
      messageState.hasMore,
      messageState.loading,
      messageState.loadingMore,
      query,
      triggerLoadMoreHistory
    ]
  )

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: () => <UIKitChatHeaderTitle title={t('chatHistoryTitle' as never)} />,
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#FFFFFF' }
        }}
      />

      <View style={styles.topArea}>
        <UIKitChatSearchBar
          value={query}
          onChangeText={setQuery}
          placeholder={t('chatHistorySearchPlaceholder' as never)}
          returnKeyType="search"
        />
        <View style={styles.summaryRow}>
          <ThemedText numberOfLines={1} style={styles.summaryTitle}>
            {resolvedTitle || conversation?.name || t('chatHistoryCurrentConversation' as never)}
          </ThemedText>
          <ThemedText style={styles.summaryMeta}>
            {t('chatHistorySummary' as never, { count: messageState.list.length })}
          </ThemedText>
        </View>
      </View>

      <FlatList
        data={filteredMessages}
        keyExtractor={(item) => getMessageKey(item)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          messageState.hasMore ? (
            <TouchableOpacity
              style={styles.loadMoreButton}
              onPress={() => {
                triggerLoadMoreHistory()
              }}
              disabled={messageState.loadingMore}
            >
              {messageState.loadingMore ? (
                <ActivityIndicator color="#337EFF" />
              ) : (
                <ThemedText style={styles.loadMoreText}>
                  {t('chatHistoryLoadMore' as never)}
                </ThemedText>
              )}
            </TouchableOpacity>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            {messageState.loading ? (
              <ActivityIndicator color="#337EFF" />
            ) : initialLoadFailed ? (
              <>
                <UIKitChatEmptyState
                  title={t('chatHistoryLoadFailed' as never)}
                  actionLabel={t('commonRetry' as never)}
                  onActionPress={() => {
                    loadInitialHistory().catch(() => undefined)
                  }}
                />
              </>
            ) : (
              <UIKitChatEmptyState
                title={
                  query.trim() ? t('chatHistoryNoMatch' as never) : t('chatHistoryEmpty' as never)
                }
                description={query.trim() ? t('chatHistoryNoMatchDescription' as never) : undefined}
              />
            )}
          </View>
        }
        onScroll={handleHistoryScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View style={styles.rowWrap}>
            <View style={styles.messageTimeWrap}>
              <ThemedText style={styles.messageTimeText}>
                {formatAndroidAlignedListTime(item.createTime)}
              </ThemedText>
            </View>
            <UIKitChatMessageBubble
              message={item}
              currentUserId={currentUserId}
              conversationId={resolvedConversationId}
              conversationType={conversationType}
              targetId={targetId}
              onLongPress={() => undefined}
              onPressMessage={(message) => {
                openHistoryMessage(message).catch((error) => {
                  toast.alert(
                    t('commonOpenFailed' as never),
                    error instanceof Error
                      ? error.message
                      : t('commonMessageUnavailableOpen' as never)
                  )
                })
              }}
              onPressReplyMessage={(message) => {
                openHistoryMessage(message).catch((error) => {
                  toast.alert(
                    t('commonOpenFailed' as never),
                    error instanceof Error
                      ? error.message
                      : t('commonMessageUnavailableOpen' as never)
                  )
                })
              }}
              onReeditMessage={() => undefined}
              reeditHidden
              onRetry={() => undefined}
              downloadingVideoIds={[]}
              downloadedVideoMap={{}}
              downloadingFileIds={[]}
              downloadedFileMap={{}}
              playingAudioMessageId={null}
              selectionMode={false}
              selected={false}
              selectable={false}
              onToggleSelect={() => undefined}
              showReadReceipt={false}
              readOnly
            />
          </View>
        )}
      />
    </ThemedView>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB'
  },
  topArea: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF'
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 12
  },
  summaryTitle: {
    flex: 1,
    color: '#2B3340',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700'
  },
  summaryMeta: {
    color: '#97A2B2',
    fontSize: 12,
    lineHeight: 18
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24
  },
  loadMoreButton: {
    alignSelf: 'center',
    minHeight: 34,
    minWidth: 124,
    borderRadius: 17,
    backgroundColor: '#EAF1FB',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginBottom: 18
  },
  loadMoreText: {
    color: '#337EFF',
    fontSize: 12,
    fontWeight: '700'
  },
  emptyState: {
    paddingTop: 56,
    alignItems: 'center',
    gap: 12
  },
  rowWrap: {
    marginBottom: 6
  },
  messageTimeWrap: {
    alignItems: 'center',
    marginBottom: 10
  },
  messageTimeText: {
    color: '#97A2B2',
    fontSize: 12,
    lineHeight: 18,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#FFFFFF'
  }
})

export default ChatHistoryScreen
