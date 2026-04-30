import * as FileSystem from 'expo-file-system/legacy'
import { Linking, Platform } from 'react-native'

function sanitizeFileName(name: string) {
  return name.replace(/[\\/:*?"<>|]/g, '_')
}

function getFileExtension(uri: string) {
  const queryless = uri.split('?')[0]
  const last = queryless.split('/').pop() || ''
  return last.includes('.') ? last.split('.').pop() || '' : ''
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

  if (sourceUri.startsWith('file://')) {
    await FileSystem.copyAsync({
      from: sourceUri,
      to: targetUri
    })
    return targetUri
  }

  const result = await FileSystem.downloadAsync(sourceUri, targetUri)
  return result.uri
}

export async function openLocalFile(fileUri: string) {
  const uri = Platform.OS === 'android' ? await FileSystem.getContentUriAsync(fileUri) : fileUri
  const canOpen = await Linking.canOpenURL(uri)

  if (!canOpen) {
    throw new Error('当前设备无法直接打开该文件')
  }

  await Linking.openURL(uri)
}

export function resolveFileName(sourceUri: string, preferredName?: string) {
  const normalizedName = preferredName?.trim()

  if (normalizedName) {
    return sanitizeFileName(normalizedName)
  }

  const extension = getFileExtension(sourceUri)
  return extension ? `attachment.${extension}` : 'attachment'
}
