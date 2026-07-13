import { Ionicons } from '@expo/vector-icons'
import { Image as ExpoImage } from 'expo-image'
import * as MediaLibrary from 'expo-media-library'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { useVideoPlayer, VideoSource, VideoView } from 'expo-video'
import { observer } from 'mobx-react-lite'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  AppState,
  AppStateStatus,
  DeviceEventEmitter,
  FlatList,
  Image as RNImage,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { useAppTranslation } from '@/hooks/useAppTranslation'
import { toast } from '@/src/NEUIKit/common/utils/toast'
import { UIKitChatEmptyState } from '@/src/NEUIKit/rn'
import { messageStore } from '@/stores'
import { persistFileToLocal, resolveFileName } from '@/utils/fileTransfer'
import { getImageRenderSource, getVideoRenderSource } from '@/utils/media-source'
import { saveNativeMediaToLibrary } from '@/utils/native-media-library-saver'
import {
  V2NIMMessage,
  V2NIMMessageImageAttachment,
  V2NIMMessageType,
  V2NIMMessageVideoAttachment
} from '@/utils/nim-sdk'
import { ensureMediaLibrarySavePermission } from '@/utils/permissions'

const AUDIO_VIDEO_CALL_INTERRUPTION_EVENTS = [
  'nim-audio-video-call-started',
  'NIMAudioVideoCallStarted',
  'NIMAudioVideoCallInterrupted'
]
const loadedMediaViewerImageUris = new Set<string>()

function MediaViewerImage({
  uri,
  onLoadStart,
  onLoad,
  onError
}: {
  uri: string
  onLoadStart: () => void
  onLoad: () => void
  onError: () => void
}) {
  if (Platform.OS === 'android') {
    return (
      <RNImage
        source={{ uri }}
        style={styles.image}
        resizeMode="contain"
        fadeDuration={0}
        onLoadStart={onLoadStart}
        onLoad={onLoad}
        onError={onError}
      />
    )
  }

  return (
    <ExpoImage
      source={uri}
      style={styles.image}
      contentFit="contain"
      cachePolicy="memory-disk"
      transition={0}
      onLoadStart={onLoadStart}
      onLoad={onLoad}
      onError={onError}
    />
  )
}

function getImageSource(attachment?: V2NIMMessageImageAttachment | null) {
  return getImageRenderSource(attachment)
}

function getVideoSource(attachment?: V2NIMMessageVideoAttachment | null) {
  return getVideoRenderSource(attachment)
}

function getMessageSource(message: V2NIMMessage | null) {
  if (!message) {
    return ''
  }

  if (message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_IMAGE) {
    return getImageRenderSource(message.attachment as V2NIMMessageImageAttachment | undefined)
  }

  if (message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_VIDEO) {
    return getVideoRenderSource(message.attachment as V2NIMMessageVideoAttachment | undefined)
  }

  return ''
}

function getExtensionFromName(fileName?: string | null) {
  const normalizedName = fileName?.trim()
  const extensionMatch = normalizedName?.match(/\.([A-Za-z0-9]{1,12})$/)

  return extensionMatch?.[1]?.toLowerCase() || ''
}

function normalizeExtension(extension?: string | null) {
  return extension?.trim().replace(/^\./, '').toLowerCase() || ''
}

function getVideoSourceExtension(uri: string, name?: string, ext?: string) {
  return (
    normalizeExtension(ext) ||
    getExtensionFromName(name) ||
    getExtensionFromName(decodeURIComponent(uri.split('?')[0] || ''))
  )
}

function buildNativeVideoSource(uri: string, name?: string, ext?: string): VideoSource {
  const extension = getVideoSourceExtension(uri, name, ext)

  return {
    uri,
    contentType: 'progressive',
    metadata: {
      title: name || (extension ? `video.${extension}` : 'video')
    }
  }
}

