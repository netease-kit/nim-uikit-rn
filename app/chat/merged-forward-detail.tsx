import * as FileSystem from 'expo-file-system/legacy'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React, { useEffect, useMemo, useState } from 'react'
import { Linking, Platform, ScrollView, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { useAppTranslation } from '@/hooks/useAppTranslation'
import { useFileMessageOpener } from '@/hooks/useFileMessageOpener'
import { toast } from '@/src/NEUIKit/common/utils/toast'
import {
  UIKitChatEmptyState,
  UIKitChatHeaderTitle,
  UIKitChatMessageBubble,
  UIKitUserAvatar
} from '@/src/NEUIKit/rn'
import { messageStore, nimStore } from '@/stores'
import { translateCurrentApp } from '@/utils/app-language'
import { getMergedForwardCallPreviewText, isCallMessage } from '@/utils/callMessage'
import { formatAndroidAlignedListTime } from '@/utils/list-time'
import { normalizeMediaRenderSource } from '@/utils/media-source'
import {
  getForwardPreview,
  getMergedForwardCacheUri,
  getMessageKey,
  MERGED_FORWARD_CUSTOM_TYPE,
  MERGED_FORWARD_SUBTYPE,
  MergedForwardItem,
  MergedForwardPayload,
  parseMergedForwardPayload,
  parseStandardMergedForwardData,
  sanitizeMergedForwardSerializedMessage,
  splitMergedForwardSerializedContent,
  StandardMergedForwardData
} from '@/utils/messageForward'
import {
  V2NIMConversationType,
  V2NIMMessage,
  V2NIMMessageSendingState,
  V2NIMMessageType
} from '@/utils/nim-sdk'

type MergedForwardDisplayMessage = V2NIMMessage & {
  subType?: number
  senderName?: string
  senderAvatar?: string
}

type DetailState = {
  loading: boolean
  payload: MergedForwardPayload | null
  error: string | null
}

const MERGED_MESSAGE_NICK_KEY = 'mergedMessageNickKey'
const MERGED_MESSAGE_AVATAR_KEY = 'mergedMessageAvatarKey'
const MERGED_FORWARD_DOWNLOAD_TIMEOUT_MS = 8000
const MERGED_FORWARD_LOAD_FAILED = 'mergedForwardFetchFailed'
const MERGED_FORWARD_DOWNLOAD_FAILED = 'mergedForwardDownloadFailed'

function rejectAfterTimeout(errorMessage: string, timeoutMs: number) {
  return new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
  })
}

async function downloadMergedForwardPayload(payloadUrl: string, cacheUri: string) {
  try {
    await Promise.race([
      FileSystem.downloadAsync(payloadUrl, cacheUri),
      rejectAfterTimeout(MERGED_FORWARD_DOWNLOAD_FAILED, MERGED_FORWARD_DOWNLOAD_TIMEOUT_MS)
    ])
  } catch (error) {
    try {
      const cacheInfo = await FileSystem.getInfoAsync(cacheUri)

      if (cacheInfo.exists) {
        await FileSystem.deleteAsync(cacheUri, { idempotent: true })
      }
    } catch {
      // Ignore cache cleanup failures; the caller will surface the download failure.
    }

    throw error
  }
}

function parseMergedForwardSenderExtension(message: V2NIMMessage) {
  try {
    const extension = JSON.parse(message.serverExtension || '{}') as Record<string, unknown>

    return {
      senderName:
        typeof extension[MERGED_MESSAGE_NICK_KEY] === 'string'
          ? (extension[MERGED_MESSAGE_NICK_KEY] as string)
          : '',
      senderAvatar:
        typeof extension[MERGED_MESSAGE_AVATAR_KEY] === 'string'
          ? (extension[MERGED_MESSAGE_AVATAR_KEY] as string)
          : ''
    }
  } catch {
    return {
      senderName: '',
      senderAvatar: ''
    }
  }
}

