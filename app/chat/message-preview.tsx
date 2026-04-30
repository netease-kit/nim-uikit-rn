import * as Clipboard from 'expo-clipboard'
import { Stack, useLocalSearchParams } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { Alert, ScrollView, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import {
  UIKitActionPill,
  UIKitChatComposerShell,
  UIKitChatEmptyState,
  UIKitChatHeaderTitle,
  UIKitMessageCard
} from '@/src/NEUIKit/rn'
import { conversationStore, messageStore } from '@/stores'
import { getForwardPreview } from '@/utils/messageForward'

function formatTimestamp(timestamp?: number) {
  if (!timestamp) {
    return ''
  }

  return new Date(timestamp).toLocaleString()
}

const MessagePreviewScreen = observer(() => {
  const { conversationId, messageId, content, title } = useLocalSearchParams<{
    conversationId?: string
    messageId?: string
    content?: string
    title?: string
  }>()
  const resolvedConversationId = typeof conversationId === 'string' ? conversationId : ''
  const resolvedMessageId = typeof messageId === 'string' ? messageId : ''
  const resolvedContent = typeof content === 'string' ? content : ''
  const resolvedTitle = typeof title === 'string' ? title : '消息详情'
  const message = messageStore.getMessageById(resolvedConversationId, resolvedMessageId)
  const conversation = conversationStore.getConversation(resolvedConversationId)
  const previewContent = message?.text || (message ? getForwardPreview(message) : resolvedContent)
  const canCopy = !!(message?.text || resolvedContent)
  const placeholder = conversation?.name ? `发送给 ${conversation.name}` : '发送给 当前会话'

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

      {!message && !resolvedContent ? (
        <UIKitChatEmptyState
          title="消息不存在"
          description="当前内容还没有同步到本地，稍后再试。"
        />
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.content}>
            {message?.createTime ? (
              <ThemedText style={styles.timestamp}>
                {formatTimestamp(message.createTime)}
              </ThemedText>
            ) : null}

            <View style={[styles.bubbleRow, message?.isSelf !== false && styles.bubbleRowSelf]}>
              <View style={styles.previewWrap}>
                <UIKitMessageCard
                  title={message?.isSelf ? '我发送的内容' : '消息内容'}
                  preview={previewContent}
                  style={styles.previewCard}
                />
                {canCopy ? (
                  <View style={styles.actionRow}>
                    <UIKitActionPill
                      label="复制内容"
                      tone="primary"
                      onPress={async () => {
                        try {
                          await Clipboard.setStringAsync(message?.text || resolvedContent)
                          Alert.alert('复制成功')
                        } catch (error) {
                          Alert.alert(
                            '复制失败',
                            error instanceof Error ? error.message : '内容复制失败'
                          )
                        }
                      }}
                    />
                  </View>
                ) : null}
              </View>
            </View>
          </ScrollView>

          <UIKitChatComposerShell placeholder={placeholder} />
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
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 40
  },
  timestamp: {
    alignSelf: 'center',
    color: '#BCC4D0',
    fontSize: 17,
    lineHeight: 24,
    marginBottom: 28
  },
  bubbleRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  bubbleRowSelf: {
    justifyContent: 'flex-end'
  },
  previewWrap: {
    maxWidth: '86%',
    gap: 14
  },
  previewCard: {
    backgroundColor: '#DCEBFF'
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end'
  }
})

export default MessagePreviewScreen