const MediaViewerScreen = observer(() => {
  const { t } = useAppTranslation()
  const { conversationId, messageId, uri, type, name, ext, single } = useLocalSearchParams<{
    conversationId?: string
    messageId?: string
    uri?: string
    type?: string
    name?: string
    ext?: string
    single?: string
  }>()
  const resolvedConversationId = typeof conversationId === 'string' ? conversationId : ''
  const resolvedMessageId = typeof messageId === 'string' ? messageId : ''
  const resolvedUri = typeof uri === 'string' ? uri : ''
  const resolvedType = typeof type === 'string' ? type : ''
  const resolvedName = typeof name === 'string' ? name : ''
  const resolvedExt = typeof ext === 'string' ? ext : ''
  const singleMode = single === '1'
  const message = messageStore.getMessageById(resolvedConversationId, resolvedMessageId)
  const { width, height } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const imageListRef = useRef<FlatList<{ key: string; uri: string }>>(null)
  const [loadingImageUris, setLoadingImageUris] = useState<Record<string, boolean>>({})

  const conversationImages = useMemo(() => {
    if (singleMode || !resolvedConversationId || resolvedUri) {
      return []
    }

    return messageStore
      .getConversationMessages(resolvedConversationId)
      .list.filter((item) => item.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_IMAGE)
      .map((item) => ({
        key: item.messageClientId || item.messageServerId,
        uri: getMessageSource(item)
      }))
      .filter((item) => !!item.uri)
  }, [resolvedConversationId, resolvedUri, singleMode])
  const initialImageIndex = useMemo(() => {
    if (!conversationImages.length || !resolvedMessageId) {
      return 0
    }

    const index = conversationImages.findIndex((item) => item.key === resolvedMessageId)
    return index >= 0 ? index : 0
  }, [conversationImages, resolvedMessageId])
  const [imageIndex, setImageIndex] = useState(initialImageIndex)

  useEffect(() => {
    setImageIndex(initialImageIndex)
  }, [initialImageIndex])

  useEffect(() => {
    if (!conversationImages.length || initialImageIndex === 0) {
      return
    }

    const timer = setTimeout(() => {
      imageListRef.current?.scrollToIndex({
        index: initialImageIndex,
        animated: false
      })
    }, 0)

    return () => clearTimeout(timer)
  }, [conversationImages.length, initialImageIndex])

  const mediaSource =
    (message?.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_VIDEO || resolvedType === 'video'
      ? getVideoSource(message?.attachment as V2NIMMessageVideoAttachment | undefined)
      : getImageSource(message?.attachment as V2NIMMessageImageAttachment | undefined)) ||
    resolvedUri

  const saveMedia = async () => {
    if (!mediaSource) {
      toast.alert(t('mediaViewerSaveFailedTitle'), t('mediaViewerMissingMedia'))
      return
    }

    const imageAttachment = message?.attachment as V2NIMMessageImageAttachment | undefined
    const videoAttachment = message?.attachment as V2NIMMessageVideoAttachment | undefined
    const preferredName =
      message?.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_VIDEO || resolvedType === 'video'
        ? videoAttachment?.name || resolvedName
        : imageAttachment?.name || resolvedName
    const preferredNameExtension = getExtensionFromName(preferredName)
    const preferredExtension =
      message?.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_VIDEO || resolvedType === 'video'
        ? videoAttachment?.ext || resolvedExt || preferredNameExtension || 'mp4'
        : imageAttachment?.ext || resolvedExt || preferredNameExtension || 'jpg'
    const isVideo =
      message?.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_VIDEO || resolvedType === 'video'
    if (!(await ensureMediaLibrarySavePermission())) {
      return
    }

    try {
      const fileName = resolveFileName(mediaSource, preferredName, preferredExtension)
      const localUri = await persistFileToLocal(mediaSource, fileName)

      if (Platform.OS === 'android') {
        const result = await saveNativeMediaToLibrary(localUri, isVideo ? 'video' : 'image')

        if (!result) {
          toast.alert(t('mediaViewerSaveFailedTitle'), t('mediaViewerSaveUnsupported'))
          return
        }
      } else {
        await MediaLibrary.saveToLibraryAsync(localUri)
      }
    } catch {
      toast.alert(
        t('mediaViewerSaveFailedTitle'),
        isVideo ? t('mediaViewerVideoSaveFailed') : t('mediaViewerImageSaveFailed')
      )
      return
    }

    if (isVideo) {
      toast.info(t('mediaViewerSavedToAlbum'))
      return
    }

    toast.info(t('mediaViewerSavedToAlbum'))
  }

  if (!message && !resolvedUri) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <UIKitChatEmptyState
          title={t('mediaViewerMissingTitle')}
          description={t('mediaViewerMissingDescription')}
        />
      </ThemedView>
    )
  }

  const isImage =
    message?.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_IMAGE || resolvedType === 'image'

  if (isImage) {
    const imageAttachment = message?.attachment as V2NIMMessageImageAttachment | undefined
    const source = resolvedUri || getImageSource(imageAttachment)
    const imageItems =
      conversationImages.length > 0
        ? conversationImages
        : [{ key: resolvedMessageId || source, uri: source }]

    const handleImageLoadStart = (uri: string) => {
      if (loadedMediaViewerImageUris.has(uri)) {
        return
      }

      setLoadingImageUris((current) => ({
        ...current,
        [uri]: true
      }))
    }

    const handleImageLoad = (uri: string) => {
      loadedMediaViewerImageUris.add(uri)
      setLoadingImageUris((current) => ({
        ...current,
        [uri]: false
      }))
    }

    const handleImageLoadError = (uri: string) => {
      setLoadingImageUris((current) => ({
        ...current,
        [uri]: false
      }))
    }

    const handleImageScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!width) {
        return
      }

      const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width)
      setImageIndex(nextIndex)
    }

    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        {source ? (
          <>
            <FlatList
              ref={imageListRef}
              data={imageItems}
              horizontal
              pagingEnabled
              initialScrollIndex={initialImageIndex}
              keyExtractor={(item) => item.key}
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleImageScroll}
              onScrollToIndexFailed={(info) => {
                setTimeout(() => {
                  imageListRef.current?.scrollToOffset({
                    offset: info.averageItemLength * info.index,
                    animated: false
                  })
                }, 50)
              }}
              getItemLayout={(_, index) => ({
                length: width,
                offset: width * index,
                index
              })}
              renderItem={({ item }) => (
                <View style={[styles.imagePage, { width, height }]}>
                  <View style={[styles.imageFrame, { width, height }]}>
                    <MediaViewerImage
                      uri={item.uri}
                      onLoadStart={() => handleImageLoadStart(item.uri)}
                      onLoad={() => handleImageLoad(item.uri)}
                      onError={() => handleImageLoadError(item.uri)}
                    />
                    {loadingImageUris[item.uri] ? (
                      <View style={styles.imageLoadingOverlay}>
                        <ActivityIndicator color="#FFFFFF" />
                      </View>
                    ) : null}
                  </View>
                </View>
              )}
            />
            <View style={[styles.imageIndexWrap, { top: insets.top + 32 }]}>
              <ThemedText style={styles.imageIndexText}>
                {imageIndex + 1}/{imageItems.length}
              </ThemedText>
            </View>
            <View style={[styles.bottomActionRow, { bottom: insets.bottom + 24 }]}>
              <CircleAction icon="close" onPress={() => router.back()} />
              <View style={styles.bottomActionSpacer} />
              <CircleAction
                icon="download-outline"
                onPress={() =>
                  saveMedia().catch((error) =>
                    toast.alert(
                      t('mediaViewerSaveFailedTitle'),
                      error instanceof Error ? error.message : t('mediaViewerImageSaveFailed')
                    )
                  )
                }
              />
            </View>
          </>
        ) : (
          <UIKitChatEmptyState
            title={t('mediaViewerImageMissingTitle')}
            description={t('mediaViewerImageMissingDescription')}
          />
        )}
      </ThemedView>
    )
  }

  const videoAttachment = message?.attachment as V2NIMMessageVideoAttachment | undefined
  const videoSource = resolvedUri || getVideoSource(videoAttachment)
  const videoSourceName = videoAttachment?.name || resolvedName
  const videoSourceExt = videoAttachment?.ext || resolvedExt

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.videoWrap}>
        {videoSource ? (
          <>
            <View style={styles.videoStage}>
              <NativeVideoPlayer uri={videoSource} name={videoSourceName} ext={videoSourceExt} />
            </View>

            <View style={[styles.bottomActionRow, { bottom: insets.bottom + 24 }]}>
              <CircleAction
                icon="close"
                onPress={() => {
                  router.back()
                }}
              />
              <View style={styles.bottomActionSpacer} />
              <CircleAction
                icon="download-outline"
                onPress={() =>
                  saveMedia().catch((error) =>
                    toast.alert(
                      t('mediaViewerSaveFailedTitle'),
                      error instanceof Error ? error.message : t('mediaViewerVideoSaveFailed')
                    )
                  )
                }
              />
            </View>
          </>
        ) : (
          <UIKitChatEmptyState
            title={t('mediaViewerVideoMissingTitle')}
            description={t('mediaViewerVideoMissingDescription')}
          />
        )}
      </View>
    </ThemedView>
  )
})

