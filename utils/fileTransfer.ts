import * as FileSystem from 'expo-file-system/legacy'
import * as IntentLauncher from 'expo-intent-launcher'
import * as Sharing from 'expo-sharing'
import { Platform } from 'react-native'

function sanitizeFileName(name: string) {
  return name.replace(/[\\/:*?"<>|]/g, '_')
}

function getFileExtension(uri: string) {
  const decodedUri = decodeURIComponent(uri)
  const query = decodedUri.split('?')[1] || ''
  const queryParams = new URLSearchParams(query)
  const queryFileName =
    queryParams.get('download') ||
    queryParams.get('filename') ||
    queryParams.get('fileName') ||
    queryParams.get('name')

  if (queryFileName?.includes('.')) {
    return queryFileName.split('.').pop() || ''
  }

  const queryless = decodedUri.split('?')[0]
  const last = queryless.split('/').pop() || ''
  return last.includes('.') ? last.split('.').pop() || '' : ''
}

function hasFileExtension(fileName: string) {
  const lastSegment = fileName.split('/').pop() || fileName
  return /\.[A-Za-z0-9]{1,12}$/.test(lastSegment)
}

function appendExtension(fileName: string, extension: string) {
  return hasFileExtension(fileName) ? fileName : `${fileName}.${extension}`
}

function isLocalFileUri(uri: string) {
  return uri.startsWith('file://') || uri.startsWith('content://')
}

function getExtensionFromFileName(fileName: string) {
  const lastSegment = fileName.split('/').pop() || fileName
  const match = lastSegment.match(/\.([A-Za-z0-9]{1,12})$/)
  return match?.[1]?.toLowerCase() || ''
}

const FILE_IMAGE_EXTENSIONS = new Set([
  'jpg',
  'jpeg',
  'png',
  'tiff',
  'tif',
  'heic',
  'heif',
  'gif',
  'webp'
])
const FILE_VIDEO_EXTENSIONS = new Set([
  'mp4',
  'avi',
  'wmv',
  'mpeg',
  'm4v',
  'mov',
  'asf',
  'flv',
  'f4v',
  'rmvb',
  'rm',
  '3gp'
])

export type PreviewableFileKind = 'image' | 'video'

export function getPreviewableFileKind(fileName: string, extension?: string | null) {
  const normalizedExtension =
    normalizeExtension(extension || undefined) || getExtensionFromFileName(fileName)

  if (FILE_IMAGE_EXTENSIONS.has(normalizedExtension)) {
    return 'image'
  }

  if (FILE_VIDEO_EXTENSIONS.has(normalizedExtension)) {
    return 'video'
  }

  return null
}

function getMimeType(fileUri: string) {
  const extension = getExtensionFromFileName(decodeURIComponent(fileUri.split('?')[0]))

  const mimeMap: Record<string, string> = {
    csv: 'text/csv',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    gif: 'image/gif',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    m4a: 'audio/mp4',
    mp3: 'audio/mpeg',
    mp4: 'video/mp4',
    pdf: 'application/pdf',
    png: 'image/png',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    rar: 'application/vnd.rar',
    txt: 'text/plain',
    wav: 'audio/wav',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    zip: 'application/zip'
  }

  return extension ? mimeMap[extension] || 'application/octet-stream' : 'application/octet-stream'
}

async function inferFileExtensionFromContent(fileUri: string) {
  try {
    const head = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
      position: 0,
      length: 8
    })

    if (head.startsWith('JVBER')) {
      return 'pdf'
    }
    if (head.startsWith('UEsD')) {
      return 'zip'
    }
    if (head.startsWith('/9j/')) {
      return 'jpg'
    }
    if (head.startsWith('iVBORw0KGgo')) {
      return 'png'
    }
    if (head.startsWith('R0lGOD')) {
      return 'gif'
    }
  } catch {
    return ''
  }

  return ''
}

export function buildLocalFileUri(fileName: string) {
  return `${FileSystem.documentDirectory}${sanitizeFileName(fileName)}`
}

export async function persistFileToLocal(sourceUri: string, fileName: string) {
  const targetUri = buildLocalFileUri(fileName)
  const info = await FileSystem.getInfoAsync(targetUri)

  if (info.exists) {
    return targetUri
  }

  if (isLocalFileUri(sourceUri)) {
    await FileSystem.copyAsync({
      from: sourceUri,
      to: targetUri
    })
    return targetUri
  }

  const result = await FileSystem.downloadAsync(sourceUri, targetUri)
  return result.uri
}

