import { Stack, useLocalSearchParams } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React, { useMemo, useState } from 'react'
import { Alert, Modal, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import {
  UIKitActionPill,
  UIKitChatComposerShell,
  UIKitChatEmptyState,
  UIKitChatHeaderTitle
} from '@/src/NEUIKit/rn'
import { conversationStore, messageStore } from '@/stores'
import { openLocalFile, persistFileToLocal, resolveFileName } from '@/utils/fileTransfer'
import { V2NIMMessageFileAttachment } from '@/utils/nim-sdk'

type SourceMode = 'chat' | 'collection'

function formatFileSize(size?: number) {
  if (!size) {
    return '未知大小'
  }

  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`
  }

  if (size >= 1024) {
    return `${Math.round(size / 1024)} KB`
  }

  return `${size} B`
}

function getFileExtension(fileName: string) {
  const parts = fileName.split('.')

  if (parts.length < 2) {
    return 'FILE'
  }

  return parts.pop()!.slice(0, 4).toUpperCase()
}

function getFileTone(extension: string) {
  if (extension.includes('PDF')) {
    return { backgroundColor: '#FDECEC', textColor: '#E5484D' }
  }

  if (extension.includes('XLS') || extension.includes('CSV')) {
    return { backgroundColor: '#E7F8EF', textColor: '#0F9B5A' }
  }

  if (extension.includes('DOC') || extension.includes('PPT')) {
    return { backgroundColor: '#EAF2FF', textColor: '#337EFF' }
  }

  if (extension.includes('ZIP') || extension.includes('RAR')) {
    return { backgroundColor: '#FFF3E5', textColor: '#F08A24' }
  }

  if (extension.includes('MP3') || extension.includes('WAV')) {
    return { backgroundColor: '#F2EEFF', textColor: '#7A4CE0' }
  }

  return { backgroundColor: '#EFF2F6', textColor: '#778294' }
}

const SOURCE_OPTIONS: { key: SourceMode; label: string }[] = [
  { key: 'chat', label: '聊天中的文件' },
  { key: 'collection', label: '收藏中的文件' }
]

const FileDetailScreen = observer(() => {
  const { conversationId, messageId, uri, name, size } = useLocalSearchParams<{
    conversationId?: string
    messageId?: string
    uri?: string
    name?: string
    size?: string
  }>()
  const resolvedConversationId = typeof conversationId === 'string' ? conversationId : ''
  const resolvedMessageId = typeof messageId === 'string' ? messageId : ''
  const message = messageStore.getMessageById(resolvedConversationId, resolvedMessageId)
  const attachment = message?.attachment as V2NIMMessageFileAttachment | undefined
  const sourceUri =
    attachment?.path || attachment?.url || '' || (typeof uri === 'string' ? uri : '')
  const fileName = resolveFileName(
    sourceUri,
    attachment?.name || (typeof name === 'string' ? name : undefined)
  )
  const fileSize = attachment?.size || (typeof size === 'string' && size ? Number(size) : undefined)
  const initialLocalUri =
    sourceUri.startsWith('file://') || sourceUri.startsWith('content://') ? sourceUri : null
  const [localUri, setLocalUri] = useState<string | null>(initialLocalUri)
  const [downloading, setDownloading] = useState(false)
  const [opening, setOpening] = useState(false)
  const [sourceMode, setSourceMode] = useState<SourceMode>('chat')
  const [selectorVisible, setSelectorVisible] = useState(false)
  const conversation = conversationStore.getConversation(resolvedConversationId)
  const placeholder = conversation?.name ? `发送给 ${conversation.name}` : '发送给 当前会话'
  const extension = useMemo(() => getFileExtension(fileName), [fileName])
  const tone = useMemo(() => getFileTone(extension), [extension])

  const handleDownload = async () => {
    if (!sourceUri || downloading || opening) {
      return
    }

    try {
      setDownloading(true)
      const savedUri = await persistFileToLocal(sourceUri, fileName)
      setLocalUri(savedUri)
      Alert.alert('下载成功', '文件已保存到本地')
    } catch (error) {
      Alert.alert('下载失败', error instanceof Error ? error.message : '文件保存失败')
    } finally {
      setDownloading(false)
    }
  }

  const handleOpen = async () => {
    if (!sourceUri || opening) {
      return
    }

    try {
      setOpening(true)
      const savedUri = localUri || (await persistFileToLocal(sourceUri, fileName))
      setLocalUri(savedUri)
      await openLocalFile(savedUri)
    } catch (error) {
      Alert.alert('打开失败', error instanceof Error ? error.message : '当前文件无法打开')
    } finally {
      setOpening(false)
    }
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <TouchableOpacity
              style={styles.headerTitleButton}
              onPress={() => setSelectorVisible(true)}
            >
              <UIKitChatHeaderTitle
                title={sourceMode === 'chat' ? '聊天中的文件' : '收藏中的文件'}
              />
              <ThemedText style={styles.headerChevron}>⌄</ThemedText>
            </TouchableOpacity>
          ),
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#FFFFFF' }
        }}
      />

      {!sourceUri ? (
        <UIKitChatEmptyState title="文件不存在" description="当前文件还没有同步完成，稍后再试。" />
      ) : (
        <>
          <View style={styles.content}>
            <View style={styles.filterHint}>
              <ThemedText style={styles.filterHintText}>
                {sourceMode === 'chat'
                  ? '当前展示这条聊天消息里的文件。'
                  : '当前展示已打开文件的收藏态壳层，后续可接入真实收藏列表。'}
              </ThemedText>
            </View>

            <View style={styles.fileCard}>
              <View style={[styles.fileBadge, { backgroundColor: tone.backgroundColor }]}>
                <ThemedText style={[styles.fileBadgeText, { color: tone.textColor }]}>
                  {extension}
                </ThemedText>
              </View>
              <View style={styles.fileMeta}>
                <ThemedText numberOfLines={2} style={styles.fileName}>
                  {fileName}
                </ThemedText>
                <ThemedText style={styles.fileSubText}>{formatFileSize(fileSize)}</ThemedText>
                <ThemedText style={styles.fileSubText}>
                  {opening
                    ? '文件打开中'
                    : downloading
                      ? '文件下载中'
                      : localUri
                        ? '已下载，可直接打开'
                        : '未下载，打开时会自动缓存'}
                </ThemedText>
              </View>
            </View>

            <View style={styles.actionRow}>
              <UIKitActionPill
                label={opening ? '打开中...' : localUri ? '打开文件' : '下载并打开'}
                tone="primary"
                onPress={() => {
                  handleOpen().catch((error) => {
                    Alert.alert(
                      '打开失败',
                      error instanceof Error ? error.message : '当前文件无法打开'
                    )
                  })
                }}
              />
              <UIKitActionPill
                label={downloading ? '保存中...' : '保存文件'}
                onPress={() => {
                  handleDownload().catch((error) => {
                    Alert.alert('下载失败', error instanceof Error ? error.message : '文件保存失败')
                  })
                }}
              />
            </View>
          </View>

          <UIKitChatComposerShell placeholder={placeholder} />
        </>
      )}

      <Modal
        transparent
        visible={selectorVisible}
        animationType="fade"
        onRequestClose={() => setSelectorVisible(false)}
      >
        <Pressable style={styles.modalMask} onPress={() => setSelectorVisible(false)}>
          <Pressable style={styles.modalCard} onPress={() => undefined}>
            {SOURCE_OPTIONS.map((option) => {
              const active = option.key === sourceMode

              return (
                <TouchableOpacity
                  key={option.key}
                  style={styles.modalOption}
                  onPress={() => {
                    setSourceMode(option.key)
                    setSelectorVisible(false)
                  }}
                >
                  <ThemedText style={styles.modalOptionText}>{option.label}</ThemedText>
                  {active ? <ThemedText style={styles.modalOptionCheck}>✓</ThemedText> : null}
                </TouchableOpacity>
              )
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </ThemedView>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  headerTitleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  headerChevron: {
    color: '#586274',
    fontSize: 16,
    lineHeight: 20
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24
  },
  filterHint: {
    paddingHorizontal: 2,
    marginBottom: 18
  },
  filterHintText: {
    color: '#97A2B2',
    fontSize: 13,
    lineHeight: 19
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#D8E0EA',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 20
  },
  fileBadge: {
    width: 68,
    height: 68,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center'
  },
  fileBadgeText: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800'
  },
  fileMeta: {
    flex: 1,
    gap: 6
  },
  fileName: {
    color: '#2F3540',
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '700'
  },
  fileSubText: {
    color: '#A0A9B5',
    fontSize: 14,
    lineHeight: 20
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18
  },
  modalMask: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.28)',
    justifyContent: 'flex-start',
    paddingTop: 92
  },
  modalCard: {
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 18,
    overflow: 'hidden'
  },
  modalOption: {
    minHeight: 72,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E6EBF2'
  },
  modalOptionText: {
    color: '#2F3642',
    fontSize: 18,
    lineHeight: 26
  },
  modalOptionCheck: {
    color: '#337EFF',
    fontSize: 24,
    fontWeight: '700'
  }
})

export default FileDetailScreen
