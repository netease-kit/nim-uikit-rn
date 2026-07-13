import * as Clipboard from 'expo-clipboard'
import { Stack, useLocalSearchParams } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React, { useRef, useState } from 'react'
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { useAppTranslation } from '@/hooks/useAppTranslation'
import { toast } from '@/src/NEUIKit/common/utils/toast'
import {
  UIKitActionPill,
  UIKitChatComposerShell,
  UIKitChatEmptyState,
  UIKitChatHeaderTitle,
  UIKitChatRichText,
  UIKitMessageCard
} from '@/src/NEUIKit/rn'
import { conversationStore, messageStore } from '@/stores'
import { formatAndroidAlignedListTime } from '@/utils/list-time'
import { getForwardPreview } from '@/utils/messageForward'
import { V2NIMMessageType } from '@/utils/nim-sdk'

type PreviewMode = 'default' | 'original-address'
type PreviewSource = 'default' | 'pinned' | 'collection'

function formatTimestamp(timestamp?: number) {
  return formatAndroidAlignedListTime(timestamp)
}

const MessagePreviewScreen = observer(() => {
  const { t } = useAppTranslation()
  const insets = useSafeAreaInsets()
  const { conversationId, messageId, content, title, mode, source } = useLocalSearchParams<{
    conversationId?: string
    messageId?: string
    content?: string
    title?: string
    mode?: string
    source?: string
  }>()
  const resolvedConversationId = typeof conversationId === 'string' ? conversationId : ''
  const resolvedMessageId = typeof messageId === 'string' ? messageId : ''
  const resolvedContent = typeof content === 'string' ? content : ''
  const resolvedTitle = typeof title === 'string' ? title : t('messagePreviewTitle' as never)
  const resolvedMode: PreviewMode = mode === 'original-address' ? 'original-address' : 'default'
  const resolvedSource: PreviewSource =
    source === 'pinned' || source === 'collection' ? source : 'default'
  const message = messageStore.getMessageById(resolvedConversationId, resolvedMessageId)
  const conversation = conversationStore.getConversation(resolvedConversationId)
  const previewContent = message?.text || (message ? getForwardPreview(message) : resolvedContent)
  const canCopy = message
    ? message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_TEXT && !!message.text?.trim()
    : !!resolvedContent
  const placeholder = conversation?.name
    ? t('messagePreviewSendToNamedConversation' as never, { name: conversation.name })
    : t('messagePreviewSendToConversation' as never)
  const hideComposer = resolvedSource === 'pinned' || resolvedSource === 'collection'
  const isStandaloneTextPreview =
    (resolvedSource === 'collection' || resolvedSource === 'pinned') &&
    resolvedMode === 'default' &&
    (message ? message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_TEXT : !!resolvedContent)
  const [copyMenuVisible, setCopyMenuVisible] = useState(false)
  const [copyMenuPosition, setCopyMenuPosition] = useState({ top: 0, left: 0 })
  const contentRef = useRef<View>(null)
  const floatingMenuWidth = 88
  const floatingMenuHeight = 42
  const floatingMenuArrowOffset = 6

  const openCopyMenu = () => {
    if (!isStandaloneTextPreview || !canCopy) {
      return
    }

    contentRef.current?.measureInWindow((x, y, width) => {
      const windowWidth = Dimensions.get('window').width
      const maxLeft = windowWidth - floatingMenuWidth - 12
      const left = Math.min(Math.max(x + width / 2 - floatingMenuWidth / 2, 12), maxLeft)
      const top = Math.max(insets.top + 8, y - floatingMenuHeight - floatingMenuArrowOffset)

      setCopyMenuPosition({ top, left })
      setCopyMenuVisible(true)
    })
  }

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(message?.text?.trim() || resolvedContent)
      toast.alert(
        resolvedMode === 'original-address'
          ? t('messagePreviewOriginalAddressCopied' as never)
          : t('copySuccess' as never)
      )
    } catch (error) {
      toast.alert(
        t('copyFailed' as never),
        error instanceof Error
          ? error.message
          : resolvedMode === 'original-address'
            ? t('messagePreviewOriginalAddressCopyFailed' as never)
            : t('messagePreviewCopyFailed' as never)
      )
    }
  }

  const hasContent = !!(message || resolvedContent)

  return (
    <ThemedView
      style={[
        styles.container,
        resolvedMode === 'original-address' && styles.originalAddressContainer
      ]}
    >
      <Stack.Screen
        options={{
          headerTitle: () => <UIKitChatHeaderTitle title={resolvedTitle} />,
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: resolvedMode === 'original-address' ? '#FFFFFF' : '#FFFFFF'
          }
        }}
      />

      {!hasContent ? (
        <UIKitChatEmptyState
          title={t('messagePreviewMissingTitle' as never)}
          description={t('messagePreviewMissingDescription' as never)}
        />
      ) : resolvedMode === 'original-address' ? (
        <View style={[styles.originalAddressPage, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <View style={styles.originalAddressCard}>
            <ThemedText style={styles.originalAddressLabel}>
              {t('messagePreviewOriginalAddressLabel' as never)}
            </ThemedText>
            <ThemedText style={styles.originalAddressContent} numberOfLines={2}>
              {previewContent}
            </ThemedText>
          </View>

          {canCopy ? (
            <Pressable style={styles.originalAddressCopyButton} onPress={() => handleCopy()}>
              <ThemedText style={styles.originalAddressCopyButtonText}>
                {t('messagePreviewOriginalAddressCopyAction' as never)}
              </ThemedText>
            </Pressable>
          ) : null}

          <ThemedText style={styles.originalAddressWarning}>
            {t('messagePreviewOriginalAddressWarning' as never)}
          </ThemedText>
        </View>
      ) : (
        <>
          <ScrollView
            contentContainerStyle={[
              styles.content,
              hideComposer && { paddingBottom: Math.max(insets.bottom, 40) }
            ]}
          >
            {isStandaloneTextPreview ? (
              <Pressable
                ref={contentRef}
                onLongPress={openCopyMenu}
                style={styles.collectionPreviewContent}
              >
                <UIKitChatRichText
                  text={previewContent}
                  textStyle={styles.collectionPreviewText}
                  onLongPressLink={openCopyMenu}
                />
              </Pressable>
            ) : (
              <>
                {message?.createTime ? (
                  <ThemedText style={styles.timestamp}>
                    {formatTimestamp(message.createTime)}
                  </ThemedText>
                ) : null}

                <View style={[styles.bubbleRow, message?.isSelf !== false && styles.bubbleRowSelf]}>
                  <View style={styles.previewWrap}>
                    <UIKitMessageCard
                      title={
                        message?.isSelf
                          ? t('messagePreviewOutgoingTitle' as never)
                          : t('messagePreviewIncomingTitle' as never)
                      }
                      preview={previewContent}
                      previewNumberOfLines={null}
                      style={styles.previewCard}
                    />
                    {canCopy ? (
                      <View style={styles.actionRow}>
                        <UIKitActionPill
                          label={t('messagePreviewCopyContent' as never)}
                          tone="primary"
                          onPress={() => handleCopy()}
                        />
                      </View>
                    ) : null}
                  </View>
                </View>
              </>
            )}
          </ScrollView>

          {!hideComposer ? (
            <UIKitChatComposerShell
              placeholder={placeholder}
              style={{ paddingBottom: Math.max(insets.bottom, 12) }}
            />
          ) : null}
        </>
      )}
      {isStandaloneTextPreview ? (
        <Modal
          transparent
          visible={copyMenuVisible}
          animationType="fade"
          onRequestClose={() => setCopyMenuVisible(false)}
        >
          <Pressable style={styles.copyMenuOverlay} onPress={() => setCopyMenuVisible(false)}>
            <Pressable
              style={[
                styles.copyMenu,
                {
                  top: copyMenuPosition.top,
                  left: copyMenuPosition.left
                }
              ]}
              onPress={() => undefined}
            >
              <TouchableOpacity
                style={styles.copyMenuButton}
                onPress={async () => {
                  setCopyMenuVisible(false)
                  await handleCopy()
                }}
              >
                <ThemedText style={styles.copyMenuText}>{t('chatActionCopy' as never)}</ThemedText>
              </TouchableOpacity>
              <View style={styles.copyMenuArrowDown} />
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
    </ThemedView>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  originalAddressContainer: {
    backgroundColor: '#EFF1F4'
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
  },
  collectionPreviewContent: {
    alignSelf: 'stretch'
  },
  collectionPreviewText: {
    color: '#1F2329',
    fontSize: 16,
    lineHeight: 24
  },
  copyMenuOverlay: {
    flex: 1
  },
  copyMenu: {
    position: 'absolute',
    minWidth: 88,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#2F3135',
    alignItems: 'center',
    justifyContent: 'center'
  },
  copyMenuButton: {
    minWidth: 88,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18
  },
  copyMenuText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500'
  },
  copyMenuArrowDown: {
    position: 'absolute',
    bottom: -6,
    left: '50%',
    marginLeft: -6,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#2F3135'
  },
  originalAddressPage: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10
  },
  originalAddressCard: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16
  },
  originalAddressLabel: {
    color: '#1F2329',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700'
  },
  originalAddressContent: {
    marginTop: 8,
    color: '#666666',
    fontSize: 14,
    lineHeight: 20
  },
  originalAddressCopyButton: {
    height: 46,
    marginTop: 20,
    borderRadius: 4,
    backgroundColor: '#337EFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  originalAddressCopyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600'
  },
  originalAddressWarning: {
    alignSelf: 'center',
    marginTop: 8,
    color: '#E6605C',
    fontSize: 12,
    lineHeight: 18
  }
})

export default MessagePreviewScreen