function createMergedDisplayMessage(item: MergedForwardItem, conversationId: string) {
  const attachment =
    item.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_CUSTOM
      ? item.mergedPayload
        ? {
            raw: JSON.stringify(item.mergedPayload)
          }
        : item.mergedForwardData
          ? {
              raw: JSON.stringify({
                type: MERGED_FORWARD_CUSTOM_TYPE,
                data: item.mergedForwardData
              })
            }
          : undefined
      : {
          name: item.attachmentName,
          ext: item.attachmentExt,
          url: item.attachmentUrl,
          path: item.attachmentUrl,
          size: item.attachmentSize,
          duration: item.attachmentDuration,
          durations: item.attachmentDurations,
          status: item.attachmentStatus,
          type: item.attachmentType,
          width: item.attachmentWidth,
          height: item.attachmentHeight,
          address: item.attachmentAddress,
          latitude: item.attachmentLatitude,
          longitude: item.attachmentLongitude
        }

  return {
    messageClientId: item.messageId,
    messageServerId: item.messageId,
    conversationId,
    senderId: item.senderId,
    receiverId: '',
    isSelf: item.senderId === nimStore.getLoginUser(),
    createTime: item.createTime,
    text: item.text || item.preview,
    messageType: item.messageType,
    subType: item.mergedPayload ? MERGED_FORWARD_SUBTYPE : undefined,
    attachment,
    sendingState: V2NIMMessageSendingState.V2NIM_MESSAGE_SENDING_STATE_SUCCEEDED,
    senderName: item.senderName,
    senderAvatar: item.senderAvatar
  } as MergedForwardDisplayMessage
}

function buildPayloadFromMessages(messages: V2NIMMessage[], fallbackTitle: string) {
  const sortedMessages = messages.slice().sort((left, right) => left.createTime - right.createTime)
  const items: MergedForwardItem[] = sortedMessages.map((message) => {
    const senderExtension = parseMergedForwardSenderExtension(message)
    const senderName =
      senderExtension.senderName ||
      (message as MergedForwardDisplayMessage).senderName ||
      message.senderId

    return {
      messageId: getMessageKey(message),
      senderId: message.senderId,
      senderName,
      senderAvatar:
        senderExtension.senderAvatar || (message as MergedForwardDisplayMessage).senderAvatar,
      createTime: message.createTime,
      messageType: message.messageType,
      preview: getForwardPreview(message, 'merged'),
      text: message.text,
      attachmentName: (message.attachment as { name?: string } | undefined)?.name,
      attachmentExt: (message.attachment as { ext?: string } | undefined)?.ext,
      attachmentUrl:
        (message.attachment as { url?: string; path?: string } | undefined)?.url ||
        (message.attachment as { url?: string; path?: string } | undefined)?.path,
      attachmentSize: (message.attachment as { size?: number } | undefined)?.size,
      attachmentDuration: (message.attachment as { duration?: number } | undefined)?.duration,
      attachmentDurations: (
        message.attachment as { durations?: { duration?: number }[] } | undefined
      )?.durations,
      attachmentStatus: (message.attachment as { status?: number | string } | undefined)?.status,
      attachmentType: (message.attachment as { type?: number | string } | undefined)?.type,
      attachmentWidth: (message.attachment as { width?: number } | undefined)?.width,
      attachmentHeight: (message.attachment as { height?: number } | undefined)?.height,
      attachmentAddress: (message.attachment as { address?: string } | undefined)?.address,
      attachmentLatitude: (message.attachment as { latitude?: number } | undefined)?.latitude,
      attachmentLongitude: (message.attachment as { longitude?: number } | undefined)?.longitude,
      mergedPayload: parseMergedForwardPayload(message) || undefined,
      mergedForwardData: parseStandardMergedForwardData(message) || undefined
    }
  })

  return {
    title: fallbackTitle,
    previewList: items.slice(0, 3).map((item) => `${item.senderName}: ${item.preview}`),
    nestedLevel: 1,
    messages: items
  } as MergedForwardPayload
}