export async function downloadFileToLocal(
  sourceUri: string,
  fileName: string,
  onProgress?: (progress: number) => void
) {
  const targetUri = buildLocalFileUri(fileName)
  const info = await FileSystem.getInfoAsync(targetUri)

  if (info.exists) {
    onProgress?.(1)
    return targetUri
  }

  if (isLocalFileUri(sourceUri)) {
    await FileSystem.copyAsync({
      from: sourceUri,
      to: targetUri
    })
    onProgress?.(1)
    return targetUri
  }

  onProgress?.(0)
  const download = FileSystem.createDownloadResumable(sourceUri, targetUri, {}, (event) => {
    const totalBytes = event.totalBytesExpectedToWrite

    if (totalBytes > 0) {
      onProgress?.(event.totalBytesWritten / totalBytes)
    }
  })
  const result = await download.downloadAsync()

  if (!result?.uri) {
    throw new Error('Download canceled')
  }

  onProgress?.(1)
  return result.uri
}

export async function ensureLocalFileUri(sourceUri: string, fileName: string) {
  let targetFileName = fileName
  let targetUri = buildLocalFileUri(targetFileName)

  const normalizeExistingLocalFile = async (localUri: string, localFileName: string) => {
    if (hasFileExtension(localFileName)) {
      return localUri
    }

    const inferredExtension = await inferFileExtensionFromContent(localUri)

    if (!inferredExtension) {
      return localUri
    }

    const extendedFileName = appendExtension(localFileName, inferredExtension)
    const extendedUri = buildLocalFileUri(extendedFileName)
    const extendedInfo = await FileSystem.getInfoAsync(extendedUri)

    if (!extendedInfo.exists) {
      await FileSystem.copyAsync({
        from: localUri,
        to: extendedUri
      })
    }

    return extendedUri
  }

  if (sourceUri === targetUri) {
    return normalizeExistingLocalFile(targetUri, targetFileName)
  }

  const targetInfo = await FileSystem.getInfoAsync(targetUri)

  if (targetInfo.exists) {
    return normalizeExistingLocalFile(targetUri, targetFileName)
  }

  if (isLocalFileUri(sourceUri)) {
    await FileSystem.copyAsync({
      from: sourceUri,
      to: targetUri
    })
    return ensureLocalFileUri(targetUri, targetFileName)
  }

  const localUri = await persistFileToLocal(sourceUri, targetFileName)
  return ensureLocalFileUri(localUri, targetFileName)
}

export async function openLocalFile(fileUri: string) {
  if (Platform.OS === 'android') {
    const contentUri = await FileSystem.getContentUriAsync(fileUri)

    await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
      data: contentUri,
      type: getMimeType(fileUri),
      flags: 1
    })
    return
  }

  const isSharingAvailable = await Sharing.isAvailableAsync()

  if (!isSharingAvailable) {
    throw new Error('当前设备无法直接打开该文件')
  }

  await Sharing.shareAsync(fileUri, {
    mimeType: getMimeType(fileUri),
    UTI: getAppleUniformTypeIdentifier(fileUri)
  })
}

function getAppleUniformTypeIdentifier(fileUri: string) {
  const extension = getExtensionFromFileName(decodeURIComponent(fileUri.split('?')[0]))
  const utiMap: Record<string, string> = {
    csv: 'public.comma-separated-values-text',
    doc: 'com.microsoft.word.doc',
    docx: 'org.openxmlformats.wordprocessingml.document',
    gif: 'com.compuserve.gif',
    jpg: 'public.jpeg',
    jpeg: 'public.jpeg',
    m4a: 'public.mpeg-4-audio',
    mp3: 'public.mp3',
    mp4: 'public.mpeg-4',
    pdf: 'com.adobe.pdf',
    png: 'public.png',
    ppt: 'com.microsoft.powerpoint.ppt',
    pptx: 'org.openxmlformats.presentationml.presentation',
    rar: 'com.rarlab.rar-archive',
    txt: 'public.plain-text',
    wav: 'com.microsoft.waveform-audio',
    xls: 'com.microsoft.excel.xls',
    xlsx: 'org.openxmlformats.spreadsheetml.sheet',
    zip: 'public.zip-archive'
  }

  return utiMap[extension] || 'public.data'
}

function normalizeExtension(extension?: string) {
  return extension?.trim().replace(/^\./, '').toLowerCase() || ''
}

export function resolveFileName(
  sourceUri: string,
  preferredName?: string,
  preferredExtension?: string
) {
  const normalizedName = preferredName?.trim()

  if (normalizedName && hasFileExtension(normalizedName)) {
    return sanitizeFileName(normalizedName)
  }

  const extension = normalizeExtension(preferredExtension) || getFileExtension(sourceUri)

  if (normalizedName && extension) {
    return `${sanitizeFileName(normalizedName)}.${extension}`
  }

  if (normalizedName) {
    return sanitizeFileName(normalizedName)
  }

  return extension ? `attachment.${extension}` : 'attachment'
}
