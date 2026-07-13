import { useCallback, useState } from 'react'

import { translateCurrentApp } from '@/utils/app-language'
import {
  downloadFileToLocal,
  ensureLocalFileUri,
  openLocalFile,
  resolveFileName
} from '@/utils/fileTransfer'
import { getFileTransferSource } from '@/utils/media-source'
import { getMessageKey } from '@/utils/messageForward'
import { V2NIMMessage, V2NIMMessageFileAttachment, V2NIMMessageType } from '@/utils/nim-sdk'

export function useFileMessageOpener() {
  const [downloadingFileIds, setDownloadingFileIds] = useState<string[]>([])
  const [downloadedFileMap, setDownloadedFileMap] = useState<Record<string, string>>({})
  const [fileDownloadProgressMap, setFileDownloadProgressMap] = useState<Record<string, number>>({})

  const clearDownloadingState = useCallback((messageKey: string) => {
    setDownloadingFileIds((ids) => ids.filter((id) => id !== messageKey))
    setFileDownloadProgressMap((progressMap) => {
      const next = { ...progressMap }
      delete next[messageKey]
      return next
    })
  }, [])

  const openFileMessage = useCallback(
    async (message: V2NIMMessage) => {
      if (message.messageType !== V2NIMMessageType.V2NIM_MESSAGE_TYPE_FILE) {
        return false
      }

      const messageKey = getMessageKey(message)
      const downloadedUri = downloadedFileMap[messageKey]
      const attachment = message.attachment as V2NIMMessageFileAttachment | undefined
      const source = getFileTransferSource(attachment)
      const fileName = resolveFileName(
        source,
        attachment?.name || `file-${messageKey}`,
        attachment?.ext
      )

      if (!source && !downloadedUri) {
        throw new Error(translateCurrentApp('chatFileUnavailable' as never))
      }

      if (!downloadedUri) {
        setDownloadingFileIds((ids) => (ids.includes(messageKey) ? ids : [...ids, messageKey]))
        setFileDownloadProgressMap((progressMap) => ({
          ...progressMap,
          [messageKey]: progressMap[messageKey] ?? 0
        }))
      }

      try {
        let localUri = downloadedUri

        if (!localUri) {
          const downloadedLocalUri = await downloadFileToLocal(source, fileName, (progress) => {
            setFileDownloadProgressMap((progressMap) => ({
              ...progressMap,
              [messageKey]: Math.max(0, Math.min(1, progress))
            }))
          })

          localUri = await ensureLocalFileUri(downloadedLocalUri, fileName)
          setDownloadedFileMap((downloadedMap) => ({
            ...downloadedMap,
            [messageKey]: localUri
          }))
        } else {
          localUri = await ensureLocalFileUri(localUri || source, fileName)
        }

        clearDownloadingState(messageKey)
        await openLocalFile(localUri)
        return true
      } finally {
        clearDownloadingState(messageKey)
      }
    },
    [clearDownloadingState, downloadedFileMap]
  )

  return {
    downloadingFileIds,
    downloadedFileMap,
    fileDownloadProgressMap,
    openFileMessage
  }
}
