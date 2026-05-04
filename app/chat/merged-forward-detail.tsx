import { router, Stack, useLocalSearchParams } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'
import { Alert, Linking, ScrollView, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import {
  UIKitChatComposerShell,
  UIKitChatEmptyState,
  UIKitChatHeaderTitle,
  UIKitMessageCard
} from '@/src/NEUIKit/rn'
import { conversationStore, messageStore, nimStore } from '@/stores'
import { MergedForwardItem, parseMergedForwardPayload } from '@/utils/messageForward'
import { V2NIMMessageType } from '@/utils/nim-sdk'

function renderItemPreview(item: MergedForwardItem) {
  if (item.mergedPayload) {
    return '[聊天记录]'
  }

  return item.preview
}

async function openMergedItem(item: MergedForwardItem) {
  if (item.mergedPayload) {
    router.push({
      pathname: '/chat/message-preview',
      params: {
        title: item.mergedPayload.title,
        content: item.mergedPayload.previewList.join('\n')
      }
    } as never)
    return
  }

  if (item.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_IMAGE && item.attachmentUrl) {
    router.push({
      pathname: '/chat/media-viewer',
      params: {
        uri: item.attachmentUrl,
        type: 'image'
      }
    } as never)
    return
  }

  if (item.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_VIDEO && item.attachmentUrl) {
    router.push({
      pathname: '/chat/media-viewer',
      params: {
        uri: item.attachmentUrl,
        type: 'video'
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

  if (
    (item.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_FILE ||
      item.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_AUDIO) &&
    item.attachmentUrl
  ) {
    if (item.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_FILE) {
      router.push({
        pathname: '/chat/file-detail',
        params: {
          uri: item.attachmentUrl,
          name: item.attachmentName,
          size: `${item.attachmentSize || 0}`
        }
      } as never)
      return
    }

    const canOpen = await Linking.canOpenURL(item.attachmentUrl)

    if (!canOpen) {
      Alert.alert('打开失败', '当前设备无法直接打开该附件')
      return
    }

    await Linking.openURL(item.attachmentUrl)
    return
  }

  router.push({
    pathname: '/chat/message-preview',
    params: {
      title: '消息详情',
      content: item.text || item.preview || renderItemPreview(item)
    }
  } as never)
}

function buildBubbleLabel(item: MergedForwardItem) {
  switch (item.messageType) {
    case V2NIMMessageType.V2NIM_MESSAGE_TYPE_IMAGE:
      return '图片消息'
    case V2NIMMessageType.V2NIM_MESSAGE_TYPE_VIDEO:
      return '视频消息'
    case V2NIMMessageType.V2NIM_MESSAGE_TYPE_LOCATION:
      return item.attachmentAddress || '位置消息'
    case V2NIMMessageType.V2NIM_MESSAGE_TYPE_FILE:
      return item.attachmentName || '文件消息'
    case V2NIMMessageType.V2NIM_MESSAGE_TYPE_AUDIO:
      return `语音 ${item.attachmentDuration || 0}s`
    default:
      return renderItemPreview(item)
  }
}

const MergedForwardDetailScreen = observer(() => {
  const { conversationId, messageId } = useLocalSearchParams<{
    conversationId?: string
    messageId?: string
  }>()

  const mergedMessage =
    typeof conversationId === 'string' && typeof messageId === 'string'
      ? messageStore.getMessageById(conversationId, messageId)
      : null
  const conversation =
    typeof conversationId === 'string' ? conversationStore.getConversation(conversationId) : null
  const currentUserId = nimStore.getLoginUser()

  const payload = useMemo(
    () => (mergedMessage ? parseMergedForwardPayload(mergedMessage) : null),
    [mergedMessage]
  )

  const handleItemPress = (item: MergedForwardItem) => {
    openMergedItem(item).catch((error) => {
      Alert.alert('打开失败', error instanceof Error ? error.message : '当前消息无法打开')
    })
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: () => <UIKitChatHeaderTitle title={payload?.title || '聊天记录'} />,
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#FFFFFF' }
        }}
      />

      {!payload ? (
        <UIKitChatEmptyState
          title="聊天记录不存在"
          description="当前合并转发内容还没有同步完成。"
        />
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.content}>
            <ThemedText style={styles.timestamp}>
              {new Date(mergedMessage?.createTime || Date.now()).toLocaleString()}
            </ThemedText>

            {payload.messages.map((item) => {
              const isSelf = item.senderId === currentUserId

              return (
                <View
                  key={item.messageId}
                  style={[styles.row, isSelf ? styles.rowSelf : styles.rowOther]}
                >
                  {!isSelf ? (
                    <View style={styles.avatarDot}>
                      <ThemedText style={styles.avatarText}>
                        {item.senderName.slice(0, 2)}
                      </ThemedText>
                    </View>
                  ) : null}
                  <View style={[styles.bubbleWrap, isSelf && styles.bubbleWrapSelf]}>
                    <UIKitMessageCard
                      title={item.senderName}
                      subtitle={new Date(item.createTime).toLocaleTimeString()}
                      preview={buildBubbleLabel(item)}
                      highlightedPreview={
                        item.mergedPayload ? (
                          <View style={styles.nestedCard}>
                            <ThemedText numberOfLines={1} style={styles.nestedTitle}>
                              {item.mergedPayload.title}
                            </ThemedText>
                            {item.mergedPayload.previewList.slice(0, 3).map((line, index) => (
                              <ThemedText
                                key={`${item.messageId}-${index}`}
                                numberOfLines={1}
                                style={styles.nestedLine}
                              >
                                {line}
                              </ThemedText>
                            ))}
                          </View>
                        ) : undefined
                      }
                      style={[styles.messageCard, isSelf && styles.messageCardSelf]}
                      onPress={() => handleItemPress(item)}
                    />
                  </View>
                  {isSelf ? (
                    <View style={[styles.avatarDot, styles.avatarDotSelf]}>
                      <ThemedText style={styles.avatarText}>我</ThemedText>
                    </View>
                  ) : null}
                </View>
              )
            })}
          </ScrollView>

          <UIKitChatComposerShell
            placeholder={conversation?.name ? `发送给 ${conversation.name}` : '发送给 当前会话'}
          />
        </>
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
    paddingHorizontal: 18,
    paddingTop: 26,
    paddingBottom: 36
  },
  timestamp: {
    alignSelf: 'center',
    color: '#BCC4D0',
    fontSize: 17,
    lineHeight: 24,
    marginBottom: 28
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 18
  },
  rowOther: {
    justifyContent: 'flex-start'
  },
  rowSelf: {
    justifyContent: 'flex-end'
  },
  avatarDot: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#7A4CE0',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarDotSelf: {
    backgroundColor: '#4F76ED'
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700'
  },
  bubbleWrap: {
    maxWidth: '80%',
    marginLeft: 12
  },
  bubbleWrapSelf: {
    marginLeft: 0,
    marginRight: 12
  },
  messageCard: {
    backgroundColor: '#EEF2F7'
  },
  messageCardSelf: {
    backgroundColor: '#DCEBFF'
  },
  nestedCard: {
    gap: 4
  },
  nestedTitle: {
    color: '#2A313F',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700'
  },
  nestedLine: {
    color: '#5E697A',
    fontSize: 14,
    lineHeight: 20
  }
})

export default MergedForwardDetailScreen
