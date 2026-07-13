import * as Clipboard from 'expo-clipboard'
import { Image } from 'expo-image'
import { router, Stack, useFocusEffect } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useState } from 'react'
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
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
  UIKitChatHeaderTitle,
  UIKitChatMessageBubble,
  UIKitChatRichText,
  UIKitIcon,
  UIKitPage,
  UIKitUserAvatar
} from '@/src/NEUIKit/rn'
import {
  collectionStore,
  conversationStore,
  forwardStore,
  nimStore,
  teamStore,
  userStore
} from '@/stores'
import { getDisplayErrorMessage } from '@/utils/error-message'
import { formatAndroidAlignedListTime } from '@/utils/list-time'
import { getImageRenderSource, getVideoRenderSource } from '@/utils/media-source'
import {
  getMessageKey,
  isMergedForwardMessage,
  parseMergedForwardPayload,
  parseStandardMergedForwardData
} from '@/utils/messageForward'
import { ensureNetworkAvailable, getConfirmedOfflineMessage } from '@/utils/network'
import {
  V2NIMConversationType,
  V2NIMMessage,
  V2NIMMessageImageAttachment,
  V2NIMMessageLocationAttachment,
  V2NIMMessageType,
  V2NIMMessageVideoAttachment
} from '@/utils/nim-sdk'

const COLLECTION_INITIAL_RENDER_COUNT = 6
const COLLECTION_BATCH_RENDER_COUNT = 4
const COLLECTION_WINDOW_SIZE = 6
const EMPTY_IMAGE = require('@/src/NEUIKit/static/empty.png')

