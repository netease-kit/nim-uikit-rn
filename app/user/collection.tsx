import { router, Stack } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Pressable,
  StyleSheet,
  View
} from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { UIKitPage } from '@/src/NEUIKit/rn'
import { collectionStore, conversationStore, userStore } from '@/stores'
import { getMessageKey, parseMergedForwardPayload } from '@/utils/messageForward'
import { ensureNetworkAvailable, NETWORK_UNAVAILABLE_MESSAGE } from '@/utils/network'
import { V2NIMMessage, V2NIMMessageType } from '@/utils/nim-sdk'

function getPreviewTone(messageType?: number) {
  switch (messageType) {
    case V2NIMMessageType.V2NIM_MESSAGE_TYPE_IMAGE:
      return { badge: '图片', helper: '图片消息预览' }
    case V2NIMMessageType.V2NIM_MESSAGE_TYPE_VIDEO:
      return { badge: '视频', helper: '视频消息预览' }
    case V2NIMMessageType.V2NIM_MESSAGE_TYPE_FILE:
      return { badge: '文件', helper: '文件消息预览' }
    case V2NIMMessageType.V2NIM_MESSAGE_TYPE_LOCATION:
      return { badge: '位置', helper: '位置消息预览' }
    default:
      return { badge: '', helper: '' }
  }
}

const CollectionScreen = observer(() => {
  const [resolvingId, setResolvingId] = useState<string | null>(null)
  const [loadFailed, setLoadFailed] = useState(false)

  const loadCollections = async () => {
    setLoadFailed(false)

    try {
      await collectionStore.refreshCollections()
    } catch (error) {
      setLoadFailed(true)
      Alert.alert('加载失败', error instanceof Error ? error.message : '收藏列表加载失败')
    }
  }

  useEffect(() => {
    loadCollections().catch(() => undefined)
  }, [])

  const openCollectedMessage = async (message: V2NIMMessage) => {
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
    <UIKitPage style={styles.page}>
      <Stack.Screen options={{ title: '收藏', headerTitleAlign: 'center' }} />

      <FlatList
        data={collectionStore.collections}
        keyExtractor={(item) => item.collectionId}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            {collectionStore.loading ? (
              <ActivityIndicator color="#337EFF" />
            ) : loadFailed ? (
              <>
                <ThemedText style={styles.emptyTitle}>收藏列表加载失败</ThemedText>
                <Pressable
                  style={styles.retryButton}
                  onPress={() => loadCollections().catch(() => undefined)}
                >
                  <ThemedText style={styles.retryButtonText}>重试</ThemedText>
                </Pressable>
              </>
            ) : (
              <>
                <ThemedText style={styles.emptyTitle}>暂无收藏</ThemedText>
                <ThemedText style={styles.emptySubtitle}>收藏的消息会显示在这里</ThemedText>
              </>
            )}
          </View>
        }
        renderItem={({ item }) => {
          const payload = collectionStore.parseCollectionPayload(item)
          const sourceConversation = payload?.conversationId
            ? conversationStore.getConversation(payload.conversationId)
            : null
          const sourceLabel =
            sourceConversation?.name ||
            (payload?.senderId ? userStore.getDisplayName(payload.senderId) : '') ||
            payload?.conversationId ||
            '未知会话'
          const previewTone = getPreviewTone(payload?.messageType)

          return (
            <View style={styles.card}>
              <Pressable
                style={styles.previewArea}
                disabled={resolvingId === item.collectionId}
                onPress={async () => {
                  try {
                    await ensureNetworkAvailable()
                    setResolvingId(item.collectionId)
                    const message = await collectionStore.getCollectionMessage(item)

                    if (!message) {
                      Alert.alert('打开失败', '原消息不存在或尚未同步')
                      return
                    }

                    await openCollectedMessage(message)
                  } catch (error) {
                    Alert.alert(
                      '打开失败',
                      error instanceof Error ? error.message : NETWORK_UNAVAILABLE_MESSAGE
                    )
                  } finally {
                    setResolvingId(null)
                  }
                }}
              >
                {previewTone.badge ? (
                  <View style={styles.previewBadge}>
                    <ThemedText style={styles.previewBadgeText}>{previewTone.badge}</ThemedText>
                  </View>
                ) : null}
                <ThemedText
                  style={[styles.previewText, previewTone.badge ? styles.previewTextCompact : null]}
                  numberOfLines={previewTone.badge ? 2 : 4}
                >
                  {payload?.preview || previewTone.helper || '收藏消息'}
                </ThemedText>
                <ThemedText style={styles.previewMeta}>
                  {userStore.getDisplayName(payload?.senderId || '') || '未知发送者'}{' '}
                  {new Date(item.createTime).toLocaleString()}
                </ThemedText>
              </Pressable>

              <View style={styles.footer}>
                <ThemedText style={styles.sourceText}>来自 {sourceLabel}</ThemedText>
                <View style={styles.actions}>
                  <Pressable
                    style={styles.secondaryButton}
                    onPress={async () => {
                      try {
                        await ensureNetworkAvailable()
                        await collectionStore.removeCollection(item)
                      } catch (error) {
                        Alert.alert(
                          '取消收藏失败',
                          error instanceof Error ? error.message : NETWORK_UNAVAILABLE_MESSAGE
                        )
                      }
                    }}
                  >
                    <ThemedText style={styles.secondaryButtonText}>取消收藏</ThemedText>
                  </Pressable>
                  <Pressable
                    style={styles.primaryButton}
                    disabled={resolvingId === item.collectionId}
                    onPress={async () => {
                      try {
                        await ensureNetworkAvailable()
                        setResolvingId(item.collectionId)
                        const message = await collectionStore.getCollectionMessage(item)

                        if (!message) {
                          Alert.alert('转发失败', '信息获取失败')
                          return
                        }

                        router.push({
                          pathname: '/chat/forward',
                          params: {
                            conversationId: message.conversationId,
                            messageId: message.messageClientId || message.messageServerId
                          }
                        } as never)
                      } catch (error) {
                        Alert.alert(
                          '转发失败',
                          error instanceof Error ? error.message : NETWORK_UNAVAILABLE_MESSAGE
                        )
                      } finally {
                        setResolvingId(null)
                      }
                    }}
                  >
                    <ThemedText style={styles.primaryButtonText}>
                      {resolvingId === item.collectionId ? '处理中...' : '转发'}
                    </ThemedText>
                  </Pressable>
                </View>
              </View>
            </View>
          )
        }}
      />
    </UIKitPage>
  )
})

