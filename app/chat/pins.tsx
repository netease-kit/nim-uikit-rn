import { router, Stack, useLocalSearchParams } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useState } from 'react'
import { Alert, FlatList, Linking, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import {
  UIKitActionPill,
  UIKitChatEmptyState,
  UIKitChatHeaderTitle,
  UIKitMessageCard
} from '@/src/NEUIKit/rn'
import { messageStore, nimStore } from '@/stores'
import { getForwardPreview, getMessageKey, parseMergedForwardPayload } from '@/utils/messageForward'
import { ensureNetworkAvailable, NETWORK_UNAVAILABLE_MESSAGE } from '@/utils/network'
import { V2NIMMessage, V2NIMMessageType } from '@/utils/nim-sdk'

const PinnedMessagesScreen = observer(() => {
  const { conversationId } = useLocalSearchParams<{ conversationId?: string }>()
  const resolvedConversationId = typeof conversationId === 'string' ? conversationId : ''
  const currentUserId = nimStore.getLoginUser()
  const [loading, setLoading] = useState(false)
  const [loadFailed, setLoadFailed] = useState(false)

  const loadPinnedMessages = useCallback(async () => {
    if (!currentUserId || !resolvedConversationId) {
      return
    }

    setLoading(true)
    setLoadFailed(false)

    try {
      await messageStore.loadPinnedMessages(resolvedConversationId)
    } catch (error) {
      setLoadFailed(true)
      Alert.alert('加载失败', error instanceof Error ? error.message : '标记消息加载失败')
    } finally {
      setLoading(false)
    }
  }, [currentUserId, resolvedConversationId])

  useEffect(() => {
    loadPinnedMessages().catch(() => undefined)
  }, [currentUserId, loadPinnedMessages])

  const pinnedMessages = messageStore.getPinnedMessages(resolvedConversationId)

  const openPinnedMessage = async (message: V2NIMMessage) => {
    const mergedForwardPayload = parseMergedForwardPayload(message)

    if (mergedForwardPayload) {
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
          headerTitle: () => <UIKitChatHeaderTitle title="标记消息" />,
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#FFFFFF' }
        }}
      />

      <View style={styles.noticeCard}>
        <View style={styles.noticeAccent} />
        <View style={styles.noticeBody}>
          <View style={styles.noticeChip}>
            <ThemedView style={styles.noticeChipInner}>
              <ThemedText style={styles.noticeChipText}>已标记</ThemedText>
            </ThemedView>
          </View>
          <ThemedText style={styles.noticeText}>
            标记消息会在当前会话内长期保留，方便后续查找和转发。
          </ThemedText>
        </View>
      </View>

      <FlatList
        data={pinnedMessages}
        keyExtractor={(item) => getMessageKey(item)}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          loading ? (
            <UIKitChatEmptyState title="加载中..." description="正在同步当前会话的标记消息。" />
          ) : loadFailed ? (
            <UIKitChatEmptyState
              title="标记消息加载失败"
              actionLabel="重试"
              onActionPress={() => {
                loadPinnedMessages().catch(() => undefined)
              }}
            />
          ) : (
            <UIKitChatEmptyState
              title="暂无标记消息"
              description="在聊天页长按消息后，可以把重要内容标记到这里。"
            />
          )
        }
        renderItem={({ item }) => {
          const mergedPayload = parseMergedForwardPayload(item)

          return (
            <View style={styles.rowWrap}>
              <UIKitMessageCard
                title={new Date(item.createTime).toLocaleString()}
                subtitle={`消息 ID：${getMessageKey(item)}`}
                preview={mergedPayload ? mergedPayload.title : getForwardPreview(item)}
                footer={
                  <View style={styles.actionRow}>
                    <UIKitActionPill
                      label="查看原消息"
                      tone="primary"
                      onPress={() => {
                        openPinnedMessage(item).catch((error) => {
                          Alert.alert(
                            '打开失败',
                            error instanceof Error ? error.message : '当前消息无法打开'
                          )
                        })
                      }}
                    />
                    <UIKitActionPill
                      label="转发"
                      onPress={() =>
                        router.push({
                          pathname: '/chat/forward',
                          params: {
                            conversationId: item.conversationId,
                            messageId: getMessageKey(item)
                          }
                        } as never)
                      }
                    />
                    <UIKitActionPill
                      label="取消标记"
                      tone="danger"
                      onPress={async () => {
                        try {
                          await ensureNetworkAvailable()
                          await messageStore.toggleMessagePin(item)
                        } catch (error) {
                          Alert.alert(
                            '取消标记失败',
                            error instanceof Error ? error.message : NETWORK_UNAVAILABLE_MESSAGE
                          )
                        }
                      }}
                    />
                  </View>
                }
              />
            </View>
          )
        }}
      />
    </ThemedView>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB'
  },
  noticeCard: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 22,
    backgroundColor: '#FFF9DD',
    flexDirection: 'row',
    overflow: 'hidden'
  },
  noticeAccent: {
    width: 6,
    backgroundColor: '#B8C85E'
  },
  noticeBody: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14
  },
  noticeChip: {
    alignSelf: 'flex-start',
    marginBottom: 8
  },
  noticeChipInner: {
    borderRadius: 999,
    backgroundColor: '#EEF6D7',
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  noticeChipText: {
    color: '#6B8D2E',
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700'
  },
  noticeText: {
    color: '#68732E',
    fontSize: 13,
    lineHeight: 20
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24
  },
  rowWrap: {
    marginBottom: 12
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  }
})

export default PinnedMessagesScreen