async function loadStandardMergedForwardPayloadFromData(data: StandardMergedForwardData) {
  if (!data?.url) {
    return null
  }

  const payloadUrl = normalizeMediaRenderSource(data.url)
  if (!payloadUrl) {
    return null
  }

  const content =
    Platform.OS === 'web'
      ? await fetch(payloadUrl).then(async (response) => {
          if (!response.ok) {
            throw new Error(MERGED_FORWARD_DOWNLOAD_FAILED)
          }

          return response.text()
        })
      : await (async () => {
          const cacheUri = await getMergedForwardCacheUri({
            messageClientId: `${data.md5 || payloadUrl}`,
            messageServerId: `${data.md5 || payloadUrl}`
          })
          const cacheInfo = await FileSystem.getInfoAsync(cacheUri)

          if (!cacheInfo.exists) {
            await downloadMergedForwardPayload(payloadUrl, cacheUri)
          }

          return FileSystem.readAsStringAsync(cacheUri)
        })()
  const { serializedMessages } = splitMergedForwardSerializedContent(content)

  if (!serializedMessages.length || !nimStore.nim) {
    return null
  }

  const messages = serializedMessages
    .map((item) => {
      const serializedForCurrentPlatform =
        Platform.OS === 'android' ? sanitizeMergedForwardSerializedMessage(item) : item

      try {
        return nimStore.nim!.V2NIMMessageConverter.messageDeserialization(
          serializedForCurrentPlatform
        )
      } catch (error) {
        const fallback = sanitizeMergedForwardSerializedMessage(item)

        if (fallback === serializedForCurrentPlatform) {
          return null
        }

        try {
          return nimStore.nim!.V2NIMMessageConverter.messageDeserialization(fallback)
        } catch {
          console.warn('merged-forward-detail: skip invalid serialized message', error)
          return null
        }
      }
    })
    .filter(Boolean) as V2NIMMessage[]

  if (!messages.length) {
    return null
  }

  const title = data.sessionName
    ? `__MERGED_FORWARD_TITLE__${data.sessionName}`
    : '__MERGED_FORWARD_FALLBACK__'

  return buildPayloadFromMessages(messages, title)
}

async function loadStandardMergedForwardPayload(message: V2NIMMessage) {
  const data = parseStandardMergedForwardData(message)

  if (!data) {
    return null
  }

  return loadStandardMergedForwardPayloadFromData(data)
}

async function openMergedItem(item: MergedForwardItem) {
  if (item.mergedPayload) {
    router.push({
      pathname: '/chat/merged-forward-detail',
      params: {
        payload: JSON.stringify(item.mergedPayload)
      }
    } as never)
    return
  }

  if (item.mergedForwardData) {
    router.push({
      pathname: '/chat/merged-forward-detail',
      params: {
        standardData: JSON.stringify(item.mergedForwardData)
      }
    } as never)
    return
  }

  if (item.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_IMAGE && item.attachmentUrl) {
    router.push({
      pathname: '/chat/media-viewer',
      params: {
        uri: item.attachmentUrl,
        type: 'image',
        name: item.attachmentName || '',
        ext: item.attachmentExt || ''
      }
    } as never)
    return
  }

  if (item.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_VIDEO && item.attachmentUrl) {
    router.push({
      pathname: '/chat/media-viewer',
      params: {
        uri: item.attachmentUrl,
        type: 'video',
        name: item.attachmentName || '',
        ext: item.attachmentExt || ''
      }
    } as never)
    return
  }

  if (item.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_LOCATION) {
    router.push({
      pathname: '/chat/location-detail',
      params: {
        address: item.attachmentAddress,
        latitude: `${item.attachmentLatitude || 0}`,
        longitude: `${item.attachmentLongitude || 0}`
      }
    } as never)
    return
  }

  if (item.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_AUDIO && item.attachmentUrl) {
    const canOpen = await Linking.canOpenURL(item.attachmentUrl)

    if (!canOpen) {
      toast.alert(
        translateCurrentApp('mediaViewerOpenFailedTitle' as never),
        translateCurrentApp('mergedForwardAttachmentOpenUnsupported' as never)
      )
      return
    }

    await Linking.openURL(item.attachmentUrl)
  }
}

function shouldShowTimeDivider(previousTime: number | null, currentTime: number) {
  if (!previousTime) {
    return true
  }

  return currentTime - previousTime > 5 * 60 * 1000
}

