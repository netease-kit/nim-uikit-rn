import { router, Stack, useLocalSearchParams } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React, { useMemo, useState } from 'react'
import { Modal, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { useAppTranslation } from '@/hooks/useAppTranslation'
import { toast } from '@/src/NEUIKit/common/utils/toast'
import {
  UIKitActionPill,
  UIKitChatComposerShell,
  UIKitChatEmptyState,
  UIKitChatHeaderTitle
} from '@/src/NEUIKit/rn'
import { conversationStore, messageStore } from '@/stores'
import {
  ensureLocalFileUri,
  getPreviewableFileKind,
  openLocalFile,
  persistFileToLocal,
  resolveFileName
} from '@/utils/fileTransfer'
import {
  getFileTransferSource,
  isLocalAttachmentSource,
  normalizeMediaRenderSource
} from '@/utils/media-source'
import { V2NIMMessageFileAttachment } from '@/utils/nim-sdk'

type SourceMode = 'chat' | 'collection'

function formatFileSize(size?: number) {
  if (!size) {
    return 'Unknown size'
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
  { key: 'chat', label: '' },
  { key: 'collection', label: '' }
]

const FileDetailScreen = observer(() => {
  const { t } = useAppTranslation()
  const { conversationId, messageId, uri, name, ext, size } = useLocalSearchParams<{
    conversationId?: string
    messageId?: string
    uri?: string
    name?: string
    ext?: string
    size?: string
  }>()
  const resolvedConversationId = typeof conversationId === 'string' ? conversationId : ''
  const resolvedMessageId = typeof messageId === 'string' ? messageId : ''
  const routeUri = typeof uri === 'string' ? uri : ''
  const message = messageStore.getMessageById(resolvedConversationId, resolvedMessageId)
  const attachment = message?.attachment as V2NIMMessageFileAttachment | undefined
  const normalizedRouteUri = normalizeMediaRenderSource(routeUri)
  const remoteSourceUri = getFileTransferSource(attachment)
  const initialLocalUri =
    normalizedRouteUri && isLocalAttachmentSource(normalizedRouteUri)
      ? normalizedRouteUri
      : isLocalAttachmentSource(remoteSourceUri)
        ? remoteSourceUri
        : null
  const sourceUri = initialLocalUri || remoteSourceUri || normalizedRouteUri
  const fileName = resolveFileName(
    sourceUri,
    attachment?.name || (typeof name === 'string' ? name : undefined),
    attachment?.ext || (typeof ext === 'string' ? ext : undefined)
  )
  const fileSize = attachment?.size || (typeof size === 'string' && size ? Number(size) : undefined)
  const previewableFileKind = getPreviewableFileKind(fileName, attachment?.ext)
  const [localUri, setLocalUri] = useState<string | null>(initialLocalUri)
  const [downloading, setDownloading] = useState(false)
  const [opening, setOpening] = useState(false)
  const [sourceMode, setSourceMode] = useState<SourceMode>('chat')
  const [selectorVisible, setSelectorVisible] = useState(false)
  const conversation = conversationStore.getConversation(resolvedConversationId)
  const placeholder = conversation?.name
    ? t('chatSendToConversation', { name: conversation.name })
    : t('fileDetailSendToCurrentConversation')
  const extension = useMemo(() => getFileExtension(fileName), [fileName])
  const tone = useMemo(() => getFileTone(extension), [extension])

  const handleDownload = async () => {
    if (!sourceUri || downloading || opening) {
      return
    }

    try {
      setDownloading(true)
      const savedUri = localUri || (await persistFileToLocal(sourceUri, fileName))
      setLocalUri(savedUri)
      toast.alert(
        localUri ? t('fileDetailSavedTitle') : t('fileDetailDownloadSuccessTitle'),
        t('fileDetailSavedDescription')
      )
    } catch (error) {
      toast.alert(
        t('commonLoadingFailed'),
        error instanceof Error ? error.message : t('fileDetailDownloadFailed')
      )
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
      const savedUri = await ensureLocalFileUri(localUri || sourceUri, fileName)
      setLocalUri(savedUri)

      if (previewableFileKind) {
        router.push({
          pathname: '/chat/media-viewer',
          params: {
            conversationId: resolvedConversationId,
            messageId: resolvedMessageId,
            uri: savedUri,
            type: previewableFileKind
          }
        } as never)
        return
      }

      await openLocalFile(savedUri)
    } catch (error) {
      toast.alert(
        t('mediaViewerOpenFailedTitle'),
        error instanceof Error ? error.message : t('chatFileOpenFailed')
      )
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
                title={
                  sourceMode === 'chat'
                    ? t('fileDetailSourceChat')
                    : t('fileDetailSourceCollection')
                }
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
        <UIKitChatEmptyState
          title={t('fileDetailUnavailableTitle')}
          description={t('fileDetailUnavailableDescription')}
        />
      ) : (
        <>
          <View style={styles.content}>
            <View style={styles.filterHint}>
              <ThemedText style={styles.filterHintText}>
                {sourceMode === 'chat' ? t('fileDetailChatHint') : t('fileDetailCollectionHint')}
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
                    ? t('fileDetailOpeningStatus')
                    : downloading
                      ? t('fileDetailDownloadingStatus')
                      : localUri
                        ? t('fileDetailDownloadedStatus')
                        : t('fileDetailPendingStatus')}
                </ThemedText>
              </View>
            </View>

            <View style={styles.actionRow}>
              <UIKitActionPill
                label={
                  opening
                    ? t('fileDetailOpening')
                    : localUri
                      ? t('fileDetailOpenFile')
                      : t('fileDetailDownloadAndOpen')
                }
                tone="primary"
                onPress={() => {
                  handleOpen().catch((error) => {
                    toast.alert(
                      t('mediaViewerOpenFailedTitle'),
                      error instanceof Error ? error.message : t('chatFileOpenFailed')
                    )
                  })
                }}
              />
              <UIKitActionPill
                label={
                  downloading
                    ? t('fileDetailSaving')
                    : localUri
                      ? t('fileDetailSaved')
                      : t('fileDetailSaveFile')
                }
                onPress={() => {
                  handleDownload().catch((error) => {
                    toast.alert(
                      t('commonLoadingFailed'),
                      error instanceof Error ? error.message : t('fileDetailDownloadFailed')
                    )
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
              const label =
                option.key === 'chat' ? t('fileDetailSourceChat') : t('fileDetailSourceCollection')

              return (
                <TouchableOpacity
                  key={option.key}
                  style={styles.modalOption}
                  onPress={() => {
                    setSourceMode(option.key)
                    setSelectorVisible(false)
                  }}
                >
                  <ThemedText style={styles.modalOptionText}>{label}</ThemedText>
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
