import { router, Stack, useLocalSearchParams } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import {
  getUIKitAppellation,
  UIKitActionPill,
  UIKitChatEmptyState,
  UIKitChatHeaderTitle,
  UIKitChatHighlightText,
  UIKitChatSearchBar,
  UIKitMessageCard
} from '@/src/NEUIKit/rn'
import { conversationStore, messageStore, nimStore, teamStore } from '@/stores'
import { getForwardPreview, getMessageKey, parseMergedForwardPayload } from '@/utils/messageForward'
import {
  V2NIMConversationType,
  V2NIMMessage,
  V2NIMMessageSendingState,
  V2NIMMessageType
} from '@/utils/nim-sdk'

function getHistoryPreview(message: V2NIMMessage) {
  const revokedText = messageStore.getRevokedText(message)

  if (revokedText) {
    return revokedText
  }

  if (message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_NOTIFICATION) {
    return '[通知消息]'
  }

  if (message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_TIPS) {
    return message.text || '[提示消息]'
  }

  const mergedPayload = parseMergedForwardPayload(message)
  return mergedPayload ? mergedPayload.title : getForwardPreview(message)
}

function getSenderName(message: V2NIMMessage, teamId?: string) {
  if (message.isSelf) {
    return '我'
  }

  return getUIKitAppellation({ account: message.senderId, teamId }) || message.senderId
}

const ChatHistoryScreen = observer(() => {
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

  const loadInitialHistory = useCallback(async () => {
    if (!currentUserId || !resolvedConversationId || messageState.isSync || messageState.loading) {
      return
    }

    setInitialLoadFailed(false)

    try {
      await messageStore.loadHistory(resolvedConversationId)
    } catch (error) {
      setInitialLoadFailed(true)
      Alert.alert('加载失败', error instanceof Error ? error.message : '历史消息加载失败')
    }
  }, [currentUserId, messageState.isSync, messageState.loading, resolvedConversationId])

  useEffect(() => {
    loadInitialHistory().catch(() => undefined)
  }, [currentUserId, loadInitialHistory])

  useEffect(() => {
    if (conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM && targetId) {
      teamStore.loadMembers(targetId).catch(() => undefined)
    }
  }, [conversationType, targetId])

  const filteredMessages = useMemo(() => {
    if (!query.trim()) {
      return messageState.list
    }

    const keyword = query.trim().toLowerCase()

    return messageState.list.filter((message) => {
      const sender = getSenderName(
        message,
        conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM
          ? targetId
          : undefined
      ).toLowerCase()
      const preview = getHistoryPreview(message).toLowerCase()

      return sender.includes(keyword) || preview.includes(keyword)
    })
  }, [conversationType, messageState.list, query, targetId])

  const openHistoryMessage = async (message: V2NIMMessage) => {
    const mergedPayload = parseMergedForwardPayload(message)

    if (mergedPayload) {
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
        Alert.alert('打开失败', '当前语音不存在或尚未可用')
        return
      }

      const canOpen = await Linking.canOpenURL(source)

      if (!canOpen) {
        Alert.alert('打开失败', '当前设备无法直接打开该附件')
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

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: () => <UIKitChatHeaderTitle title="历史记录" />,
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#FFFFFF' }
        }}
      />

      <View style={styles.topArea}>
        <UIKitChatSearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="搜索聊天记录"
          returnKeyType="search"
        />
        <View style={styles.summaryRow}>
          <ThemedText numberOfLines={1} style={styles.summaryTitle}>
            {resolvedTitle || conversation?.name || '当前会话'}
          </ThemedText>
          <ThemedText style={styles.summaryMeta}>共 {messageState.list.length} 条消息</ThemedText>
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
                messageStore.loadMoreHistory(resolvedConversationId).catch((error) => {
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
                <ThemedText style={styles.loadMoreText}>加载更早消息</ThemedText>
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
                  title="历史消息加载失败"
                  actionLabel="重试"
                  onActionPress={() => {
                    loadInitialHistory().catch(() => undefined)
                  }}
                />
              </>
            ) : (
              <UIKitChatEmptyState
                title={query.trim() ? '没有匹配的历史消息' : '暂无历史消息'}
                description={query.trim() ? '换一个关键词试试，或者先加载更早的消息。' : undefined}
              />
            )}
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.rowWrap}>
            <UIKitMessageCard
              title={getSenderName(
                item,
                conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM
                  ? targetId
                  : undefined
              )}
              subtitle={new Date(item.createTime).toLocaleString()}
              preview={getHistoryPreview(item)}
              highlightedPreview={
                <UIKitChatHighlightText text={getHistoryPreview(item)} keyword={query.trim()} />
              }
              failed={
                item.sendingState === V2NIMMessageSendingState.V2NIM_MESSAGE_SENDING_STATE_FAILED
              }
              footer={
                <View style={styles.rowFooter}>
                  <UIKitActionPill
                    label="查看详情"
                    tone="primary"
                    onPress={() => {
                      openHistoryMessage(item).catch((error) => {
                        Alert.alert(
                          '打开失败',
                          error instanceof Error ? error.message : '当前消息无法打开'
                        )
                      })
                    }}
                  />
                </View>
              }
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
    marginBottom: 12
  },
  rowFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-start'
  }
})

export default ChatHistoryScreen
