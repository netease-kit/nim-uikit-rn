import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React, { useMemo, useRef, useState } from 'react'
import {
  Alert,
  FlatList,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native'
import { WebView, WebViewMessageEvent } from 'react-native-webview'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { UIKitChatEmptyState } from '@/src/NEUIKit/rn'
import { messageStore } from '@/stores'
import { persistFileToLocal, resolveFileName } from '@/utils/fileTransfer'
import {
  V2NIMMessage,
  V2NIMMessageImageAttachment,
  V2NIMMessageType,
  V2NIMMessageVideoAttachment
} from '@/utils/nim-sdk'

type VideoState = {
  paused: boolean
  currentTime: number
  duration: number
}

function getMediaSource(
  attachment?: V2NIMMessageImageAttachment | V2NIMMessageVideoAttachment | null
) {
  return attachment?.path || attachment?.url || ''
}

function getMessageSource(message: V2NIMMessage | null) {
  return getMediaSource(
    message?.attachment as V2NIMMessageImageAttachment | V2NIMMessageVideoAttachment | undefined
  )
}

function formatDuration(seconds: number) {
  const safeSeconds = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0
  const minutes = Math.floor(safeSeconds / 60)
  const restSeconds = safeSeconds % 60
  return `${minutes.toString().padStart(2, '0')}:${restSeconds.toString().padStart(2, '0')}`
}

function escapeHtmlAttribute(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function buildVideoHtml(source: string) {
  const safeSource = escapeHtmlAttribute(source)

  return `
    <!doctype html>
    <html lang="zh-CN">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <style>
          html, body {
            margin: 0;
            width: 100%;
            height: 100%;
            background: #000;
            overflow: hidden;
          }
          #player {
            width: 100vw;
            height: 100vh;
            object-fit: contain;
            background: #000;
          }
        </style>
      </head>
      <body>
        <video id="player" playsinline webkit-playsinline preload="metadata" src="${safeSource}"></video>
        <script>
          const video = document.getElementById('player');
          const post = () => {
            const payload = {
              type: 'state',
              paused: video.paused,
              currentTime: video.currentTime || 0,
              duration: video.duration || 0
            };
            window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify(payload));
          };

          window.__rnTogglePlay = () => {
            if (video.paused) {
              video.play().catch(() => {});
            } else {
              video.pause();
            }
            true;
          };

          window.__rnPause = () => {
            video.pause();
            true;
          };

          window.__rnPlay = () => {
            video.play().catch(() => {});
            true;
          };

          window.__rnSeek = (nextTime) => {
            if (!Number.isFinite(nextTime)) {
              return true;
            }
            video.currentTime = Math.max(0, Math.min(video.duration || 0, nextTime));
            post();
            true;
          };

          ['loadedmetadata', 'timeupdate', 'pause', 'play', 'ended'].forEach((eventName) => {
            video.addEventListener(eventName, post);
          });

          post();
        </script>
      </body>
    </html>
  `
}

const MediaViewerScreen = observer(() => {
  const { conversationId, messageId, uri, type } = useLocalSearchParams<{
    conversationId?: string
    messageId?: string
    uri?: string
    type?: string
  }>()
  const resolvedConversationId = typeof conversationId === 'string' ? conversationId : ''
  const resolvedMessageId = typeof messageId === 'string' ? messageId : ''
  const resolvedUri = typeof uri === 'string' ? uri : ''
  const resolvedType = typeof type === 'string' ? type : ''
  const message = messageStore.getMessageById(resolvedConversationId, resolvedMessageId)
  const { width } = useWindowDimensions()
  const imageListRef = useRef<FlatList<{ key: string; uri: string }>>(null)
  const videoWebViewRef = useRef<WebView>(null)
  const [videoState, setVideoState] = useState<VideoState>({
    paused: true,
    currentTime: 0,
    duration: 0
  })
  const [progressTrackWidth, setProgressTrackWidth] = useState(0)

  const conversationImages = useMemo(() => {
    if (!resolvedConversationId) {
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
  }, [resolvedConversationId])
  const initialImageIndex = useMemo(() => {
    if (!conversationImages.length || !resolvedMessageId) {
      return 0
    }

    const index = conversationImages.findIndex((item) => item.key === resolvedMessageId)
    return index >= 0 ? index : 0
  }, [conversationImages, resolvedMessageId])
  const [imageIndex, setImageIndex] = useState(initialImageIndex)

  const mediaSource =
    getMediaSource(
      message?.attachment as V2NIMMessageImageAttachment | V2NIMMessageVideoAttachment | undefined
    ) || resolvedUri

  const saveMedia = async () => {
    if (!mediaSource) {
      Alert.alert('保存失败', '媒体资源不存在')
      return
    }

    const fileName = resolveFileName(mediaSource)
    await persistFileToLocal(mediaSource, fileName)
    Alert.alert('保存成功', '媒体已保存到本地文件')
  }

  const openOriginal = async () => {
    if (!mediaSource) {
      Alert.alert('打开失败', '原始媒体地址不存在')
      return
    }

    router.push({
      pathname: '/chat/message-preview',
      params: {
        title: '原始地址',
        content: mediaSource
      }
    } as never)
  }

  const sendVideoCommand = (command: string) => {
    videoWebViewRef.current?.injectJavaScript(`${command}; true;`)
  }

  const handleVideoMessage = (event: WebViewMessageEvent) => {
    try {
      const payload = JSON.parse(event.nativeEvent.data) as Partial<VideoState> & { type?: string }

      if (payload.type !== 'state') {
        return
      }

      setVideoState({
        paused: !!payload.paused,
        currentTime: payload.currentTime || 0,
        duration: payload.duration || 0
      })
    } catch {
      return
    }
  }

  const handleProgressLayout = (event: LayoutChangeEvent) => {
    setProgressTrackWidth(event.nativeEvent.layout.width)
  }

  const handleSeekPress = (locationX: number) => {
    if (!progressTrackWidth || !videoState.duration) {
      return
    }

    const ratio = Math.max(0, Math.min(1, locationX / progressTrackWidth))
    const nextTime = ratio * videoState.duration
    sendVideoCommand(`window.__rnSeek(${nextTime})`)
  }

  if (!message && !resolvedUri) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <UIKitChatEmptyState title="媒体不存在" description="当前图片或视频还没有同步完成。" />
      </ThemedView>
    )
  }

  const isImage =
    message?.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_IMAGE || resolvedType === 'image'

  if (isImage) {
    const imageAttachment = message?.attachment as V2NIMMessageImageAttachment | undefined
    const source = resolvedUri || getMediaSource(imageAttachment)
    const imageItems =
      conversationImages.length > 0
        ? conversationImages
        : [{ key: resolvedMessageId || source, uri: source }]

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
              getItemLayout={(_, index) => ({
                length: width,
                offset: width * index,
                index
              })}
              renderItem={({ item }) => (
                <ScrollView
                  style={[styles.imageWrap, { width }]}
                  contentContainerStyle={styles.imageScrollContent}
                  minimumZoomScale={1}
                  maximumZoomScale={3}
                  centerContent
                >
                  <Image source={item.uri} style={styles.image} contentFit="contain" />
                </ScrollView>
              )}
            />
            <View style={styles.imageIndexWrap}>
              <ThemedText style={styles.imageIndexText}>
                {imageIndex + 1}/{imageItems.length}
              </ThemedText>
            </View>
            <View style={styles.bottomActionRow}>
              <CircleAction icon="close" onPress={() => router.back()} />
              <View style={styles.bottomActionSpacer} />
              <CircleAction
                icon="download-outline"
                onPress={() =>
                  saveMedia().catch((error) =>
                    Alert.alert('保存失败', error instanceof Error ? error.message : '图片保存失败')
                  )
                }
              />
              <CircleAction
                icon="grid-outline"
                onPress={() => openOriginal().catch(() => undefined)}
              />
            </View>
          </>
        ) : (
          <UIKitChatEmptyState title="图片资源不存在" description="请返回聊天页后重新尝试打开。" />
        )}
      </ThemedView>
    )
  }

  const videoAttachment = message?.attachment as V2NIMMessageVideoAttachment | undefined
  const videoSource = resolvedUri || getMediaSource(videoAttachment)
  const videoHtml = buildVideoHtml(videoSource)
  const progressRatio =
    videoState.duration > 0 ? Math.min(1, videoState.currentTime / videoState.duration) : 0

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.videoWrap}>
        {videoSource ? (
          <>
            <WebView
              ref={videoWebViewRef}
              originWhitelist={['*']}
              source={{ html: videoHtml }}
              style={styles.videoWebView}
              onMessage={handleVideoMessage}
              allowsInlineMediaPlayback
              mediaPlaybackRequiresUserAction
              scrollEnabled={false}
            />
            {videoState.paused ? (
              <TouchableOpacity
                style={styles.centerPlayButton}
                onPress={() => sendVideoCommand('window.__rnPlay()')}
              >
                <Ionicons name="play" size={54} color="#FFFFFF" style={styles.centerPlayIcon} />
              </TouchableOpacity>
            ) : null}

            <View style={styles.videoControlsWrap}>
              <View style={styles.timelineRow}>
                <TouchableOpacity
                  style={styles.playButtonInline}
                  onPress={() => sendVideoCommand('window.__rnTogglePlay()')}
                >
                  <Ionicons name={videoState.paused ? 'play' : 'pause'} size={30} color="#FFFFFF" />
                </TouchableOpacity>
                <ThemedText style={styles.timeText}>
                  {formatDuration(videoState.currentTime)}
                </ThemedText>
                <Pressable
                  style={styles.progressTrack}
                  onLayout={handleProgressLayout}
                  onPress={(event) => handleSeekPress(event.nativeEvent.locationX)}
                >
                  <View style={[styles.progressFill, { width: `${progressRatio * 100}%` }]} />
                  <View style={[styles.progressThumb, { left: `${progressRatio * 100}%` }]} />
                </Pressable>
                <ThemedText style={styles.timeText}>
                  {formatDuration(videoState.duration)}
                </ThemedText>
              </View>
            </View>

            <View style={styles.bottomActionRow}>
              <CircleAction
                icon="close"
                onPress={() => {
                  sendVideoCommand('window.__rnPause()')
                  router.back()
                }}
              />
              <View style={styles.bottomActionSpacer} />
              <CircleAction
                icon="download-outline"
                onPress={() =>
                  saveMedia().catch((error) =>
                    Alert.alert('保存失败', error instanceof Error ? error.message : '视频保存失败')
                  )
                }
              />
              <CircleAction
                icon="grid-outline"
                onPress={() => openOriginal().catch(() => undefined)}
              />
            </View>
          </>
        ) : (
          <UIKitChatEmptyState title="视频资源不存在" description="请返回聊天页后重新尝试打开。" />
        )}
      </View>
    </ThemedView>
  )
})