function NativeVideoPlayer({ uri, name, ext }: { uri: string; name?: string; ext?: string }) {
  const appStateRef = useRef<AppStateStatus>(AppState.currentState)
  const shouldResumeVideoRef = useRef(false)
  const source = useMemo(() => buildNativeVideoSource(uri, name, ext), [ext, name, uri])
  const player = useVideoPlayer(source, (videoPlayer) => {
    videoPlayer.loop = false
    videoPlayer.timeUpdateEventInterval = 1
    videoPlayer.play()
  })
  const pausePlayerIfPlaying = React.useCallback(() => {
    try {
      if (player.playing) {
        player.pause()
      }
    } catch (error) {
      console.warn('[MediaViewer] pause video failed', error)
    }
  }, [player])

  React.useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      const previousState = appStateRef.current
      appStateRef.current = nextState

      const wasInterrupted =
        (previousState === 'active' || previousState === 'inactive') &&
        (nextState === 'inactive' || nextState === 'background')

      if (wasInterrupted) {
        shouldResumeVideoRef.current = player.playing
        pausePlayerIfPlaying()
        return
      }

      if (
        (previousState === 'inactive' || previousState === 'background') &&
        nextState === 'active' &&
        shouldResumeVideoRef.current
      ) {
        shouldResumeVideoRef.current = false
        player.play()
      }
    })

    return () => {
      subscription.remove()
    }
  }, [pausePlayerIfPlaying, player])

  React.useEffect(() => {
    const subscriptions = AUDIO_VIDEO_CALL_INTERRUPTION_EVENTS.map((eventName) =>
      DeviceEventEmitter.addListener(eventName, () => {
        shouldResumeVideoRef.current = false
        pausePlayerIfPlaying()
      })
    )

    return () => {
      subscriptions.forEach((subscription) => subscription.remove())
    }
  }, [pausePlayerIfPlaying])

  return (
    <VideoView
      player={player}
      style={styles.nativeVideoView}
      contentFit="contain"
      nativeControls
      allowsPictureInPicture={false}
    />
  )
}

function CircleAction({
  icon,
  onPress
}: {
  icon: React.ComponentProps<typeof Ionicons>['name']
  onPress: () => void
}) {
  return (
    <TouchableOpacity style={styles.circleAction} onPress={onPress} hitSlop={10}>
      <Ionicons name={icon} size={18} color="#FFFFFF" />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000'
  },
  videoWrap: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center'
  },
  videoStage: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center'
  },
  nativeVideoView: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000000'
  },
  bottomActionRow: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 20,
    flexDirection: 'row',
    alignItems: 'center'
  },
  bottomActionSpacer: {
    flex: 1
  },
  circleAction: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4C4C4C',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12
  },
  imagePage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  imageFrame: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  image: {
    width: '100%',
    height: '100%'
  },
  imageLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000'
  },
  imageIndexWrap: {
    position: 'absolute',
    top: 76,
    alignSelf: 'center',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    paddingHorizontal: 14,
    paddingVertical: 6
  },
  imageIndexText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700'
  }
})

export default MediaViewerScreen
