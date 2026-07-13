import * as Clipboard from 'expo-clipboard'
import { Image } from 'expo-image'
import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { FlatList, Pressable, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { useAppTranslation } from '@/hooks/useAppTranslation'
import { useFileMessageOpener } from '@/hooks/useFileMessageOpener'
import {
  stopAllMessageAudioPlayback,
  useMessageAudioPlayback
} from '@/hooks/useMessageAudioPlayback'
import { useNavigationLock } from '@/hooks/useNavigationLock'
import { toast } from '@/src/NEUIKit/common/utils/toast'
import {
  UIKitActionSheet,
  UIKitAppellation,
  UIKitChatEmptyState,
  UIKitChatHeaderTitle,
  UIKitChatMessageBubble,
  UIKitIcon,
  UIKitUserAvatar
} from '@/src/NEUIKit/rn'
import { messageStore, nimStore } from '@/stores'
import { getDisplayErrorMessage } from '@/utils/error-message'
import { formatAndroidAlignedListTime } from '@/utils/list-time'
import { getMessageKey, isMergedForwardMessage } from '@/utils/messageForward'
import { ensureNetworkAvailable, getConfirmedOfflineMessage } from '@/utils/network'
import { V2NIMMessage, V2NIMMessageType } from '@/utils/nim-sdk'

const PINNED_MESSAGES_INITIAL_RENDER_COUNT = 6
const PINNED_MESSAGES_BATCH_RENDER_COUNT = 4
const PINNED_MESSAGES_WINDOW_SIZE = 9
const EMPTY_IMAGE = require('@/src/NEUIKit/static/empty.png')

function getMessageSenderSnapshotName(message: V2NIMMessage) {
  const messageWithSenderName = message as V2NIMMessage & {
    senderName?: string
    fromNick?: string
    nickFromMsg?: string
  }

  return (
    messageWithSenderName.senderName ||
    messageWithSenderName.fromNick ||
    messageWithSenderName.nickFromMsg ||
    ''
  )
}

function canCopyPinnedMessage(message: V2NIMMessage) {
  return message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_TEXT && !!message.text?.trim()
}

function canForwardPinnedMessage(message: V2NIMMessage) {
  return message.messageType !== V2NIMMessageType.V2NIM_MESSAGE_TYPE_AUDIO
}

function getPinnedMessageListKey(message: V2NIMMessage) {
  return (
    getMessageKey(message) ||
    `${message.conversationId}:${message.senderId || ''}:${message.receiverId || ''}:${
      message.createTime || 0
    }`
  )
}

function getOpenPinnedMessageErrorMessage(error: unknown, fallback: string) {
  return getDisplayErrorMessage(error, fallback)
}

const PinnedMessagesScreen = observer(() => {
  const { t } = useAppTranslation()
  const { runWithNavigationLock } = useNavigationLock()
  const { conversationId } = useLocalSearchParams<{ conversationId?: string }>()
  const resolvedConversationId = typeof conversationId === 'string' ? conversationId : ''
  const currentUserId = nimStore.getLoginUser()
  const conversationType =
    nimStore.nim?.V2NIMConversationIdUtil.parseConversationType(resolvedConversationId)
  const targetId =
    nimStore.nim?.V2NIMConversationIdUtil.parseConversationTargetId(resolvedConversationId)
  const [loading, setLoading] = useState(false)
  const [loadFailed, setLoadFailed] = useState(false)
  const [activeMenuMessageId, setActiveMenuMessageId] = useState<string | null>(null)
  const { playingAudioMessageId, playAudioMessage } = useMessageAudioPlayback({
    playFailedTitle: t('chatAudioPlayFailedTitle' as never),
    unavailable: t('chatAudioUnavailable' as never),
    playFailed: t('chatAudioPlayFailed' as never)
  })
  const { downloadingFileIds, downloadedFileMap, fileDownloadProgressMap, openFileMessage } =
    useFileMessageOpener()

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
      toast.alert(
        t('commonLoadingFailed' as never),
        getDisplayErrorMessage(error, t('pinnedMessagesLoadFailed' as never))
      )
    } finally {
      setLoading(false)
    }
  }, [currentUserId, resolvedConversationId, t])

  useEffect(() => {
    loadPinnedMessages().catch(() => undefined)
  }, [currentUserId, loadPinnedMessages])

  useFocusEffect(
    useCallback(() => {
      return () => {
        stopAllMessageAudioPlayback()
      }
    }, [])
  )

  const pinnedMessages = messageStore.getPinnedMessages(resolvedConversationId)
  const activeMenuMessage = useMemo(
    () =>
      activeMenuMessageId
        ? pinnedMessages.find(
            (message) => getPinnedMessageListKey(message) === activeMenuMessageId
          ) || null
        : null,
    [activeMenuMessageId, pinnedMessages]
  )

  const openPinnedMessage = async (message: V2NIMMessage) => {
    if (isMergedForwardMessage(message)) {
      runWithNavigationLock(() => {
        router.push({
          pathname: '/chat/merged-forward-detail',
          params: {
            conversationId: message.conversationId,
            messageId: getMessageKey(message)
          }
        } as never)
      })
      return
    }

    if (
      message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_TEXT ||
      message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_CUSTOM
    ) {
      runWithNavigationLock(() => {
        router.push({
          pathname: '/chat/message-preview',
          params: {
            conversationId: message.conversationId,
            messageId: getMessageKey(message),
            source: 'pinned'
          }
        } as never)
      })
      return
    }

    if (
      message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_IMAGE ||
      message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_VIDEO
    ) {
      runWithNavigationLock(() => {
        router.push({
          pathname: '/chat/media-viewer',
          params: {
            conversationId: message.conversationId,
            messageId: getMessageKey(message),
            type:
              message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_IMAGE ? 'image' : 'video'
          }
        } as never)
      })
      return
    }

    if (message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_LOCATION) {
      runWithNavigationLock(() => {
        router.push({
          pathname: '/chat/location-detail',
          params: {
            conversationId: message.conversationId,
            messageId: getMessageKey(message)
          }
        } as never)
      })
      return
    }

    if (message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_FILE) {
      await openFileMessage(message)
      return
    }

    if (message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_AUDIO) {
      await playAudioMessage(message)
      return
    }

    runWithNavigationLock(() => {
      router.push({
        pathname: '/chat/message-preview',
        params: {
          conversationId: message.conversationId,
          messageId: getMessageKey(message),
          source: 'pinned'
        }
      } as never)
    })
  }

  const handleCopyPinnedMessage = async (message: V2NIMMessage) => {
    if (!canCopyPinnedMessage(message)) {
      return
    }

    const content = message.text?.trim() || ''
    await Clipboard.setStringAsync(content)
    setActiveMenuMessageId(null)
    toast.alert(t('copySuccess' as never))
  }

  const handleForwardPinnedMessage = async (message: V2NIMMessage) => {
    setActiveMenuMessageId(null)
    try {
      await ensureNetworkAvailable()
    } catch {
      toast.alert(
        t('forwardFailedTitle' as never),
        (await getConfirmedOfflineMessage()) || t('commonNetworkUnavailable' as never)
      )
      return
    }

    runWithNavigationLock(() => {
      router.push({
        pathname: '/chat/forward',
        params: {
          conversationId: message.conversationId,
          messageId: getMessageKey(message)
        }
      } as never)
    })
  }

  const handleUnpinMessage = async (message: V2NIMMessage) => {
    setActiveMenuMessageId(null)
    try {
      await ensureNetworkAvailable()
      await messageStore.toggleMessagePin(message)
    } catch (error) {
      const offlineMessage = await getConfirmedOfflineMessage()
      toast.alert(
        t('pinnedMessagesUnpinFailed' as never),
        offlineMessage || getDisplayErrorMessage(error, t('commonRetryLater' as never))
      )
    }
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: () => <UIKitChatHeaderTitle title={t('pinnedMessagesTitle' as never)} />,
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#F3F6FB' }
        }}
      />

      <FlatList
        data={pinnedMessages}
        keyExtractor={(item) => getPinnedMessageListKey(item)}
        contentContainerStyle={styles.listContent}
        removeClippedSubviews={false}
        initialNumToRender={PINNED_MESSAGES_INITIAL_RENDER_COUNT}
        maxToRenderPerBatch={PINNED_MESSAGES_BATCH_RENDER_COUNT}
        windowSize={PINNED_MESSAGES_WINDOW_SIZE}
        updateCellsBatchingPeriod={32}
        ListEmptyComponent={
          loading ? (
            <UIKitChatEmptyState
              title={t('pinnedMessagesLoading' as never)}
              description={t('pinnedMessagesSyncingDescription' as never)}
            />
          ) : loadFailed ? (
            <UIKitChatEmptyState
              title={t('pinnedMessagesLoadFailed' as never)}
              actionLabel={t('commonRetry' as never)}
              onActionPress={() => {
                loadPinnedMessages().catch(() => undefined)
              }}
            />
          ) : (
            <View style={styles.emptyState}>
              <Image source={EMPTY_IMAGE} style={styles.emptyImage} contentFit="contain" />
              <ThemedText style={styles.emptyTitle}>{t('pinnedMessagesEmpty' as never)}</ThemedText>
            </View>
          )
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <UIKitUserAvatar
                account={item.senderId}
                teamId={item.conversationType === 2 ? item.receiverId : undefined}
                size={52}
              />
              <View style={styles.headerMeta}>
                <UIKitAppellation
                  account={item.senderId}
                  teamId={item.conversationType === 2 ? item.receiverId : undefined}
                  nickFromMsg={getMessageSenderSnapshotName(item)}
                  style={styles.senderName}
                />
                <ThemedText style={styles.messageTimeText}>
                  {formatAndroidAlignedListTime(item.createTime)}
                </ThemedText>
              </View>
              <Pressable
                accessibilityRole="button"
                hitSlop={10}
                style={styles.moreButton}
                onPress={() => setActiveMenuMessageId(getPinnedMessageListKey(item))}
              >
                <UIKitIcon type="icon-more" size={24} tintColor="#6F6F6F" />
              </Pressable>
            </View>

            <View style={styles.divider} />

            <Pressable
              style={styles.previewArea}
              onPress={() => {
                openPinnedMessage(item).catch((error) => {
                  toast.alert(
                    t('commonOpenFailed' as never),
                    getOpenPinnedMessageErrorMessage(
                      error,
                      t('commonMessageUnavailableOpen' as never)
                    )
                  )
                })
              }}
            >
              <UIKitChatMessageBubble
                message={item}
                currentUserId={currentUserId}
                conversationId={resolvedConversationId}
                conversationType={conversationType}
                targetId={targetId}
                onLongPress={() => undefined}
                onPressMessage={(message) => {
                  openPinnedMessage(message).catch((error) => {
                    toast.alert(
                      t('commonOpenFailed' as never),
                      getOpenPinnedMessageErrorMessage(
                        error,
                        t('commonMessageUnavailableOpen' as never)
                      )
                    )
                  })
                }}
                onPressReplyMessage={(message) => {
                  openPinnedMessage(message).catch((error) => {
                    toast.alert(
                      t('commonOpenFailed' as never),
                      getOpenPinnedMessageErrorMessage(
                        error,
                        t('commonMessageUnavailableOpen' as never)
                      )
                    )
                  })
                }}
                onReeditMessage={() => undefined}
                reeditHidden
                onRetry={() => undefined}
                downloadingVideoIds={[]}
                downloadedVideoMap={{}}
                downloadingFileIds={downloadingFileIds}
                downloadedFileMap={downloadedFileMap}
                fileDownloadProgressMap={fileDownloadProgressMap}
                playingAudioMessageId={playingAudioMessageId}
                selectionMode={false}
                selected={false}
                selectable={false}
                onToggleSelect={() => undefined}
                showReadReceipt={false}
                readOnly
                hideIdentity
                hideReplyPreview
                richTextNumberOfLines={3}
              />
            </Pressable>
          </View>
        )}
      />

      <UIKitActionSheet
        visible={!!activeMenuMessage}
        actions={
          activeMenuMessage
            ? [
                {
                  label: t('unpinText' as never),
                  onPress: () => {
                    handleUnpinMessage(activeMenuMessage).catch(() => undefined)
                  }
                },
                ...(canCopyPinnedMessage(activeMenuMessage)
                  ? [
                      {
                        label: t('copyText' as never),
                        onPress: () => {
                          handleCopyPinnedMessage(activeMenuMessage).catch((error) => {
                            toast.alert(
                              t('copyFailed' as never),
                              getDisplayErrorMessage(error, t('pinnedMessagesCopyFailed' as never))
                            )
                          })
                        }
                      }
                    ]
                  : []),
                ...(canForwardPinnedMessage(activeMenuMessage)
                  ? [
                      {
                        label: t('forwardText' as never),
                        onPress: () => {
                          handleForwardPinnedMessage(activeMenuMessage).catch(() => undefined)
                        }
                      }
                    ]
                  : [])
              ]
            : []
        }
        onClose={() => setActiveMenuMessageId(null)}
      />
    </ThemedView>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F6FB'
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 56
  },
  emptyImage: {
    width: 160,
    height: 120,
    marginBottom: 12
  },
  emptyTitle: {
    color: '#333333',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600'
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 36,
    gap: 16
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 22
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerMeta: {
    flex: 1,
    marginLeft: 16,
    minWidth: 0
  },
  senderName: {
    color: '#2F3135',
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '500'
  },
  messageTimeText: {
    marginTop: 4,
    color: '#A3A6AC',
    fontSize: 14,
    lineHeight: 20
  },
  moreButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E8ECF2',
    marginTop: 18,
    marginBottom: 22
  },
  previewArea: {
    alignSelf: 'stretch'
  }
})

export default PinnedMessagesScreen