function CircleAction({
  icon,
  onPress
}: {
  icon: React.ComponentProps<typeof Ionicons>['name']
  onPress: () => void
}) {
  return (
    <TouchableOpacity style={styles.circleAction} onPress={onPress}>
      <Ionicons name={icon} size={36} color="#FFFFFF" />
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
    backgroundColor: '#000000'
  },
  videoWebView: {
    flex: 1,
    backgroundColor: '#000000'
  },
  centerPlayButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 170,
    height: 170,
    marginLeft: -85,
    marginTop: -85,
    borderRadius: 85,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  centerPlayIcon: {
    marginLeft: 8
  },
  videoControlsWrap: {
    position: 'absolute',
    left: 26,
    right: 26,
    bottom: 124
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  playButtonInline: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700'
  },
  progressTrack: {
    flex: 1,
    height: 28,
    justifyContent: 'center',
    marginHorizontal: 14
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 12,
    height: 5,
    borderRadius: 999,
    backgroundColor: '#FFFFFF'
  },
  progressThumb: {
    position: 'absolute',
    top: 2,
    width: 24,
    height: 24,
    marginLeft: -12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF'
  },
  bottomActionRow: {
    position: 'absolute',
    left: 26,
    right: 26,
    bottom: 40,
    flexDirection: 'row',
    alignItems: 'center'
  },
  bottomActionSpacer: {
    flex: 1
  },
  circleAction: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.24)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16
  },
  imageWrap: {
    flex: 1,
    padding: 12
  },
  imageScrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  image: {
    flex: 1,
    width: '100%'
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