const MergedForwardDetailScreen = observer(() => {
  const { t } = useAppTranslation()
  const {
    conversationId,
    messageId,
    payload: payloadParam,
    standardData: standardDataParam
  } = useLocalSearchParams<{
    conversationId?: string
    messageId?: string
    payload?: string
    standardData?: string
  }>()
  const [state, setState] = useState<DetailState>({
    loading: false,
    payload: null,
    error: null
  })
  const { downloadingFileIds, downloadedFileMap, fileDownloadProgressMap, openFileMessage } =
    useFileMessageOpener()

  const resolvedConversationId =
    typeof conversationId === 'string' ? conversationId : 'merged-forward-detail'
  const mergedMessage =
    typeof conversationId === 'string' && typeof messageId === 'string'
      ? messageStore.getMessageById(conversationId, messageId)
      : null

  const immediatePayload = useMemo(() => {
    if (typeof payloadParam === 'string' && payloadParam) {
      try {
        return JSON.parse(payloadParam) as MergedForwardPayload
      } catch {
        return null
      }
    }

    return mergedMessage ? parseMergedForwardPayload(mergedMessage) : null
  }, [mergedMessage, payloadParam])

  const standardForwardData = useMemo(() => {
    if (typeof standardDataParam !== 'string' || !standardDataParam) {
      return null
    }

    try {
      return JSON.parse(standardDataParam) as StandardMergedForwardData
    } catch {
      return null
    }
  }, [standardDataParam])

  const failAndGoBack = useMemo(() => {
    let handled = false

    return () => {
      if (handled) {
        return
      }

      handled = true
      toast.info(t('mergedForwardFetchFailed'))
      router.back()
    }
  }, [t])

  useEffect(() => {
    let cancelled = false

    if (immediatePayload) {
      setState({
        loading: false,
        payload: immediatePayload,
        error: null
      })
      return
    }

    if (standardForwardData) {
      setState((current) => ({
        ...current,
        loading: true,
        error: null
      }))

      loadStandardMergedForwardPayloadFromData(standardForwardData)
        .then((payload) => {
          if (cancelled) {
            return
          }

          setState({
            loading: false,
            payload,
            error: payload ? null : MERGED_FORWARD_LOAD_FAILED
          })

          if (!payload) {
            failAndGoBack()
          }
        })
        .catch((error) => {
          if (cancelled) {
            return
          }

          console.warn('merged-forward-detail: load standard data failed', error)
          setState({
            loading: false,
            payload: null,
            error: MERGED_FORWARD_LOAD_FAILED
          })
          failAndGoBack()
        })

      return () => {
        cancelled = true
      }
    }

    if (!mergedMessage) {
      setState({
        loading: false,
        payload: null,
        error: MERGED_FORWARD_LOAD_FAILED
      })
      failAndGoBack()
      return
    }

    setState((current) => ({
      ...current,
      loading: true,
      error: null
    }))

    loadStandardMergedForwardPayload(mergedMessage)
      .then((payload) => {
        if (cancelled) {
          return
        }

        setState({
          loading: false,
          payload,
          error: payload ? null : MERGED_FORWARD_LOAD_FAILED
        })

        if (!payload) {
          failAndGoBack()
        }
      })
      .catch((error) => {
        if (cancelled) {
          return
        }

        console.warn('merged-forward-detail: load message payload failed', error)
        setState({
          loading: false,
          payload: null,
          error: MERGED_FORWARD_LOAD_FAILED
        })
        failAndGoBack()
      })

    return () => {
      cancelled = true
    }
  }, [failAndGoBack, immediatePayload, mergedMessage, standardForwardData, t])

  const displayMessages = useMemo(() => {
    return (
      state.payload?.messages.map((item) => ({
        item,
        message: createMergedDisplayMessage(item, resolvedConversationId)
      })) || []
    )
  }, [resolvedConversationId, state.payload?.messages])
  const resolvedTitle = t('chatMergedForwardFooter')

  const handleItemPress = (item: MergedForwardItem, message: MergedForwardDisplayMessage) => {
    const openTask =
      item.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_FILE
        ? openFileMessage(message)
        : openMergedItem(item)

    openTask.catch((error) => {
      toast.alert(
        t('mediaViewerOpenFailedTitle'),
        error instanceof Error ? error.message : t('mergedForwardOpenMessageFailed')
      )
    })
  }

  const renderPlaceholderMessage = (
    item: MergedForwardItem,
    message: MergedForwardDisplayMessage
  ) => {
    const placeholderText =
      item.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_AUDIO
        ? translateCurrentApp('commonAudioMessage')
        : isCallMessage(message)
          ? getMergedForwardCallPreviewText(message)
          : item.preview

    return (
      <View style={styles.placeholderRow}>
        <View pointerEvents="none" style={styles.placeholderAvatarWrap}>
          <UIKitUserAvatar
            account={item.senderId}
            avatar={item.senderAvatar}
            fallbackLabel={item.senderName || item.senderId}
            size={42}
          />
        </View>
        <View style={styles.placeholderContent}>
          <ThemedText numberOfLines={1} style={styles.placeholderSenderName}>
            {item.senderName || item.senderId}
          </ThemedText>
          <View style={[styles.placeholderBubble, styles.placeholderBubbleOther]}>
            <ThemedText
              numberOfLines={1}
              style={[styles.placeholderText, styles.placeholderTextOther]}
            >
              {placeholderText}
            </ThemedText>
          </View>
        </View>
      </View>
    )
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: () => <UIKitChatHeaderTitle title={resolvedTitle} />,
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#FFFFFF' }
        }}
      />

      {state.loading ? (
        <View style={styles.loadingContainer}>
          <ThemedText style={styles.loadingText}>{t('mergedForwardLoading')}</ThemedText>
        </View>
      ) : !state.payload ? (
        <UIKitChatEmptyState
          title={t('mergedForwardNotFound')}
          description={state.error || t('mergedForwardUnavailableDescription')}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {displayMessages.map(({ item, message }, index) => {
            const previousTime = index > 0 ? state.payload!.messages[index - 1].createTime : null
            const showTimeDivider = shouldShowTimeDivider(previousTime, item.createTime)

            return (
              <View key={getMessageKey(message)}>
                {showTimeDivider ? (
                  <View style={styles.timeDivider}>
                    <ThemedText style={styles.timeDividerText}>
                      {formatAndroidAlignedListTime(item.createTime)}
                    </ThemedText>
                  </View>
                ) : null}
                {item.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_AUDIO ||
                item.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_CALL ? (
                  renderPlaceholderMessage(item, message)
                ) : (
                  <UIKitChatMessageBubble
                    message={message}
                    currentUserId={nimStore.getLoginUser()}
                    conversationId={resolvedConversationId}
                    conversationType={V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P}
                    targetId={item.senderId}
                    onLongPress={() => undefined}
                    onPressMessage={() => handleItemPress(item, message)}
                    onPressReplyMessage={() => undefined}
                    onReeditMessage={() => undefined}
                    reeditHidden
                    onRetry={() => undefined}
                    downloadingVideoIds={[]}
                    downloadedVideoMap={{}}
                    downloadingFileIds={downloadingFileIds}
                    downloadedFileMap={downloadedFileMap}
                    fileDownloadProgressMap={fileDownloadProgressMap}
                    selectionMode={false}
                    selected={false}
                    selectable={false}
                    onToggleSelect={() => undefined}
                    showReadReceipt={false}
                    readOnly
                    disableAvatarPress
                    senderNameOverride={item.senderName || item.senderId}
                    senderAvatarOverride={item.senderAvatar}
                  />
                )}
              </View>
            )
          })}
        </ScrollView>
      )}
    </ThemedView>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 8
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingText: {
    color: '#666666',
    fontSize: 14
  },
  timeDivider: {
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 16
  },
  timeDividerText: {
    color: '#999999',
    fontSize: 12
  },
  placeholderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18
  },
  placeholderAvatarWrap: {
    marginRight: 8
  },
  placeholderContent: {
    alignItems: 'flex-start',
    flexShrink: 1,
    maxWidth: '80%'
  },
  placeholderSenderName: {
    color: '#9098A3',
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 4,
    maxWidth: 220
  },
  placeholderBubble: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 20
  },
  placeholderBubbleOther: {
    backgroundColor: '#F2F5F8',
    borderTopLeftRadius: 8
  },
  placeholderText: {
    fontSize: 16,
    lineHeight: 24
  },
  placeholderTextOther: {
    color: '#263242'
  }
})

export default MergedForwardDetailScreen