function getCollectionSenderSnapshotName(message: V2NIMMessage) {
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

function getCollectionConversationType(message?: V2NIMMessage | null, conversationId = '') {
  if (message?.conversationType) {
    return message.conversationType
  }

  if (!conversationId) {
    return undefined
  }

  try {
    return nimStore.nim?.V2NIMConversationIdUtil.parseConversationType(conversationId)
  } catch {
    const typeToken = conversationId.split('|')[0]?.toLowerCase()

    if (typeToken === 'team') {
      return V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM
    }

    if (typeToken === 'p2p') {
      return V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P
    }

    return undefined
  }
}

function getConversationTargetId(conversationId: string) {
  if (!conversationId) {
    return ''
  }

  try {
    return nimStore.nim?.V2NIMConversationIdUtil.parseConversationTargetId(conversationId) || ''
  } catch {
    return conversationId.split('|')[1] || ''
  }
}

function getPreviewTone(messageType?: number) {
  switch (messageType) {
    case V2NIMMessageType.V2NIM_MESSAGE_TYPE_IMAGE:
      return { badge: 'collectionImageBadge', helper: 'collectionImageHelper' }
    case V2NIMMessageType.V2NIM_MESSAGE_TYPE_VIDEO:
      return { badge: 'collectionVideoBadge', helper: 'collectionVideoHelper' }
    case V2NIMMessageType.V2NIM_MESSAGE_TYPE_FILE:
      return { badge: 'collectionFileBadge', helper: 'collectionFileHelper' }
    case V2NIMMessageType.V2NIM_MESSAGE_TYPE_LOCATION:
      return { badge: 'collectionLocationBadge', helper: 'collectionLocationHelper' }
    default:
      return { badge: '', helper: '' }
  }
}

const CollectionScreen = observer(() => {
  const { t } = useAppTranslation()
  const tWithFallback = (
    key: Parameters<typeof t>[0],
    fallback: string,
    params?: Parameters<typeof t>[1]
  ) => {
    const value = t(key, params)
    return value === key ? fallback : value
  }
  const { runWithNavigationLock } = useNavigationLock()
  const [resolvingId, setResolvingId] = useState<string | null>(null)
  const [activeMenuCollectionId, setActiveMenuCollectionId] = useState<string | null>(null)
  const [collectionMessages, setCollectionMessages] = useState<Record<string, V2NIMMessage | null>>(
    {}
  )
  const [loadFailed, setLoadFailed] = useState(false)
  const { playingAudioMessageId, playAudioMessage } = useMessageAudioPlayback({
    playFailedTitle: t('chatAudioPlayFailedTitle'),
    unavailable: t('chatAudioUnavailable'),
    playFailed: t('chatAudioPlayFailed')
  })
  const { downloadingFileIds, downloadedFileMap, fileDownloadProgressMap, openFileMessage } =
    useFileMessageOpener()

  const loadCollections = useCallback(async () => {
    setLoadFailed(false)

    try {
      const collections = await collectionStore.refreshCollections()
      const entries = await Promise.all(
        collections.map(async (collection) => {
          try {
            const message = await collectionStore.getCollectionMessage(collection)
            return [collection.collectionId, message] as const
          } catch {
            return [collection.collectionId, null] as const
          }
        })
      )

      const messageMap = Object.fromEntries(entries) as Record<string, V2NIMMessage | null>
      setCollectionMessages(messageMap)
      const teamIds = Array.from(
        new Set(
          collections
            .map((collection) => {
              const message = messageMap[collection.collectionId]
              const payload = collectionStore.parseCollectionPayload(collection)
              const conversationId = message?.conversationId || payload?.conversationId || ''
              const conversationType = getCollectionConversationType(message, conversationId)
              return conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM
                ? getConversationTargetId(conversationId)
                : ''
            })
            .filter(Boolean)
        )
      )
      if (teamIds.length > 0) {
        Promise.all(teamIds.map((teamId) => teamStore.loadMembers(teamId).catch(() => undefined)))
          .then(() => undefined)
          .catch(() => undefined)
      }
    } catch (error) {
      setLoadFailed(true)
      toast.alert(
        t('commonLoadingFailed'),
        getDisplayErrorMessage(error, t('collectionLoadFailed'))
      )
    }
  }, [t])

  useFocusEffect(
    useCallback(() => {
      loadCollections().catch(() => undefined)

      return () => {
        stopAllMessageAudioPlayback()
      }
    }, [loadCollections])
  )

  const activeMenuCollection = activeMenuCollectionId
    ? collectionStore.collections.find((item) => item.collectionId === activeMenuCollectionId) ||
      null
    : null
  const activeMenuPayload = activeMenuCollection
    ? collectionStore.parseCollectionPayload(activeMenuCollection)
    : null
  const activeMenuMessage = activeMenuCollection
    ? collectionMessages[activeMenuCollection.collectionId] || null
    : null
  const activeMenuMessageType = activeMenuMessage?.messageType ?? activeMenuPayload?.messageType
  const activeMenuCopyText =
    activeMenuMessageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_TEXT
      ? activeMenuMessage?.text?.trim() || activeMenuPayload?.preview?.trim() || ''
      : ''
  const activeMenuCanCopy = !!activeMenuCopyText
  const activeMenuCanForward = activeMenuMessageType !== V2NIMMessageType.V2NIM_MESSAGE_TYPE_AUDIO

  const openCollectedMessage = async (message: V2NIMMessage) => {
    if (isMergedForwardMessage(message)) {
      const mergedPayload = parseMergedForwardPayload(message)
      const standardData = parseStandardMergedForwardData(message)

      runWithNavigationLock(() => {
        router.push({
          pathname: '/chat/merged-forward-detail',
          params: mergedPayload
            ? {
                payload: JSON.stringify(mergedPayload)
              }
            : standardData
              ? {
                  standardData: JSON.stringify(standardData)
                }
              : {
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
            content: message.text || '',
            source: 'collection'
          }
        } as never)
      })
      return
    }

    if (
      message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_IMAGE ||
      message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_VIDEO
    ) {
      const attachment = message.attachment as
        | V2NIMMessageImageAttachment
        | V2NIMMessageVideoAttachment
        | undefined

      runWithNavigationLock(() => {
        const source =
          message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_IMAGE
            ? getImageRenderSource(attachment as V2NIMMessageImageAttachment | undefined)
            : getVideoRenderSource(attachment as V2NIMMessageVideoAttachment | undefined)

        router.push({
          pathname: '/chat/media-viewer',
          params: {
            conversationId: message.conversationId,
            messageId: getMessageKey(message),
            uri: source,
            type:
              message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_IMAGE ? 'image' : 'video'
          }
        } as never)
      })
      return
    }

    if (message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_LOCATION) {
      const attachment = message.attachment as V2NIMMessageLocationAttachment | undefined

      runWithNavigationLock(() => {
        router.push({
          pathname: '/chat/location-detail',
          params: {
            conversationId: message.conversationId,
            messageId: getMessageKey(message),
            address: attachment?.address || '',
            latitude: `${attachment?.latitude || 0}`,
            longitude: `${attachment?.longitude || 0}`
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
          source: 'collection'
        }
      } as never)
    })
  }

  return (
    <UIKitPage style={styles.page}>
      <Stack.Screen
        options={{
          headerTitle: () => <UIKitChatHeaderTitle title={t('collectionTitle')} />,
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#F3F6FB' }
        }}
      />

      <FlatList
        data={collectionStore.collections}
        keyExtractor={(item) => item.collectionId}
        contentContainerStyle={styles.listContent}
        removeClippedSubviews
        initialNumToRender={COLLECTION_INITIAL_RENDER_COUNT}
        maxToRenderPerBatch={COLLECTION_BATCH_RENDER_COUNT}
        windowSize={COLLECTION_WINDOW_SIZE}
        updateCellsBatchingPeriod={32}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            {collectionStore.loading ? (
              <ActivityIndicator color="#337EFF" />
            ) : loadFailed ? (
              <>
                <ThemedText style={styles.emptyTitle}>{t('collectionLoadFailed')}</ThemedText>
                <Pressable
                  style={styles.retryButton}
                  onPress={() => loadCollections().catch(() => undefined)}
                >
                  <ThemedText style={styles.retryButtonText}>{t('commonRetry')}</ThemedText>
                </Pressable>
              </>
            ) : (
              <View style={styles.emptyState}>
                <Image source={EMPTY_IMAGE} style={styles.emptyImage} contentFit="contain" />
                <ThemedText style={styles.emptyTitle}>{t('collectionEmptyTitle')}</ThemedText>
              </View>
            )}
          </View>
        }
        renderItem={({ item }) => {
          const payload = collectionStore.parseCollectionPayload(item)
          const message = collectionMessages[item.collectionId]
          const senderAccountId = message?.senderId || payload?.senderId || ''
          const senderSnapshotName = message ? getCollectionSenderSnapshotName(message) : ''
          const effectiveConversationId = message?.conversationId || payload?.conversationId || ''
          const effectiveConversationType = getCollectionConversationType(
            message,
            effectiveConversationId
          )
          const teamId =
            effectiveConversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM
              ? getConversationTargetId(effectiveConversationId)
              : ''
          const senderName =
            collectionStore.getCollectionSenderName(
              message,
              payload?.senderName || senderSnapshotName,
              {
                senderId: senderAccountId,
                teamId
              }
            ) ||
            senderAccountId ||
            t('collectionUnknownSender')
          const senderAvatar = collectionStore.getCollectionSenderAvatar(message, payload?.avatar)
          const sourceConversation = payload?.conversationId
            ? conversationStore.getConversation(payload.conversationId)
            : null
          const sourceLabel =
            payload?.conversationName ||
            collectionStore.getCollectionConversationName(message) ||
            sourceConversation?.name ||
            (payload?.senderId ? userStore.getDisplayName(payload.senderId) : '') ||
            (message?.senderId ? userStore.getDisplayName(message.senderId) : '') ||
            payload?.conversationId ||
            message?.conversationId ||
            t('collectionUnknownConversation')
          const sourceConversationType = getCollectionConversationType(
            message,
            payload?.conversationId || message?.conversationId || ''
          )
          const sourceText =
            sourceConversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P
              ? t('collectionP2PSourcePrefix', { name: sourceLabel })
              : t('collectionTeamSourcePrefix', { name: sourceLabel })
          const previewTone = getPreviewTone(payload?.messageType)
          const messageConversationType = message
            ? nimStore.nim?.V2NIMConversationIdUtil.parseConversationType(message.conversationId)
            : undefined
          const messageTargetId = message
            ? nimStore.nim?.V2NIMConversationIdUtil.parseConversationTargetId(
                message.conversationId
              )
            : undefined

          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <UIKitUserAvatar account={senderAccountId} avatar={senderAvatar} size={52} />
                <View style={styles.headerMeta}>
                  <ThemedText style={styles.senderName} numberOfLines={1}>
                    {senderName}
                  </ThemedText>
                  <ThemedText style={styles.sourceText} numberOfLines={1}>
                    {sourceText}
                  </ThemedText>
                </View>
                <Pressable
                  accessibilityRole="button"
                  hitSlop={10}
                  style={styles.moreButton}
                  onPress={() => setActiveMenuCollectionId(item.collectionId)}
                >
                  <UIKitIcon type="icon-more" size={24} tintColor="#6F6F6F" />
                </Pressable>
              </View>

              <View style={styles.divider} />

              <Pressable
                style={styles.previewArea}
                disabled={resolvingId === item.collectionId}
                onPress={async () => {
                  try {
                    await ensureNetworkAvailable()
                    setResolvingId(item.collectionId)
                    let resolvedMessage = message

                    if (!resolvedMessage) {
                      resolvedMessage = await collectionStore.getCollectionMessage(item)
                    }

                    if (resolvedMessage) {
                      await openCollectedMessage(resolvedMessage)
                      return
                    }

                    if (
                      payload?.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_TEXT ||
                      payload?.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_CUSTOM
                    ) {
                      runWithNavigationLock(() => {
                        router.push({
                          pathname: '/chat/message-preview',
                          params: {
                            conversationId: payload?.conversationId || '',
                            messageId: '',
                            content: payload?.preview || '',
                            source: 'collection'
                          }
                        } as never)
                      })
                      return
                    }

                    if (
                      payload?.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_IMAGE ||
                      payload?.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_VIDEO ||
                      payload?.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_FILE ||
                      payload?.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_LOCATION
                    ) {
                      toast.alert(
                        t('mediaViewerOpenFailedTitle'),
                        t('collectionOriginalMessageUnavailable')
                      )
                      return
                    }
                  } catch (error) {
                    toast.alert(
                      t('mediaViewerOpenFailedTitle'),
                      getDisplayErrorMessage(error, t('collectionOriginalMessageUnavailable'))
                    )
                  } finally {
                    setResolvingId(null)
                  }
                }}
              >
                {message ? (
                  <UIKitChatMessageBubble
                    message={message}
                    currentUserId={nimStore.getLoginUser()}
                    conversationId={message.conversationId}
                    conversationType={messageConversationType}
                    targetId={messageTargetId}
                    onLongPress={() => undefined}
                    onPressMessage={openCollectedMessage}
                    onPressReplyMessage={openCollectedMessage}
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
                    ignoreRevokedState
                    hideIdentity
                    hideReplyPreview
                    richTextNumberOfLines={3}
                  />
                ) : (
                  <>
                    {previewTone.badge ? (
                      <View style={styles.previewBadge}>
                        <ThemedText style={styles.previewBadgeText}>
                          {t(previewTone.badge as never)}
                        </ThemedText>
                      </View>
                    ) : null}
                    <UIKitChatRichText
                      text={
                        payload?.preview ||
                        (previewTone.helper ? t(previewTone.helper as never) : '') ||
                        t('collectionPreviewFallback')
                      }
                      textStyle={[
                        styles.previewText,
                        previewTone.badge ? styles.previewTextCompact : null
                      ]}
                      numberOfLines={previewTone.badge ? 2 : 4}
                      ellipsizeMode="tail"
                      lineHeight={previewTone.badge ? 28 : 32}
                    />
                  </>
                )}
              </Pressable>

              <View style={styles.footer}>
                <ThemedText style={styles.messageTimeText}>
                  {formatAndroidAlignedListTime(item.createTime)}
                </ThemedText>
              </View>
            </View>
          )
        }}
      />

      <UIKitActionSheet
        visible={!!activeMenuCollection}
        actions={
          activeMenuCollection
            ? [
                ...(activeMenuCanCopy
                  ? [
                      {
                        label: t('chatActionCopy' as never),
                        onPress: async () => {
                          try {
                            await Clipboard.setStringAsync(activeMenuCopyText)
                            setActiveMenuCollectionId(null)
                            toast.alert(t('copySuccess' as never))
                          } catch {
                            toast.alert(t('messagePreviewCopyFailed' as never))
                          }
                        }
                      }
                    ]
                  : []),
                {
                  label: t('commonDelete'),
                  onPress: () => {
                    const collectionToDelete = activeMenuCollection

                    setActiveMenuCollectionId(null)
                    Alert.alert(
                      t('commonDelete'),
                      tWithFallback('collectionDeleteConfirm', t('collectionDeleteConfirm')),
                      [
                        {
                          text: t('actionCancel'),
                          style: 'cancel'
                        },
                        {
                          text: t('actionConfirm'),
                          onPress: async () => {
                            try {
                              await ensureNetworkAvailable()
                              await collectionStore.removeCollection(collectionToDelete)
                              toast.alert(
                                tWithFallback(
                                  'collectionDeleteSuccess',
                                  t('collectionDeleteSuccess')
                                )
                              )
                            } catch (error) {
                              const offlineMessage = await getConfirmedOfflineMessage()
                              toast.alert(
                                t('collectionRemoveFailed'),
                                offlineMessage ||
                                  getDisplayErrorMessage(error, t('commonRetryLater'))
                              )
                            }
                          }
                        }
                      ]
                    )
                  }
                },
                ...(activeMenuCanForward
                  ? [
                      {
                        label:
                          resolvingId === activeMenuCollection.collectionId
                            ? t('collectionProcessing')
                            : t('collectionForwardAction'),
                        onPress: async () => {
                          const collectionToForward = activeMenuCollection

                          setActiveMenuCollectionId(null)

                          try {
                            await ensureNetworkAvailable()
                            setResolvingId(collectionToForward.collectionId)
                            const message =
                              await collectionStore.getCollectionMessage(collectionToForward)

                            if (!message) {
                              toast.alert(t('forwardFailedTitle'), t('collectionResolveFailed'))
                              return
                            }

                            forwardStore.setSourceMessages(message.conversationId, [message])
                            runWithNavigationLock(() => {
                              router.push({
                                pathname: '/chat/forward',
                                params: {
                                  conversationId: message.conversationId,
                                  messageId: getMessageKey(message),
                                  source: 'collection'
                                }
                              } as never)
                            })
                          } catch (error) {
                            const offlineMessage = await getConfirmedOfflineMessage()
                            toast.alert(
                              t('forwardFailedTitle'),
                              offlineMessage ||
                                getDisplayErrorMessage(error, t('collectionResolveFailed'))
                            )
                          } finally {
                            setResolvingId(null)
                          }
                        }
                      }
                    ]
                  : [])
              ]
            : []
        }
        onClose={() => setActiveMenuCollectionId(null)}
      />
    </UIKitPage>
  )
})

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#F3F6FB'
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 36,
    gap: 16
  },
  emptyCard: {
    paddingVertical: 42,
    paddingHorizontal: 20,
    alignItems: 'center'
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyImage: {
    width: 160,
    height: 120,
    marginBottom: 12
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
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 18
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
  moreButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12
  },
  senderName: {
    color: '#2F3135',
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '500'
  },
  messageTimeText: {
    color: '#A3A6AC',
    fontSize: 14,
    lineHeight: 20
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E8ECF2',
    marginTop: 18,
    marginBottom: 22
  },
  previewArea: {
    alignSelf: 'stretch'
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
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#EEF2F7',
    marginTop: 16,
    paddingTop: 12,
    paddingBottom: 4
  },
  sourceText: {
    marginTop: 3,
    color: '#98A1AD',
    fontSize: 13,
    lineHeight: 18
  }
})

export default CollectionScreen