const styles = StyleSheet.create({
  page: {
    flex: 1
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
    gap: 16
  },
  emptyCard: {
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    paddingVertical: 42,
    paddingHorizontal: 20,
    alignItems: 'center'
  },
  emptyTitle: {
    color: '#333333',
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600'
  },
  emptySubtitle: {
    marginTop: 8,
    color: '#98A1AD',
    fontSize: 14,
    lineHeight: 20
  },
  retryButton: {
    marginTop: 16,
    minHeight: 44,
    minWidth: 108,
    borderRadius: 22,
    backgroundColor: '#337EFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700'
  },
  card: {
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden'
  },
  previewArea: {
    minHeight: 160,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16
  },
  previewBadge: {
    alignSelf: 'flex-start',
    minHeight: 28,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: '#F4F6FA',
    alignItems: 'center',
    justifyContent: 'center'
  },
  previewBadgeText: {
    color: '#637082',
    fontSize: 13,
    lineHeight: 18
  },
  previewText: {
    color: '#333333',
    fontSize: 18,
    lineHeight: 32,
    fontWeight: '400'
  },
  previewTextCompact: {
    marginTop: 16,
    lineHeight: 28
  },
  previewMeta: {
    marginTop: 20,
    color: '#A6AFBB',
    fontSize: 14,
    lineHeight: 20
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#EEF2F7',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 18
  },
  sourceText: {
    color: '#98A1AD',
    fontSize: 13,
    lineHeight: 18
  },
  actions: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 10
  },
  secondaryButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 21,
    backgroundColor: '#F4F6FA',
    alignItems: 'center',
    justifyContent: 'center'
  },
  secondaryButtonText: {
    color: '#667281',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600'
  },
  primaryButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 21,
    backgroundColor: '#337EFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600'
  }
})

export default CollectionScreen
