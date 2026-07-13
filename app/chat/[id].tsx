import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useHeaderHeight } from '@react-navigation/elements'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { RecordingPresets, useAudioRecorder, useAudioRecorderState } from 'expo-audio'
import * as Clipboard from 'expo-clipboard'
import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system/legacy'
import { Image } from 'expo-image'
import * as MediaLibrary from 'expo-media-library'
import { router, useLocalSearchParams } from 'expo-router'
import * as VideoThumbnails from 'expo-video-thumbnails'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Animated,
  AppState,
  AppStateStatus,
  Easing,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
  ViewToken
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { useAppTranslation } from '@/hooks/useAppTranslation'
import {
  configureVoicePlaybackAudioMode,
  configureVoiceRecordingAudioMode,
  stopAllMessageAudioPlayback,
  useMessageAudioPlayback
} from '@/hooks/useMessageAudioPlayback'
import { useNavigationLock } from '@/hooks/useNavigationLock'
import { replaceEmoji } from '@/src/NEUIKit/common/utils'
import { EMOJI_ICON_MAP_CONFIG } from '@/src/NEUIKit/common/utils/emoji'
import { toast } from '@/src/NEUIKit/common/utils/toast'
import {
  ensureUIKitUserProfiles,
  getUIKitAppellation,
  getUIKitConversationIdentity,
  getUIKitOnlineStatusText,
  getUIKitReplySourcePreview,
  isUIKitAIUser,
  UIKitChatActionGrid,
  UIKitChatHeaderTitle,
  UIKitChatMessageBubble,
  UIKitChatMessageLongPressContext,
  UIKitChatToolbarAction,
  UIKitEmojiPanel,
  UIKitIcon,
  UIKitNoticeBanner,
  UIKitUserAvatar,
  useUIKitUserStatusSubscription
} from '@/src/NEUIKit/rn'
import {
  authStore,
  collectionStore,
  conversationStore,
  forwardStore,
  friendStore,
  imStoreV2Bridge,
  messageStore,
  nimStore,
  teamStore,
  userStore
} from '@/stores'
import { translateCurrentApp } from '@/utils/app-language'
import { getDisplayErrorMessage } from '@/utils/error-message'
import {
  downloadFileToLocal,
  ensureLocalFileUri,
  getPreviewableFileKind,
  openLocalFile,
  persistFileToLocal,
  resolveFileName
} from '@/utils/fileTransfer'
import * as ImagePicker from '@/utils/image-picker'
import {
  getAttachmentExtension,
  getFileTransferSource,
  getVideoRenderSource
} from '@/utils/media-source'
import {
  applyMentionTextChange,
  AT_ALL_ACCOUNT,
  findMentionTriggerSelectionStart,
  insertMentionToken,
  MentionDraft,
  parseMentionExtension
} from '@/utils/mention'
import {
  getMergedForwardNestedLevel,
  getMessageKey,
  isForwardableMessage,
  isMergedForwardMessage,
  isSelectableMessage,
  MAX_BATCH_DELETE,
  MAX_MERGED_FORWARD,
  MAX_SERIAL_FORWARD
} from '@/utils/messageForward'
import {
  beginNativeCameraCapture,
  beginNativeCameraKeepAlive,
  endNativeCameraCapture,
  endNativeCameraKeepAlive
} from '@/utils/native-capture-state'
import { ensureNetworkAvailable, NETWORK_UNAVAILABLE_MESSAGE } from '@/utils/network'
import {
  V2NIMConst,
  V2NIMConversationType,
  V2NIMMessage,
  V2NIMMessageAudioAttachment,
  V2NIMMessageFileAttachment,
  V2NIMMessageSendingState,
  V2NIMMessageType,
  V2NIMMessageVideoAttachment,
  V2NIMTeam,
  V2NIMTeamChatBannedMode,
  V2NIMTeamMember,
  V2NIMTeamMemberRole
} from '@/utils/nim-sdk'
import {
  ensureCameraPermission,
  ensureMediaLibraryPermission,
  ensureVoiceRecordingPermission,
  getMediaLibraryPermissionState
} from '@/utils/permissions'
import {
  getTeamMentionNameResolutionKey,
  getTeamMentionPickerName,
  getTeamMentionTokenName
} from '@/utils/teamMentionName'
import { getTeamNotificationAccountIds } from '@/utils/teamNotification'
import { logIOSVoiceDebug } from '@/utils/voice-debug-log'

type TimelineItem =
  | { key: string; type: 'time'; label: string }
  | { key: string; type: 'system'; label: string }
  | { key: string; type: 'antispam'; label: string }
  | { key: string; type: 'message'; message: V2NIMMessage }

type ReplyDraft = {
  message: V2NIMMessage
  mentionPrefix: string
}

type MentionCandidate = {
  accountId: string
  displayName: string
  insertName: string
  isAtAll?: boolean
}

type LimitedMediaSelectionType = 'image' | 'video'
type LimitedMediaSendMode = 'media' | 'file'
type LimitedMediaPickerItem = { type: 'asset'; asset: MediaLibrary.Asset } | { type: 'add-more' }

const MAX_UPLOAD_FILE_SIZE = 100 * 1024 * 1024
const COMPRESSED_IMAGE_QUALITY = 0.82
const MAX_VIDEO_SELECTION_COUNT = 1
const MAX_MEDIA_SELECTION_COUNT = 9
const LIMITED_MEDIA_PAGE_SIZE = 30
const MIN_VOICE_DURATION_MS = 1000
const MAX_VOICE_DURATION_SECONDS = 60
const VOICE_RECORD_BUTTON_SIZE = 103
const VOICE_RECORD_WAVE_SIZE = 172
const VOICE_RECORD_CANCEL_EDGE_TOLERANCE = 20
const VOICE_RECORD_IDLE_PANEL_HEIGHT = 210
const VOICE_RECORD_ACTIVE_PANEL_HEIGHT = 320
const VOICE_RECORD_WAVE_DURATION_MS = 1000
const ANDROID_KEYBOARD_EXTRA_LIFT = 24
const SUPPORTED_IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp'])
const IOS_SUPPORTED_IMAGE_EXTENSIONS = new Set([
  ...SUPPORTED_IMAGE_EXTENSIONS,
  'heic',
  'heif',
  'tiff',
  'tif'
])
const IOS_PICKED_IMAGE_FALLBACK_EXTENSION = 'jpg'
const SUPPORTED_IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
const IOS_SUPPORTED_IMAGE_MIME_TYPES = new Set([
  ...SUPPORTED_IMAGE_MIME_TYPES,
  'image/heic',
  'image/heif',
  'image/tiff'
])
const TEAM_DISMISSED_TIP = () => translateCurrentApp('chatTeamDismissedTip' as never)
const TEAM_UNAVAILABLE_TIP = () => translateCurrentApp('chatTeamUnavailableTip' as never)
const TEAM_CHAT_BANNED_PLACEHOLDER = () => translateCurrentApp('chatTeamBannedPlaceholder' as never)
const SECURITY_TIP_TEXT = () => translateCurrentApp('chatSecurityTip' as never)
const NON_FRIEND_TIP_TEXT = () => translateCurrentApp('chatNonFriendTip' as never)
const ALLOW_AT_EXTENSION_KEY = 'yxAllowAt'
const EMPTY_TEAM_MEMBERS: V2NIMTeamMember[] = []
const RESOURCE_NOT_EXIST_ERROR_CODE = 191006
const AI_MESSAGE_RESPONSE_STATUS = 2
const TYPING_NOTIFICATION_KEY = 'typing'
const TYPING_NOTIFICATION_IDLE_MS = 3000
const PEER_TYPING_RESET_MS = 3000
const LONG_PRESS_MENU_COLUMNS = 5
const LONG_PRESS_MENU_MIN_COLUMNS = 2
const LONG_PRESS_MENU_SIDE_MARGIN = 16
const LONG_PRESS_MENU_TOP_GAP = 12
const LONG_PRESS_MENU_BOTTOM_MARGIN = 24
const LONG_PRESS_MENU_MAX_WIDTH = 336
const LONG_PRESS_MENU_COLUMN_WIDTH = 64
const DEFERRED_NEW_MESSAGE_REVEAL_SCROLL_STEP = 56
const LONG_PRESS_MENU_HORIZONTAL_PADDING = 16
const LONG_PRESS_MENU_ROW_HEIGHT = 82
const LONG_PRESS_MENU_VERTICAL_PADDING = 18
const HISTORY_PREFETCH_TOP_OFFSET = 240
const MENTION_LIST_INITIAL_RENDER_COUNT = 56
const MENTION_LIST_BATCH_RENDER_COUNT = 96
const MENTION_LIST_WINDOW_SIZE = 31
const MENTION_ROW_HEIGHT = 72
const LIMITED_MEDIA_GRID_INITIAL_RENDER_COUNT = 9
const LIMITED_MEDIA_GRID_BATCH_RENDER_COUNT = 6
const LIMITED_MEDIA_GRID_WINDOW_SIZE = 7
const LIMITED_MEDIA_THUMBNAIL_CACHE_DIR = `${FileSystem.cacheDirectory || ''}chat-media-thumbnails/`
const LIMITED_MEDIA_THUMBNAIL_SIZE = 320
const LIMITED_MEDIA_THUMBNAIL_BATCH_SIZE = 12
const composerEmojiTokens = Object.keys(EMOJI_ICON_MAP_CONFIG).sort(
  (left, right) => right.length - left.length
)

const VOICE_RECORDING_PRESET = {
  ...RecordingPresets.HIGH_QUALITY,
  android: {
    outputFormat: 'mpeg4' as const,
    audioEncoder: 'aac' as const
  }
}
function createVoiceDebugTraceId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function getVoiceRecordCancelState(locationX: number, locationY: number) {
  const buttonRadius = VOICE_RECORD_BUTTON_SIZE / 2
  const cancelRadius = buttonRadius + VOICE_RECORD_CANCEL_EDGE_TOLERANCE
  const distanceX = locationX - buttonRadius
  const distanceY = locationY - buttonRadius
  const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY)

  return {
    shouldCancel: distance > cancelRadius,
    buttonRadius,
    cancelRadius,
    distance
  }
}

async function getVoiceDebugFileInfo(uri?: string | null) {
  if (!uri) {
    return undefined
  }

  try {
    const info = await FileSystem.getInfoAsync(uri)

    return {
      uri,
      exists: info.exists,
      size: info.exists && typeof info.size === 'number' ? info.size : undefined
    }
  } catch (error) {
    return {
      uri,
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

async function resolveRecordedVoiceSendUri(audioUri: string, sendName: string) {
  if (Platform.OS !== 'android') {
    return {
      sourceUri: audioUri,
      persistedUri: audioUri,
      localUri: audioUri,
      fileInfo: await getVoiceDebugFileInfo(audioUri)
    }
  }

  const fileName = resolveFileName(audioUri, sendName, 'm4a')
  const persistedUri = await persistFileToLocal(audioUri, fileName)
  const localUri = await ensureLocalFileUri(persistedUri, fileName)

  return {
    sourceUri: audioUri,
    persistedUri,
    localUri,
    fileInfo: await getVoiceDebugFileInfo(localUri)
  }
}

function getSdkErrorCode(error: unknown) {
  if (typeof error !== 'object' || error === null) {
    return undefined
  }

  const candidate = error as { code?: unknown; errCode?: unknown; errorCode?: unknown }
  return candidate.code ?? candidate.errCode ?? candidate.errorCode
}

function isTeamUnavailableError(error: unknown) {
  const code = getSdkErrorCode(error)
  const nimErrorCode = V2NIMConst.V2NIMErrorCode || {}
  const unavailableCodes = [
    nimErrorCode.V2NIM_ERROR_CODE_TEAM_NOT_EXIST,
    nimErrorCode.V2NIM_ERROR_CODE_TEAM_MEMBER_NOT_EXIST,
    nimErrorCode.V2NIM_ERROR_CODE_RESOURCE_NOT_EXIST,
    nimErrorCode.V2NIM_ERROR_CODE_NO_PERMISSION,
    RESOURCE_NOT_EXIST_ERROR_CODE
  ].filter((item) => item !== undefined)

  if (unavailableCodes.includes(code)) {
    return true
  }

  const message = error instanceof Error ? error.message : String(error || '')
  return /群.*不存在|群.*解散|资源不存在|不在.*群|group.*not exist|team.*not exist|team.*dismiss|resource.*not exist|not\s+found|not\s+exist|not\s+in\s+team|no\s+permission/i.test(
    message
  )
}

function getReplySourceMessage(conversationId: string, message: V2NIMMessage) {
  if (!message.threadReply) {
    return null
  }

  return (
    messageStore.getMessageById(conversationId, message.threadReply.messageClientId) ||
    (message.threadReply.messageServerId
      ? messageStore.getMessageById(conversationId, message.threadReply.messageServerId)
      : null)
  )
}

function deleteTrailingEmojiToken(text: string) {
  const matchedToken = composerEmojiTokens.find((token) => text.endsWith(token))

  if (matchedToken) {
    return text.slice(0, -matchedToken.length)
  }

  return text.slice(0, -1)
}

function getMessageDisplayName(
  accountId: string,
  conversationType?: V2NIMConversationType,
  teamId?: string
) {
  return getUIKitAppellation({
    account: accountId,
    teamId:
      conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM ? teamId : undefined
  })
}

function getTeamChatDisplayName(accountId: string, teamId?: string, nickFromMsg = '') {
  if (!accountId) {
    return ''
  }

  const friendAlias = friendStore.friends.get(accountId)?.alias?.trim()

  if (friendAlias) {
    return friendAlias
  }

  const teamNick = teamId
    ? teamStore
        .getMembers(teamId)
        .find((item) => item.accountId === accountId)
        ?.teamNick?.trim()
    : ''

  if (teamNick) {
    return teamNick
  }

  return getUIKitAppellation({
    account: accountId,
    nickFromMsg
  })
}

function formatTimeLabel(timestamp: number) {
  const date = new Date(timestamp)
  const now = new Date()
  const sameYear = date.getFullYear() === now.getFullYear()
  const sameDay = sameYear && date.getMonth() === now.getMonth() && date.getDate() === now.getDate()

  if (sameDay) {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  if (sameYear) {
    return translateCurrentApp('chatTimeLabelSameYear' as never, {
      month: String(date.getMonth() + 1).padStart(2, '0'),
      day: String(date.getDate()).padStart(2, '0'),
      time: date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    })
  }

  return translateCurrentApp('chatTimeLabelFullYear' as never, {
    year: date.getFullYear(),
    month: String(date.getMonth() + 1).padStart(2, '0'),
    day: String(date.getDate()).padStart(2, '0'),
    time: date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  })
}

function shouldInsertTimeDivider(previousTime: number | null, currentTime: number) {
  if (!previousTime) {
    return true
  }

  return currentTime - previousTime > 5 * 60 * 1000
}

function getMessageMentionTokenName(
  accountId: string,
  conversationType?: V2NIMConversationType,
  teamId?: string,
  nickFromMsg = ''
) {
  if (conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM && teamId) {
    return getTeamMentionTokenName(accountId, teamId, nickFromMsg)
  }

  if (nickFromMsg.trim()) {
    return nickFromMsg.trim()
  }

  return getUIKitAppellation({
    account: accountId,
    teamId:
      conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM ? teamId : undefined,
    ignoreAlias: true
  })
}

function getForwardPayloadP2PTitle(accountId: string) {
  if (!accountId) {
    return ''
  }

  const user = userStore.users.get(accountId)
  const selfProfile = userStore.selfProfile?.accountId === accountId ? userStore.selfProfile : null
  const friend = friendStore.friends.get(accountId)

  return user?.name || selfProfile?.name || friend?.userProfile?.name || accountId
}

function isAtAllAllowedForCurrentUser(teamServerExtension?: string, isPrivilegedMember = false) {
  if (!teamServerExtension) {
    return true
  }

  try {
    const parsed = JSON.parse(teamServerExtension) as Record<string, unknown>
    return parsed[ALLOW_AT_EXTENSION_KEY] === 'manager' ? isPrivilegedMember : true
  } catch {
    return true
  }
}

function getMessageSenderSnapshotName(message: V2NIMMessage) {
  const messageWithSenderName = message as V2NIMMessage & {
    senderName?: string
    fromNick?: string
    nickFromMsg?: string
  }

  return (
    messageWithSenderName.senderName ||
    messageWithSenderName.fromNick ||
    messageWithSenderName.nickFromMsg ||
    ''
  )
}

function getAIReplySenderAccountId(message: V2NIMMessage, aiUserAccountIds: Set<string>) {
  const aiAccountId = message.aiConfig?.accountId?.trim()

  if (
    !aiAccountId ||
    message.aiConfig?.aiStatus !== AI_MESSAGE_RESPONSE_STATUS ||
    !aiUserAccountIds.has(aiAccountId)
  ) {
    return ''
  }

  return aiAccountId
}

function getMessageDisplaySenderAccountId(message: V2NIMMessage, aiUserAccountIds: Set<string>) {
  return getAIReplySenderAccountId(message, aiUserAccountIds) || message.senderId
}

function getMessageDisplaySenderName(
  message: V2NIMMessage,
  displaySenderAccountId: string,
  conversationType?: V2NIMConversationType,
  targetId?: string
) {
  if (
    conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM &&
    targetId &&
    displaySenderAccountId
  ) {
    return getTeamChatDisplayName(
      displaySenderAccountId,
      targetId,
      getMessageSenderSnapshotName(message)
    )
  }

  return getMessageDisplayName(displaySenderAccountId, conversationType, targetId)
}

function getReplyMentionPrefix(
  message: V2NIMMessage,
  currentUserId: string | null,
  conversationType?: V2NIMConversationType,
  targetId?: string
) {
  if (
    conversationType !== V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM ||
    message.senderId === currentUserId
  ) {
    return ''
  }

  return `@${getMessageMentionTokenName(
    message.senderId,
    conversationType,
    targetId,
    getMessageSenderSnapshotName(message)
  )} `
}

function getFileExtensionFromAsset(asset: ImagePicker.ImagePickerAsset) {
  const source = asset.fileName || asset.uri
  const fileName = source.split('?')[0]?.split('/').pop() || ''
  const extension = fileName.includes('.') ? fileName.split('.').pop() : ''
  return extension?.toLowerCase() || ''
}

function getFileExtensionFromMediaAsset(asset: Pick<MediaLibrary.Asset, 'filename' | 'uri'>) {
  const source = asset.filename || asset.uri
  const fileName = source.split('?')[0]?.split('/').pop() || ''
  const extension = fileName.includes('.') ? fileName.split('.').pop() : ''
  return extension?.toLowerCase() || ''
}

function isSupportedImageExtension(extension: string) {
  const supportedExtensions =
    Platform.OS === 'ios' ? IOS_SUPPORTED_IMAGE_EXTENSIONS : SUPPORTED_IMAGE_EXTENSIONS

  return supportedExtensions.has(extension)
}

function isSupportedImageMimeType(mimeType: string) {
  const supportedMimeTypes =
    Platform.OS === 'ios' ? IOS_SUPPORTED_IMAGE_MIME_TYPES : SUPPORTED_IMAGE_MIME_TYPES

  return supportedMimeTypes.has(mimeType)
}

function validatePickedImage(
  asset: ImagePicker.ImagePickerAsset,
  showToast: (message: string) => void
) {
  const mimeType = asset.mimeType?.toLowerCase()
  const extension = getFileExtensionFromAsset(asset)

  if (Platform.OS === 'ios' && !mimeType && !extension) {
    return true
  }

  if (
    (mimeType && isSupportedImageMimeType(mimeType)) ||
    (extension && isSupportedImageExtension(extension))
  ) {
    return true
  }

  showToast(translateCurrentApp('chatUnsupportedFormat' as never))
  return false
}

async function getLocalFileSize(uri?: string | null) {
  if (!uri) {
    return undefined
  }
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri)

    return fileInfo.exists && typeof fileInfo.size === 'number' ? fileInfo.size : undefined
  } catch (error) {
    console.warn('[ChatScreen] get local file size failed', {
      uri,
      error: error instanceof Error ? error.message : String(error)
    })
    return undefined
  }
}

function validateUploadFileSize(
  fileSize: number | undefined,
  showToast: (message: string) => void
) {
  if (!isUploadFileSizeWithinLimit(fileSize)) {
    showToast(translateCurrentApp('chatFileTooLarge' as never))
    return false
  }

  return true
}

async function validateLocalUploadFileSize(
  uri: string | undefined | null,
  showToast: (message: string) => void
) {
  return validateUploadFileSize(await getLocalFileSize(uri), showToast)
}

function isUploadFileSizeWithinLimit(fileSize: number | undefined) {
  return !(typeof fileSize === 'number' && fileSize > MAX_UPLOAD_FILE_SIZE)
}

function isLimitedMediaImageSupported(asset: MediaLibrary.Asset) {
  const extension = getFileExtensionFromMediaAsset(asset)

  if (Platform.OS === 'ios' && !extension) {
    return true
  }

  return !!(extension && isSupportedImageExtension(extension))
}

function getLimitedMediaThumbnailCacheKey(asset: MediaLibrary.Asset) {
  const assetStamp = asset.modificationTime || asset.creationTime || 0
  const safeAssetId = asset.id.replace(/[^a-zA-Z0-9_-]/g, '_')

  return `${safeAssetId}-${assetStamp}-${LIMITED_MEDIA_THUMBNAIL_SIZE}.jpg`
}

function getLimitedMediaThumbnailCacheUri(asset: MediaLibrary.Asset) {
  return `${LIMITED_MEDIA_THUMBNAIL_CACHE_DIR}${getLimitedMediaThumbnailCacheKey(asset)}`
}

async function ensureLimitedMediaThumbnailCacheDir() {
  if (!FileSystem.cacheDirectory) {
    throw new Error('Missing file cache directory')
  }

  await FileSystem.makeDirectoryAsync(LIMITED_MEDIA_THUMBNAIL_CACHE_DIR, { intermediates: true })
}

async function clearLimitedMediaThumbnailCacheDir() {
  if (!FileSystem.cacheDirectory) {
    return
  }

  await FileSystem.deleteAsync(LIMITED_MEDIA_THUMBNAIL_CACHE_DIR, { idempotent: true })
}

function getAndroidMediaStoreUri(asset: MediaLibrary.Asset) {
  if (Platform.OS !== 'android' || !asset.id) {
    return null
  }

  return isLimitedMediaVideo(asset)
    ? `content://media/external/video/media/${asset.id}`
    : `content://media/external/images/media/${asset.id}`
}

async function getLimitedMediaAssetLocalSourceUri(asset: MediaLibrary.Asset) {
  let assetInfo: MediaLibrary.AssetInfo | null = null

  try {
    assetInfo = await MediaLibrary.getAssetInfoAsync(asset, {
      shouldDownloadFromNetwork: false
    })
  } catch (error) {
    console.warn('[ChatScreen] get thumbnail asset info failed, fallback to asset uri', {
      assetId: asset.id,
      error: error instanceof Error ? error.message : String(error)
    })
  }

  if (assetInfo?.isNetworkAsset && !assetInfo.localUri) {
    return null
  }

  const sourceUriCandidates = [
    assetInfo?.localUri,
    assetInfo?.uri,
    asset.uri,
    getAndroidMediaStoreUri(asset)
  ].filter(Boolean) as string[]

  return sourceUriCandidates[0] || null
}

async function createLimitedMediaPreviewSource(asset: MediaLibrary.Asset) {
  if (!FileSystem.cacheDirectory) {
    return null
  }

  const sourceUri = await getLimitedMediaAssetLocalSourceUri(asset)

  if (!sourceUri) {
    return null
  }

  if (!isLimitedMediaVideo(asset)) {
    return sourceUri
  }

  const targetUri = getLimitedMediaThumbnailCacheUri(asset)
  const existingInfo = await FileSystem.getInfoAsync(targetUri)

  if (existingInfo.exists) {
    return targetUri
  }

  await ensureLimitedMediaThumbnailCacheDir()

  const { uri } = await VideoThumbnails.getThumbnailAsync(sourceUri, {
    time: 100,
    quality: 0.45
  })

  await FileSystem.copyAsync({ from: uri, to: targetUri })
  FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => undefined)
  return targetUri
}

async function resolvePickedImageUri(asset: ImagePicker.ImagePickerAsset) {
  const preferredExtension =
    getFileExtensionFromAsset(asset) ||
    (Platform.OS === 'ios' ? IOS_PICKED_IMAGE_FALLBACK_EXTENSION : undefined)
  const fileName = resolveFileName(asset.uri, asset.fileName || 'image', preferredExtension)
  const persistedUri = await persistFileToLocal(asset.uri, fileName)
  const localUri = await ensureLocalFileUri(persistedUri, fileName)

  return {
    localUri,
    fileName: localUri.split('?')[0]?.split('/').pop() || fileName
  }
}

async function resolveRecordedVideoAsset(asset: ImagePicker.ImagePickerAsset): Promise<{
  localUri: string
  fileName: string
  fileSize?: number
}> {
  const fileName = resolveFileName(asset.uri, asset.fileName || 'camera-video', 'mp4')
  const persistedUri = await persistFileToLocal(asset.uri, fileName)
  const localUri = await ensureLocalFileUri(persistedUri, fileName)
  const fileInfo = await FileSystem.getInfoAsync(localUri)
  const fileSize = fileInfo.exists && typeof fileInfo.size === 'number' ? fileInfo.size : undefined

  return {
    localUri,
    fileName: localUri.split('?')[0]?.split('/').pop() || fileName,
    fileSize
  }
}

async function resolveLimitedMediaAsset(asset: MediaLibrary.Asset): Promise<{
  localUri: string
  fileName: string
  fileSize?: number
}> {
  let assetInfo: MediaLibrary.AssetInfo | null = null

  try {
    assetInfo = await MediaLibrary.getAssetInfoAsync(asset)
  } catch (error) {
    console.warn('[ChatScreen] getAssetInfoAsync failed, fallback to asset uri only', {
      assetId: asset.id,
      error: error instanceof Error ? error.message : String(error)
    })
  }

  const preferredExtension =
    getFileExtensionFromMediaAsset(asset) ||
    (Platform.OS === 'ios' && asset.mediaType === MediaLibrary.MediaType.photo
      ? IOS_PICKED_IMAGE_FALLBACK_EXTENSION
      : undefined)
  const fileName = resolveFileName(
    assetInfo?.localUri || assetInfo?.uri || asset.uri,
    asset.filename || (asset.mediaType === MediaLibrary.MediaType.video ? 'video' : 'image'),
    preferredExtension
  )

  const sourceUriCandidates = [
    getAndroidMediaStoreUri(asset),
    assetInfo?.localUri,
    assetInfo?.uri,
    asset.uri
  ].filter(Boolean) as string[]

  if (sourceUriCandidates.length === 0) {
    throw new Error('Missing asset uri')
  }

  let lastError: unknown = null

  for (const sourceUri of sourceUriCandidates) {
    try {
      const persistedUri = await persistFileToLocal(sourceUri, fileName)
      const localUri = await ensureLocalFileUri(persistedUri, fileName)
      const fileInfo = await FileSystem.getInfoAsync(localUri)
      const fileSize =
        fileInfo.exists && typeof fileInfo.size === 'number' ? fileInfo.size : undefined

      return {
        localUri,
        fileName,
        fileSize
      }
    } catch (error) {
      lastError = error
      console.warn('[ChatScreen] resolveLimitedMediaAsset failed for candidate', {
        assetId: asset.id,
        sourceUri,
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Unable to resolve limited media asset')
}

async function createVideoUploadPreview(videoUri: string) {
  try {
    const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
      time: 100
    })

    return uri
  } catch (error) {
    console.warn('[ChatScreen] createVideoUploadPreview failed', {
      videoUri,
      error: error instanceof Error ? error.message : String(error)
    })
    return undefined
  }
}

async function waitForLimitedMediaPermissionRefresh(delayMs = 250) {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, delayMs)
  })
}

function isLimitedMediaVideo(asset: MediaLibrary.Asset) {
  return asset.mediaType === MediaLibrary.MediaType.video
}

function getLimitedMediaAssetSortTime(asset: MediaLibrary.Asset) {
  const creationTime = Number(asset.creationTime || 0)
  const modificationTime = Number(asset.modificationTime || 0)
  return creationTime > 0 ? creationTime : modificationTime
}

function compareLimitedMediaAssets(left: MediaLibrary.Asset, right: MediaLibrary.Asset) {
  const leftTime = getLimitedMediaAssetSortTime(left)
  const rightTime = getLimitedMediaAssetSortTime(right)

  if (leftTime !== rightTime) {
    return rightTime - leftTime
  }

  const leftModificationTime = Number(left.modificationTime || 0)
  const rightModificationTime = Number(right.modificationTime || 0)

  if (leftModificationTime !== rightModificationTime) {
    return rightModificationTime - leftModificationTime
  }

  const leftStableKey = `${left.id || ''}:${left.filename || ''}:${left.uri || ''}`
  const rightStableKey = `${right.id || ''}:${right.filename || ''}:${right.uri || ''}`
  return rightStableKey.localeCompare(leftStableKey)
}

function sortLimitedMediaAssets(assets: MediaLibrary.Asset[]) {
  return assets.slice().sort(compareLimitedMediaAssets)
}

function formatLimitedMediaDuration(durationSeconds: number) {
  const totalSeconds = Math.max(0, Math.round(durationSeconds || 0))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function mergeLimitedMediaAssets(
  currentAssets: MediaLibrary.Asset[],
  nextAssets: MediaLibrary.Asset[]
) {
  const merged = new Map<string, MediaLibrary.Asset>()

  currentAssets.forEach((asset) => {
    merged.set(asset.id, asset)
  })
  nextAssets.forEach((asset) => {
    merged.set(asset.id, asset)
  })

  return sortLimitedMediaAssets(Array.from(merged.values()))
}

type LimitedMediaTileProps = {
  asset: MediaLibrary.Asset
  disabled: boolean
  selected: boolean
  selectionOrder: number
  size: number
  thumbnailUri?: string
  onPress: (asset: MediaLibrary.Asset) => void
}

const LimitedMediaTile = React.memo(function LimitedMediaTile({
  asset,
  disabled,
  selected,
  selectionOrder,
  size,
  thumbnailUri,
  onPress
}: LimitedMediaTileProps) {
  const isVideo = isLimitedMediaVideo(asset)
  const previewUri = thumbnailUri || (!isVideo ? asset.uri : undefined)

  const tileStyle = [
    styles.limitedMediaTile,
    disabled && styles.limitedMediaTileDisabled,
    {
      width: size,
      height: size
    }
  ]
  const content = (
    <>
      {previewUri ? (
        <Image
          source={{
            uri: previewUri,
            width: LIMITED_MEDIA_THUMBNAIL_SIZE,
            height: LIMITED_MEDIA_THUMBNAIL_SIZE,
            cacheKey: thumbnailUri ? getLimitedMediaThumbnailCacheKey(asset) : asset.id
          }}
          style={styles.limitedMediaTileImage}
          contentFit="cover"
          cachePolicy="memory-disk"
          priority={thumbnailUri || !isVideo ? 'high' : 'normal'}
          recyclingKey={previewUri}
          transition={0}
          allowDownscaling
        />
      ) : (
        <View style={styles.limitedMediaTilePlaceholder} />
      )}
      {selected ? (
        <View pointerEvents="none" style={styles.limitedMediaTileSelectedOverlay} />
      ) : null}
      {disabled ? (
        <View pointerEvents="none" style={styles.limitedMediaTileDisabledOverlay} />
      ) : null}
      <View
        pointerEvents="none"
        style={[
          styles.limitedMediaTileCheck,
          disabled && styles.limitedMediaTileCheckDisabled,
          selected && styles.limitedMediaTileCheckSelected
        ]}
      >
        {selected ? (
          <ThemedText style={styles.limitedMediaTileCheckText}>{selectionOrder}</ThemedText>
        ) : null}
      </View>
      {isVideo ? (
        <View pointerEvents="none" style={styles.limitedMediaVideoBadge}>
          <ThemedText style={styles.limitedMediaVideoBadgeText}>
            {formatLimitedMediaDuration(asset.duration)}
          </ThemedText>
        </View>
      ) : null}
    </>
  )

  if (disabled) {
    return <View style={tileStyle}>{content}</View>
  }

  return (
    <TouchableOpacity style={tileStyle} activeOpacity={0.82} onPress={() => onPress(asset)}>
      {content}
    </TouchableOpacity>
  )
})

type LimitedMediaAddTileProps = {
  size: number
  onPress: () => void
}

const LimitedMediaAddTile = React.memo(function LimitedMediaAddTile({
  size,
  onPress
}: LimitedMediaAddTileProps) {
  return (
    <TouchableOpacity
      style={[
        styles.limitedMediaAddTile,
        {
          width: size,
          height: size
        }
      ]}
      activeOpacity={0.82}
      onPress={onPress}
    >
      <View style={styles.limitedMediaAddTileIcon}>
        <View style={styles.limitedMediaAddTileIconHorizontal} />
        <View style={styles.limitedMediaAddTileIconVertical} />
      </View>
      <ThemedText style={styles.limitedMediaAddTileText}>
        {translateCurrentApp('chatAddMorePhotos' as never)}
      </ThemedText>
    </TouchableOpacity>
  )
})

function isUnknownMessage(message: V2NIMMessage) {
  return (
    message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_CUSTOM &&
    !isMergedForwardMessage(message)
  )
}

type MessageActionKey =
  | 'copy'
  | 'delete'
  | 'revoke'
  | 'reply'
  | 'resend'
  | 'forward'
  | 'pin'
  | 'collect'
type BatchForwardMode = 'serial' | 'merged'

function getMessageActionItems(
  message: V2NIMMessage,
  currentUserId: string | null,
  t: ReturnType<typeof useAppTranslation>['t']
) {
  const isSelf = message.senderId === currentUserId
  const isTextMessage = message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_TEXT
  const isAntispamBlocked = messageStore.isAntispamBlocked(message)
  const isPendingOrFailed =
    message.sendingState === V2NIMMessageSendingState.V2NIM_MESSAGE_SENDING_STATE_SENDING ||
    message.sendingState === V2NIMMessageSendingState.V2NIM_MESSAGE_SENDING_STATE_FAILED
  const limitedActionMessage =
    message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_CALL ||
    isUnknownMessage(message) ||
    isAntispamBlocked ||
    isPendingOrFailed
  const canCopy = isTextMessage
  const canRevoke =
    !limitedActionMessage &&
    isSelf &&
    message.sendingState === V2NIMMessageSendingState.V2NIM_MESSAGE_SENDING_STATE_SUCCEEDED
  const canReply =
    !limitedActionMessage &&
    message.messageType !== V2NIMMessageType.V2NIM_MESSAGE_TYPE_NOTIFICATION &&
    message.messageType !== V2NIMMessageType.V2NIM_MESSAGE_TYPE_TIPS &&
    !messageStore.getRevokedText(message)
  const canForward =
    !limitedActionMessage && isForwardableMessage(message, messageStore.getRevokedText(message))
  const canPin =
    canReply &&
    message.sendingState === V2NIMMessageSendingState.V2NIM_MESSAGE_SENDING_STATE_SUCCEEDED
  const canCollect = canPin
  const canResend =
    !isAntispamBlocked &&
    !limitedActionMessage &&
    isSelf &&
    message.sendingState === V2NIMMessageSendingState.V2NIM_MESSAGE_SENDING_STATE_FAILED

  return [
    canCopy
      ? { key: 'copy' as const, label: t('chatActionCopy'), icon: 'icon-fuzhi1' as const }
      : null,
    canReply
      ? { key: 'reply' as const, label: t('chatActionReply'), icon: 'icon-huifu' as const }
      : null,
    canForward
      ? { key: 'forward' as const, label: t('chatActionForward'), icon: 'icon-zhuanfa' as const }
      : null,
    canPin
      ? {
          key: 'pin' as const,
          label: messageStore.isMessagePinned(message) ? t('chatActionUnpin') : t('chatActionPin'),
          icon: messageStore.isMessagePinned(message)
            ? ('icon-pin' as const)
            : ('icon-pin' as const)
        }
      : null,
    { key: 'multi' as const, label: t('chatActionMultiSelect'), icon: 'icon-duoxuan' as const },
    canCollect
      ? {
          key: 'collect' as const,
          label: t('chatActionCollect'),
          icon: 'icon-collection' as const
        }
      : null,
    canResend ? { key: 'resend' as const, label: t('chatActionResend') } : null,
    {
      key: 'delete' as const,
      label: t('commonDelete'),
      destructive: true,
      icon: 'icon-shanchu' as const
    },
    canRevoke
      ? { key: 'revoke' as const, label: t('chatActionRevoke'), icon: 'icon-chehui' as const }
      : null
  ].filter(Boolean) as {
    key: MessageActionKey | 'multi'
    label: string
    icon?: React.ComponentProps<typeof UIKitChatActionGrid>['items'][number]['icon']
    destructive?: boolean
  }[]
}

const ChatScreen = observer(() => {
  const { t } = useAppTranslation()
  const [inputText, setInputText] = useState('')
  const [isSendingTextMessage, setIsSendingTextMessage] = useState(false)
  const [mentionDraft, setMentionDraft] = useState<MentionDraft>({})
  const [mentionSelectorVisible, setMentionSelectorVisible] = useState(false)
  const [pendingMentionSelectionStart, setPendingMentionSelectionStart] = useState<number | null>(
    null
  )
  const [composerMode, setComposerMode] = useState<'text' | 'voice'>('text')
  const [panelVisible, setPanelVisible] = useState(false)
  const [emojiPanelVisible, setEmojiPanelVisible] = useState(false)
  const [actionContext, setActionContext] = useState<UIKitChatMessageLongPressContext | null>(null)
  const [replyDraft, setReplyDraft] = useState<ReplyDraft | null>(null)
  const [inputSelection, setInputSelection] = useState({ start: 0, end: 0 })
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([])
  const [hiddenReeditMessageIds, setHiddenReeditMessageIds] = useState<string[]>([])
  const [downloadedVideoMap, setDownloadedVideoMap] = useState<Record<string, string>>({})
  const [downloadingVideoIds, setDownloadingVideoIds] = useState<string[]>([])
  const [videoDownloadProgressMap, setVideoDownloadProgressMap] = useState<Record<string, number>>(
    {}
  )
  const [downloadedFileMap, setDownloadedFileMap] = useState<Record<string, string>>({})
  const [downloadingFileIds, setDownloadingFileIds] = useState<string[]>([])
  const [fileDownloadProgressMap, setFileDownloadProgressMap] = useState<Record<string, number>>({})
  const [isNearBottom, setIsNearBottom] = useState(true)
  const [listAutoFollowEnabled, setListAutoFollowEnabled] = useState(true)
  const [showScrollBottomShortcut, setShowScrollBottomShortcut] = useState(false)
  const [scrollBottomShortcutCount, setScrollBottomShortcutCount] = useState(0)
  const [newMessageNoticeKeySet, setNewMessageNoticeKeySetState] = useState<Set<string>>(
    () => new Set()
  )
  const [deferredLatestMessageKeys, setDeferredLatestMessageKeysState] = useState<Set<string>>(
    () => new Set()
  )
  const [composerToastMessage, setComposerToastMessage] = useState('')
  const [securityTipDismissed, setSecurityTipDismissed] = useState(false)
  const [recordingBusy, setRecordingBusy] = useState(false)
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null)
  const [voiceAutoSending, setVoiceAutoSending] = useState(false)
  const [voiceCancelHintVisible, setVoiceCancelHintVisible] = useState(false)
  const [isPeerTyping, setIsPeerTyping] = useState(false)
  const [androidKeyboardInset, setAndroidKeyboardInset] = useState(0)
  const [limitedMediaPickerVisible, setLimitedMediaPickerVisible] = useState(false)
  const [limitedMediaAssets, setLimitedMediaAssets] = useState<MediaLibrary.Asset[]>([])
  const [limitedMediaSelectedAssetIds, setLimitedMediaSelectedAssetIds] = useState<string[]>([])
  const [limitedMediaLoading, setLimitedMediaLoading] = useState(false)
  const [limitedMediaLoadingMore, setLimitedMediaLoadingMore] = useState(false)
  const [limitedMediaHasNextPage, setLimitedMediaHasNextPage] = useState(false)
  const [limitedMediaEndCursor, setLimitedMediaEndCursor] = useState<string | null>(null)
  const [limitedMediaSendMode, setLimitedMediaSendMode] = useState<LimitedMediaSendMode>('media')
  const [limitedMediaAccessLimited, setLimitedMediaAccessLimited] = useState(false)
  const [limitedMediaPickerRevision, setLimitedMediaPickerRevision] = useState(0)
  const [limitedMediaThumbnailUriMap, setLimitedMediaThumbnailUriMap] = useState<
    Record<string, string>
  >({})
  const [limitedMediaVisibleVideoIdSet, setLimitedMediaVisibleVideoIdSet] = useState<Set<string>>(
    () => new Set()
  )
  const audioRecorder = useAudioRecorder(VOICE_RECORDING_PRESET)
  const recorderState = useAudioRecorderState(audioRecorder, 250)
  const messageScrollRef = useRef<FlatList<TimelineItem>>(null)
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<TextInput>(null)
  const inputFocusedRef = useRef(false)
  const focusedRef = useRef(false)
  const appStateRef = useRef<AppStateStatus>(AppState.currentState)
  const externalChatSurfaceActiveRef = useRef(false)
  const limitedMediaPickerVisibleRef = useRef(false)
  const isPickingMediaRef = useRef(false)
  const nativeCameraActionSelectedRef = useRef(false)
  const voiceRecordingActiveRef = useRef(false)
  const voiceRecordingStartedAtRef = useRef<number | null>(null)
  const voiceRecordingStartingRef = useRef(false)
  const voiceRecordingStoppingRef = useRef(false)
  const voicePendingStopRef = useRef<boolean | null>(null)
  const voiceTouchCancelledRef = useRef(false)
  const voiceRecordingTraceIdRef = useRef<string | null>(null)
  const voiceLastTouchLocationRef = useRef<{ locationX: number; locationY: number } | null>(null)
  const hasUserScrolledRef = useRef(false)
  const isBrowsingHistoryRef = useRef(false)
  const isNearBottomRef = useRef(true)
  const listAutoFollowEnabledRef = useRef(true)
  const lastMessageCountRef = useRef(0)
  const lastLatestMessageKeyRef = useRef<string | null>(null)
  const pendingBatchDeleteBottomAlignmentRef = useRef(false)
  const pendingBatchDeleteLatestMessageKeyRef = useRef<string | null>(null)
  const batchDeleteBottomAlignmentExpiryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  )
  const hasInitialBottomAlignedRef = useRef(false)
  const pendingInitialBottomRef = useRef(false)
  const initialBottomRetryTimersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const keyboardBottomRetryTimersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const loadingMoreTriggeredRef = useRef(false)
  const pausedTimelineMessageCountRef = useRef<number | null>(null)
  const pausedTimelineScrollOffsetRef = useRef<number | null>(null)
  const deferredLatestMessageKeySetRef = useRef<Set<string>>(new Set())
  const deferredRevealScrollOffsetRef = useRef<number | null>(null)
  const wasLatestReadableBeforeBackgroundRef = useRef(false)
  const pendingForegroundReadReceiptConversationIdRef = useRef<string | null>(null)
  const pendingOutgoingImageBottomSettleMessageKeyRef = useRef<string | null>(null)
  const scrollBottomShortcutCountRef = useRef(0)
  const newMessageNoticeKeySetRef = useRef<Set<string>>(new Set())
  const lastMessageListScrollOffsetRef = useRef(0)
  const forceLatestScrollUntilSettledRef = useRef(false)
  const forceLatestScrollRetryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const peerTypingResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const selfTypingIdleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const composerToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const selfTypingActiveRef = useRef(false)
  const pendingKeyboardBottomAlignmentRef = useRef(false)
  const unavailableTeamHandledRef = useRef<string | null>(null)
  const limitedMediaLoadingRef = useRef(false)
  const limitedMediaPermissionRefreshPendingRef = useRef(false)
  const limitedMediaPermissionRefreshRunningRef = useRef(false)
  const limitedMediaKnownScopeIdsRef = useRef<Set<string> | null>(null)
  const limitedMediaScopeExpansionInProgressRef = useRef(false)
  const prefetchedLimitedMediaCountRef = useRef(0)
  const limitedMediaEndReachedDuringMomentumRef = useRef(false)
  const limitedMediaThumbnailTaskIdRef = useRef(0)
  const limitedMediaThumbnailFailedIdSetRef = useRef<Set<string>>(new Set())
  const visibleMentionProfileAccountIdsRef = useRef<Set<string>>(new Set())
  const voiceWaveAnimation = useRef(new Animated.Value(0)).current
  const headerHeight = useHeaderHeight()
  const navigation = useNavigation()
  const navigationRef = useRef(navigation)
  const textSendLockRef = useRef(false)
  const insets = useSafeAreaInsets()
  const { width: windowWidth, height: windowHeight } = useWindowDimensions()
  navigationRef.current = navigation
  const { runWithNavigationLock, isNavigationLocked, resetNavigationLock } = useNavigationLock()
  const { playingAudioMessageId, playAudioMessage, stopAudioPlayback } = useMessageAudioPlayback({
    playFailedTitle: t('chatAudioPlayFailedTitle'),
    unavailable: t('chatAudioUnavailable'),
    playFailed: t('chatAudioPlayFailed')
  })

  const { id } = useLocalSearchParams()
  const conversationId = typeof id === 'string' ? id : ''
  const conversation =
    imStoreV2Bridge.getConversation(conversationId) ||
    conversationStore.getConversation(conversationId)
  const currentUserId = nimStore.getLoginUser()
  scrollBottomShortcutCountRef.current = scrollBottomShortcutCount
  const messageState = messageStore.getConversationMessages(conversationId)
  const messageCountRef = useRef(messageState.list.length)
  messageCountRef.current = messageState.list.length
  const isAuthenticated = authStore.isAuthenticated
  const loginStatus = authStore.loginStatus
  const isIMSendReady = nimStore.isLoggedIn() && nimStore.isConnected()
  const conversationType =
    nimStore.nim?.V2NIMConversationIdUtil.parseConversationType(conversationId)
  const targetId = nimStore.nim?.V2NIMConversationIdUtil.parseConversationTargetId(conversationId)
  useEffect(() => {
    if (!conversationId || !imStoreV2Bridge.preferCloudConversation || loginStatus !== 1) {
      return
    }

    imStoreV2Bridge.ensureCloudConversation(conversationId).catch((error) => {
      console.log('[ChatScreen] ensure cloud conversation failed', {
        conversationId,
        message: error instanceof Error ? error.message : String(error)
      })
    })
  }, [conversationId, loginStatus])
  const shouldIgnoreTransientTeamUnavailable = useCallback(() => {
    return (
      conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM &&
      teamStore.isRecentlyJoinedTeam(targetId)
    )
  }, [conversationType, targetId])
  const handleUnavailableTeam = useCallback(
    (message = TEAM_UNAVAILABLE_TIP(), options: { force?: boolean } = {}) => {
      if (!options.force && shouldIgnoreTransientTeamUnavailable()) {
        return
      }

      if (conversationStore.isTeamExitInProgress(conversationId)) {
        return
      }

      if (unavailableTeamHandledRef.current === conversationId) {
        return
      }

      unavailableTeamHandledRef.current = conversationId
      conversationStore.removeTeamConversationLocally(conversationId)
      imStoreV2Bridge.removeTeamConversationLocally(conversationId)

      Alert.alert(
        t('commonTip'),
        message,
        [
          {
            text: t('actionConfirm'),
            onPress: () => {
              imStoreV2Bridge.deleteActiveConversation(conversationId).finally(() => {
                conversationStore.deleteConversation(conversationId, true).finally(() => {
                  router.replace('/(tabs)' as never)
                })
              })
            }
          }
        ],
        { cancelable: false }
      )
    },
    [conversationId, shouldIgnoreTransientTeamUnavailable, t]
  )
  const aiUsers = imStoreV2Bridge.aiUsers
  const aiUserCount = aiUsers.length
  const [mentionAIUsersReady, setMentionAIUsersReady] = useState(false)
  const aiUserAccountIds = useMemo(() => {
    return new Set(aiUsers.map((item) => item.accountId).filter(Boolean))
  }, [aiUsers])
  const limitedMediaTileSize = useMemo(() => {
    return Math.floor((windowWidth - 16 * 2 - 4 * 2) / 3)
  }, [windowWidth])
  const limitedMediaPickerItems = useMemo<LimitedMediaPickerItem[]>(() => {
    const assetItems = limitedMediaAssets.map((asset) => ({
      type: 'asset' as const,
      asset
    }))

    if (!limitedMediaAccessLimited) {
      return assetItems
    }

    return [{ type: 'add-more' as const }, ...assetItems]
  }, [limitedMediaAccessLimited, limitedMediaAssets])
  const limitedMediaAssetMap = useMemo(() => {
    return new Map(limitedMediaAssets.map((asset) => [asset.id, asset]))
  }, [limitedMediaAssets])
  const limitedMediaSelectedAssets = useMemo(() => {
    return limitedMediaSelectedAssetIds
      .map((assetId) => limitedMediaAssetMap.get(assetId))
      .filter(Boolean) as MediaLibrary.Asset[]
  }, [limitedMediaAssetMap, limitedMediaSelectedAssetIds])
  const limitedMediaSelectedIdSet = useMemo(
    () => new Set(limitedMediaSelectedAssetIds),
    [limitedMediaSelectedAssetIds]
  )
  const limitedMediaSelectionOrderMap = useMemo(
    () =>
      new Map(limitedMediaSelectedAssetIds.map((assetId, index) => [assetId, index + 1] as const)),
    [limitedMediaSelectedAssetIds]
  )
  const limitedMediaSelectionType = useMemo<LimitedMediaSelectionType | null>(() => {
    const firstAsset = limitedMediaSelectedAssets[0]

    if (!firstAsset) {
      return null
    }

    return isLimitedMediaVideo(firstAsset) ? 'video' : 'image'
  }, [limitedMediaSelectedAssets])
  const isLimitedMediaSelectionAtLimit =
    limitedMediaSelectedAssetIds.length >= MAX_MEDIA_SELECTION_COUNT
  const isLimitedMediaVideoSelectionAtLimit =
    limitedMediaSelectionType === 'video' &&
    limitedMediaSelectedAssetIds.length >= MAX_VIDEO_SELECTION_COUNT

  const isLimitedMediaAssetDisabled = useCallback(
    (asset: MediaLibrary.Asset) => {
      if (limitedMediaSendMode === 'file') {
        return isLimitedMediaSelectionAtLimit
      }

      const assetType: LimitedMediaSelectionType = isLimitedMediaVideo(asset) ? 'video' : 'image'

      if (limitedMediaSelectionType && limitedMediaSelectionType !== assetType) {
        return true
      }

      if (isLimitedMediaSelectionAtLimit) {
        return true
      }

      return assetType === 'video' && isLimitedMediaVideoSelectionAtLimit
    },
    [
      isLimitedMediaSelectionAtLimit,
      isLimitedMediaVideoSelectionAtLimit,
      limitedMediaSelectionType,
      limitedMediaSendMode
    ]
  )
  const limitedMediaDisabledIdSet = useMemo(() => {
    if (limitedMediaSendMode === 'file' && !isLimitedMediaSelectionAtLimit) {
      return new Set<string>()
    }

    if (!limitedMediaSelectionType && !isLimitedMediaSelectionAtLimit) {
      return new Set<string>()
    }

    return new Set(
      limitedMediaAssets
        .filter((asset) => !limitedMediaSelectedIdSet.has(asset.id))
        .filter((asset) => isLimitedMediaAssetDisabled(asset))
        .map((asset) => asset.id)
    )
  }, [
    isLimitedMediaAssetDisabled,
    isLimitedMediaSelectionAtLimit,
    limitedMediaAssets,
    limitedMediaSelectedIdSet,
    limitedMediaSelectionType,
    limitedMediaSendMode
  ])
  const limitedMediaGridRowHeight = limitedMediaTileSize + 4
  const getLimitedMediaItemLayout = useCallback(
    (_: ArrayLike<LimitedMediaPickerItem> | null | undefined, index: number) => {
      return {
        length: limitedMediaGridRowHeight,
        offset: Math.floor(index / 3) * limitedMediaGridRowHeight,
        index
      }
    },
    [limitedMediaGridRowHeight]
  )
  const limitedMediaGridExtraData = useMemo(
    () => ({
      disabledIds: limitedMediaDisabledIdSet,
      selectedIds: limitedMediaSelectedIdSet,
      selectionOrders: limitedMediaSelectionOrderMap,
      thumbnailUris: limitedMediaThumbnailUriMap
    }),
    [
      limitedMediaDisabledIdSet,
      limitedMediaSelectedIdSet,
      limitedMediaSelectionOrderMap,
      limitedMediaThumbnailUriMap
    ]
  )

  useEffect(() => {
    if (!limitedMediaPickerVisible || limitedMediaAssets.length === 0) {
      return
    }

    const pendingAssets = limitedMediaAssets
      .filter((asset) => isLimitedMediaVideo(asset))
      .filter((asset) => !limitedMediaThumbnailUriMap[asset.id])
      .filter((asset) => !limitedMediaThumbnailFailedIdSetRef.current.has(asset.id))
      .sort((left, right) => {
        const leftVisible = limitedMediaVisibleVideoIdSet.has(left.id)
        const rightVisible = limitedMediaVisibleVideoIdSet.has(right.id)

        if (leftVisible === rightVisible) {
          return 0
        }

        return leftVisible ? -1 : 1
      })
      .slice(0, LIMITED_MEDIA_THUMBNAIL_BATCH_SIZE)

    if (pendingAssets.length === 0) {
      return
    }

    const taskId = limitedMediaThumbnailTaskIdRef.current + 1
    limitedMediaThumbnailTaskIdRef.current = taskId
    let cancelled = false

    const generateThumbnails = async () => {
      const nextThumbnailUris: Record<string, string> = {}

      for (const asset of pendingAssets) {
        if (cancelled || limitedMediaThumbnailTaskIdRef.current !== taskId) {
          return
        }

        try {
          const thumbnailUri = await createLimitedMediaPreviewSource(asset)

          if (thumbnailUri) {
            nextThumbnailUris[asset.id] = thumbnailUri
          } else {
            limitedMediaThumbnailFailedIdSetRef.current.add(asset.id)
          }
        } catch (error) {
          limitedMediaThumbnailFailedIdSetRef.current.add(asset.id)
          console.warn('[ChatScreen] create limited media preview source failed', {
            assetId: asset.id,
            mediaType: asset.mediaType,
            error: error instanceof Error ? error.message : String(error)
          })
        }
      }

      if (!cancelled && limitedMediaThumbnailTaskIdRef.current === taskId) {
        setLimitedMediaThumbnailUriMap((currentMap) => ({
          ...currentMap,
          ...nextThumbnailUris
        }))
      }
    }

    generateThumbnails().catch(() => undefined)

    return () => {
      cancelled = true
    }
  }, [
    limitedMediaAssets,
    limitedMediaPickerVisible,
    limitedMediaThumbnailUriMap,
    limitedMediaVisibleVideoIdSet
  ])

  const clearPeerTypingResetTimer = useCallback(() => {
    if (peerTypingResetTimerRef.current) {
      clearTimeout(peerTypingResetTimerRef.current)
      peerTypingResetTimerRef.current = null
    }
  }, [])

  const clearSelfTypingIdleTimer = useCallback(() => {
    if (selfTypingIdleTimerRef.current) {
      clearTimeout(selfTypingIdleTimerRef.current)
      selfTypingIdleTimerRef.current = null
    }
  }, [])

  const sendTypingNotification = useCallback(
    async (isTyping: boolean) => {
      if (
        !nimStore.nim?.V2NIMNotificationService ||
        conversationType !== V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P ||
        !conversationId
      ) {
        return
      }

      try {
        await nimStore.nim.V2NIMNotificationService.sendCustomNotification(
          conversationId,
          JSON.stringify({ [TYPING_NOTIFICATION_KEY]: isTyping ? 1 : 0 }),
          {
            pushConfig: {
              pushEnabled: false,
              forcePushAccountIds: []
            },
            notificationConfig: {
              unreadEnabled: false,
              offlineEnabled: false
            },
            routeConfig: {
              routeEnabled: false
            }
          }
        )
      } catch {
        // Ignore typing-state send failures so they do not affect the chat flow.
      }
    },
    [conversationId, conversationType]
  )

  const stopSelfTyping = useCallback(() => {
    clearSelfTypingIdleTimer()

    if (!selfTypingActiveRef.current) {
      return
    }

    selfTypingActiveRef.current = false
    sendTypingNotification(false).catch(() => undefined)
  }, [clearSelfTypingIdleTimer, sendTypingNotification])

  const startSelfTyping = useCallback(() => {
    if (conversationType !== V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P) {
      return
    }

    if (!selfTypingActiveRef.current) {
      selfTypingActiveRef.current = true
    }

    sendTypingNotification(true).catch(() => undefined)
    clearSelfTypingIdleTimer()
    selfTypingIdleTimerRef.current = setTimeout(() => {
      selfTypingActiveRef.current = false
      selfTypingIdleTimerRef.current = null
      sendTypingNotification(false).catch(() => undefined)
    }, TYPING_NOTIFICATION_IDLE_MS)
  }, [clearSelfTypingIdleTimer, conversationType, sendTypingNotification])

  const setNewMessageNoticeKeys = useCallback((nextKeys: Set<string>) => {
    newMessageNoticeKeySetRef.current = nextKeys
    scrollBottomShortcutCountRef.current = nextKeys.size
    setNewMessageNoticeKeySetState(nextKeys)
    setScrollBottomShortcutCount(nextKeys.size)
    setShowScrollBottomShortcut(
      nextKeys.size > 0 ||
        deferredLatestMessageKeySetRef.current.size > 0 ||
        (!isNearBottomRef.current && isBrowsingHistoryRef.current)
    )
  }, [])

  const setDeferredLatestMessageKeys = useCallback((nextKeys: Set<string>) => {
    deferredLatestMessageKeySetRef.current = nextKeys
    setDeferredLatestMessageKeysState(nextKeys)
    setShowScrollBottomShortcut(
      nextKeys.size > 0 ||
        newMessageNoticeKeySetRef.current.size > 0 ||
        (!isNearBottomRef.current && isBrowsingHistoryRef.current)
    )
  }, [])

  const isChatLatestReadable = useCallback(() => {
    return (
      focusedRef.current &&
      appStateRef.current === 'active' &&
      !externalChatSurfaceActiveRef.current &&
      !limitedMediaPickerVisibleRef.current &&
      pausedTimelineMessageCountRef.current === null &&
      isNearBottomRef.current &&
      !isBrowsingHistoryRef.current &&
      newMessageNoticeKeySetRef.current.size === 0 &&
      scrollBottomShortcutCountRef.current === 0
    )
  }, [])

  const pauseLatestMessagePresentation = useCallback(() => {
    if (pausedTimelineMessageCountRef.current === null) {
      pausedTimelineMessageCountRef.current = messageCountRef.current
    }
    if (pausedTimelineScrollOffsetRef.current === null) {
      pausedTimelineScrollOffsetRef.current = lastMessageListScrollOffsetRef.current
    }
    listAutoFollowEnabledRef.current = false
    setListAutoFollowEnabled(false)
  }, [])

  const restoreLatestMessageAutoFollow = useCallback(() => {
    if (
      pausedTimelineMessageCountRef.current === messageCountRef.current &&
      newMessageNoticeKeySetRef.current.size === 0
    ) {
      pausedTimelineMessageCountRef.current = null
      pausedTimelineScrollOffsetRef.current = null
      listAutoFollowEnabledRef.current = true
      setListAutoFollowEnabled(true)
    }
  }, [])

  const revealDeferredLatestMessages = useCallback(() => {
    setDeferredLatestMessageKeys(new Set())
    pausedTimelineMessageCountRef.current = null
    pausedTimelineScrollOffsetRef.current = null
    deferredRevealScrollOffsetRef.current = null
  }, [setDeferredLatestMessageKeys])

  const revealNextDeferredLatestMessage = useCallback(() => {
    const currentDeferredKeys = deferredLatestMessageKeySetRef.current

    if (currentDeferredKeys.size === 0) {
      deferredRevealScrollOffsetRef.current = null
      return false
    }

    const nextDeferredKeys = new Set(currentDeferredKeys)
    let revealed = false

    for (const message of messageState.list) {
      const messageKey = getMessageKey(message)

      if (!messageKey || !nextDeferredKeys.has(messageKey)) {
        continue
      }

      nextDeferredKeys.delete(messageKey)
      revealed = true
      break
    }

    if (!revealed) {
      deferredRevealScrollOffsetRef.current = null
      return false
    }

    pausedTimelineMessageCountRef.current = null
    pausedTimelineScrollOffsetRef.current = null
    setDeferredLatestMessageKeys(nextDeferredKeys)

    if (nextDeferredKeys.size === 0) {
      deferredRevealScrollOffsetRef.current = null
    }

    return true
  }, [messageState.list, setDeferredLatestMessageKeys])

  const sendLatestReadReceipts = useCallback(async (targetConversationId: string) => {
    await nimStore.waitForSendReady()
    const result = await messageStore.sendChatReadReceipts(targetConversationId, {
      bypassActiveConversation: true
    })
    await imStoreV2Bridge.clearUnread(targetConversationId)
    return result
  }, [])

  const flushPendingLatestReadReceipts = useCallback(
    (targetConversationId?: string | null) => {
      const pendingConversationId =
        targetConversationId || pendingForegroundReadReceiptConversationIdRef.current

      if (!pendingConversationId || pendingConversationId !== conversationId) {
        return
      }

      if (!nimStore.isLoggedIn() || !nimStore.isConnected()) {
        pendingForegroundReadReceiptConversationIdRef.current = pendingConversationId
        return
      }

      sendLatestReadReceipts(pendingConversationId)
        .then((result) => {
          if (result.sent || result.incomingCount > 0) {
            pendingForegroundReadReceiptConversationIdRef.current = null
          } else {
            pendingForegroundReadReceiptConversationIdRef.current = pendingConversationId
          }
        })
        .catch(() => {
          pendingForegroundReadReceiptConversationIdRef.current = pendingConversationId
        })
    },
    [conversationId, sendLatestReadReceipts]
  )

  const clearComposerToast = useCallback(() => {
    if (composerToastTimerRef.current) {
      clearTimeout(composerToastTimerRef.current)
      composerToastTimerRef.current = null
    }

    setComposerToastMessage('')
  }, [])

  const showComposerToast = useCallback((message: string, duration = 2000) => {
    const normalizedMessage = `${message || ''}`.trim()

    if (!normalizedMessage) {
      return
    }

    if (composerToastTimerRef.current) {
      clearTimeout(composerToastTimerRef.current)
    }

    setComposerToastMessage(normalizedMessage)
    composerToastTimerRef.current = setTimeout(() => {
      composerToastTimerRef.current = null
      setComposerToastMessage('')
    }, duration)
  }, [])

  useEffect(() => {
    initialBottomRetryTimersRef.current.forEach((timer) => clearTimeout(timer))
    initialBottomRetryTimersRef.current = []
    keyboardBottomRetryTimersRef.current.forEach((timer) => clearTimeout(timer))
    keyboardBottomRetryTimersRef.current = []
    clearPeerTypingResetTimer()
    clearSelfTypingIdleTimer()
    clearComposerToast()
    selfTypingActiveRef.current = false
    stopAudioPlayback()
    if (forceLatestScrollRetryTimerRef.current) {
      clearTimeout(forceLatestScrollRetryTimerRef.current)
      forceLatestScrollRetryTimerRef.current = null
    }
    forceLatestScrollUntilSettledRef.current = false
    externalChatSurfaceActiveRef.current = false
    limitedMediaPickerVisibleRef.current = false
    hasUserScrolledRef.current = false
    isBrowsingHistoryRef.current = false
    isNearBottomRef.current = true
    listAutoFollowEnabledRef.current = true
    lastMessageCountRef.current = 0
    lastLatestMessageKeyRef.current = null
    pendingBatchDeleteBottomAlignmentRef.current = false
    pendingBatchDeleteLatestMessageKeyRef.current = null
    if (batchDeleteBottomAlignmentExpiryTimerRef.current) {
      clearTimeout(batchDeleteBottomAlignmentExpiryTimerRef.current)
      batchDeleteBottomAlignmentExpiryTimerRef.current = null
    }
    hasInitialBottomAlignedRef.current = false
    pendingInitialBottomRef.current = false
    pendingKeyboardBottomAlignmentRef.current = false
    loadingMoreTriggeredRef.current = false
    pausedTimelineMessageCountRef.current = null
    pausedTimelineScrollOffsetRef.current = null
    setDeferredLatestMessageKeys(new Set())
    wasLatestReadableBeforeBackgroundRef.current = false
    pendingForegroundReadReceiptConversationIdRef.current = null
    pendingOutgoingImageBottomSettleMessageKeyRef.current = null
    lastMessageListScrollOffsetRef.current = 0
    setIsNearBottom(true)
    setListAutoFollowEnabled(true)
    setNewMessageNoticeKeys(new Set())
    setPanelVisible(false)
    setEmojiPanelVisible(false)
    setReplyDraft(null)
    setMentionDraft({})
    setMentionSelectorVisible(false)
    setPendingMentionSelectionStart(null)
    setHiddenReeditMessageIds([])
    setSecurityTipDismissed(false)
    setIsPeerTyping(false)
    limitedMediaPickerVisibleRef.current = false
    setLimitedMediaPickerVisible(false)
    setLimitedMediaAssets([])
    setLimitedMediaSelectedAssetIds([])
    setLimitedMediaLoading(false)
    setLimitedMediaLoadingMore(false)
    setLimitedMediaHasNextPage(false)
    setLimitedMediaEndCursor(null)
    setLimitedMediaAccessLimited(false)
    limitedMediaKnownScopeIdsRef.current = null
    limitedMediaScopeExpansionInProgressRef.current = false
    limitedMediaLoadingRef.current = false
    prefetchedLimitedMediaCountRef.current = 0
    resetNavigationLock()
  }, [
    clearComposerToast,
    clearPeerTypingResetTimer,
    clearSelfTypingIdleTimer,
    conversationId,
    resetNavigationLock,
    setDeferredLatestMessageKeys,
    setNewMessageNoticeKeys,
    stopAudioPlayback
  ])

  useEffect(() => {
    if (!limitedMediaPickerVisible || limitedMediaAssets.length === 0) {
      prefetchedLimitedMediaCountRef.current = 0
    }
  }, [limitedMediaAssets.length, limitedMediaPickerVisible])

  useEffect(() => {
    return () => {
      clearPeerTypingResetTimer()
      clearComposerToast()
      if (forceLatestScrollRetryTimerRef.current) {
        clearTimeout(forceLatestScrollRetryTimerRef.current)
        forceLatestScrollRetryTimerRef.current = null
      }
      if (batchDeleteBottomAlignmentExpiryTimerRef.current) {
        clearTimeout(batchDeleteBottomAlignmentExpiryTimerRef.current)
        batchDeleteBottomAlignmentExpiryTimerRef.current = null
      }
      stopSelfTyping()
      stopAudioPlayback()
    }
  }, [clearComposerToast, clearPeerTypingResetTimer, stopAudioPlayback, stopSelfTyping])

  const scrollToBottom = useCallback(
    (animated = true) => {
      if (forceLatestScrollRetryTimerRef.current) {
        clearTimeout(forceLatestScrollRetryTimerRef.current)
        forceLatestScrollRetryTimerRef.current = null
      }
      const hadDeferredLatestMessages = deferredLatestMessageKeySetRef.current.size > 0
      revealDeferredLatestMessages()
      const performScroll = () => {
        messageScrollRef.current?.scrollToOffset({ offset: 0, animated })
      }

      if (hadDeferredLatestMessages) {
        requestAnimationFrame(performScroll)
      } else {
        performScroll()
      }
      isBrowsingHistoryRef.current = false
      isNearBottomRef.current = true
      listAutoFollowEnabledRef.current = true
      setIsNearBottom(true)
      setListAutoFollowEnabled(true)
      setNewMessageNoticeKeys(new Set())
    },
    [revealDeferredLatestMessages, setNewMessageNoticeKeys]
  )

  const alignBottomAfterBatchDelete = useCallback(() => {
    requestAnimationFrame(() => {
      scrollToBottom(false)
    })
  }, [scrollToBottom])

  const settleLatestMessagesAtBottom = useCallback(
    (animated = true) => {
      forceLatestScrollUntilSettledRef.current = true
      scrollToBottom(animated)

      requestAnimationFrame(() => {
        if (!forceLatestScrollUntilSettledRef.current) {
          return
        }

        scrollToBottom(false)
      })

      forceLatestScrollRetryTimerRef.current = setTimeout(() => {
        if (!forceLatestScrollUntilSettledRef.current) {
          return
        }

        requestAnimationFrame(() => {
          scrollToBottom(false)
          forceLatestScrollUntilSettledRef.current = false
          forceLatestScrollRetryTimerRef.current = null
        })
      }, 24)
    },
    [scrollToBottom]
  )

  const clearInitialBottomRetries = useCallback(() => {
    initialBottomRetryTimersRef.current.forEach((timer) => clearTimeout(timer))
    initialBottomRetryTimersRef.current = []
  }, [])

  const clearKeyboardBottomRetries = useCallback(() => {
    keyboardBottomRetryTimersRef.current.forEach((timer) => clearTimeout(timer))
    keyboardBottomRetryTimersRef.current = []
  }, [])

  const shouldAlignBottomForKeyboard = useCallback(() => {
    return (
      isNearBottomRef.current &&
      !isBrowsingHistoryRef.current &&
      listAutoFollowEnabledRef.current &&
      newMessageNoticeKeySetRef.current.size === 0 &&
      scrollBottomShortcutCountRef.current === 0
    )
  }, [])

  const scrollToBottomForComposerInteraction = useCallback(() => {
    clearKeyboardBottomRetries()
    scrollToBottom(false)
    pendingKeyboardBottomAlignmentRef.current = true
    return true
  }, [clearKeyboardBottomRetries, scrollToBottom])

  const finishInitialBottomAlignment = useCallback(() => {
    pendingInitialBottomRef.current = false
    hasInitialBottomAlignedRef.current = true
    lastMessageCountRef.current = messageState.list.length
  }, [messageState.list.length])

  const scheduleInitialBottomAlignment = useCallback(() => {
    if (hasUserScrolledRef.current || messageState.list.length === 0) {
      return
    }

    pendingInitialBottomRef.current = true
    clearInitialBottomRetries()

    const retryDelays = [0, 100, 250, 500, 800]

    retryDelays.forEach((delay, index) => {
      const timer = setTimeout(() => {
        if (!pendingInitialBottomRef.current || hasUserScrolledRef.current) {
          return
        }

        requestAnimationFrame(() => {
          if (!pendingInitialBottomRef.current || hasUserScrolledRef.current) {
            return
          }

          scrollToBottom(false)

          if (index === retryDelays.length - 1) {
            finishInitialBottomAlignment()
          }
        })
      }, delay)

      initialBottomRetryTimersRef.current.push(timer)
    })
  }, [
    clearInitialBottomRetries,
    finishInitialBottomAlignment,
    messageState.list.length,
    scrollToBottom
  ])

  const flushPendingInitialBottom = useCallback(() => {
    if (
      !pendingInitialBottomRef.current ||
      hasUserScrolledRef.current ||
      messageState.list.length === 0
    ) {
      return
    }

    requestAnimationFrame(() => {
      if (!pendingInitialBottomRef.current || hasUserScrolledRef.current) {
        return
      }

      scrollToBottom(false)
    })
  }, [messageState.list.length, scrollToBottom])

  const scheduleKeyboardBottomAlignment = useCallback(() => {
    if (!shouldAlignBottomForKeyboard()) {
      pendingKeyboardBottomAlignmentRef.current = false
      clearKeyboardBottomRetries()
      return
    }

    pendingKeyboardBottomAlignmentRef.current = true
    clearKeyboardBottomRetries()

    const retryDelays = [0, 80, 180, 320]

    retryDelays.forEach((delay) => {
      const timer = setTimeout(() => {
        if (!pendingKeyboardBottomAlignmentRef.current) {
          return
        }

        requestAnimationFrame(() => {
          if (!pendingKeyboardBottomAlignmentRef.current || !shouldAlignBottomForKeyboard()) {
            pendingKeyboardBottomAlignmentRef.current = false
            return
          }

          scrollToBottom(false)
        })
      }, delay)

      keyboardBottomRetryTimersRef.current.push(timer)
    })
  }, [clearKeyboardBottomRetries, scrollToBottom, shouldAlignBottomForKeyboard])

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return
    }

    const showSubscription = Keyboard.addListener('keyboardDidShow', (event) => {
      setAndroidKeyboardInset(Math.max(0, event.endCoordinates.height - insets.bottom))

      if (pendingKeyboardBottomAlignmentRef.current) {
        scheduleKeyboardBottomAlignment()
      }
    })
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setAndroidKeyboardInset(0)
      pendingKeyboardBottomAlignmentRef.current = false
      clearKeyboardBottomRetries()
      inputRef.current?.blur()
    })

    return () => {
      showSubscription.remove()
      hideSubscription.remove()
    }
  }, [clearKeyboardBottomRetries, insets.bottom, scheduleKeyboardBottomAlignment])

  useEffect(() => {
    if (Platform.OS !== 'ios') {
      return
    }

    const showSubscription = Keyboard.addListener('keyboardWillShow', () => {
      if (pendingKeyboardBottomAlignmentRef.current) {
        scheduleKeyboardBottomAlignment()
      }
    })
    const didShowSubscription = Keyboard.addListener('keyboardDidShow', () => {
      if (pendingKeyboardBottomAlignmentRef.current) {
        scheduleKeyboardBottomAlignment()
      }
    })
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      pendingKeyboardBottomAlignmentRef.current = false
      clearKeyboardBottomRetries()
    })

    return () => {
      showSubscription.remove()
      didShowSubscription.remove()
      hideSubscription.remove()
    }
  }, [clearKeyboardBottomRetries, scheduleKeyboardBottomAlignment])

  useEffect(() => {
    if (!currentUserId || messageState.isSync || !conversationId) {
      return
    }

    messageStore.loadHistory(conversationId).catch((error) => {
      if (
        conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM &&
        isTeamUnavailableError(error)
      ) {
        handleUnavailableTeam()
        return
      }

      console.warn('[ChatScreen] load history failed', {
        conversationId,
        error: error instanceof Error ? error.message : String(error)
      })
    })
  }, [conversationId, conversationType, currentUserId, handleUnavailableTeam, messageState.isSync])

  useEffect(() => {
    if (!currentUserId || !conversationId) {
      return
    }

    messageStore.loadPinnedMessages(conversationId).catch(() => undefined)
  }, [conversationId, currentUserId])

  useEffect(() => {
    if (conversationType !== V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM || !targetId) {
      return
    }

    if (currentUserId) {
      teamStore.loadMembersByIds(targetId, [currentUserId]).catch(() => undefined)
    }
    teamStore.preloadMembers(targetId).catch(() => undefined)
  }, [conversationType, currentUserId, targetId])

  useEffect(() => {
    if (conversationId) {
      imStoreV2Bridge.clearUnread(conversationId).catch(() => undefined)
    }
  }, [conversationId])

  const syncActiveConversation = useCallback(() => {
    const activeConversationId = isChatLatestReadable() ? conversationId || null : null

    messageStore.setActiveConversation(activeConversationId)

    if (activeConversationId) {
      imStoreV2Bridge.clearUnread(activeConversationId).catch(() => undefined)
      messageStore.sendChatReadReceipts(activeConversationId).catch(() => undefined)
    }
  }, [conversationId, isChatLatestReadable])
  const pauseChatTimelineVisibility = useCallback(() => {
    pauseLatestMessagePresentation()
    stopAllMessageAudioPlayback()
    externalChatSurfaceActiveRef.current = true
    messageStore.setActiveConversation(null)
  }, [pauseLatestMessagePresentation])

  const resumeChatTimelineVisibility = useCallback(() => {
    requestAnimationFrame(() => {
      restoreLatestMessageAutoFollow()
      externalChatSurfaceActiveRef.current = false
      syncActiveConversation()
    })
  }, [restoreLatestMessageAutoFollow, syncActiveConversation])

  const setLimitedMediaPickerVisibility = useCallback(
    (visible: boolean) => {
      setLimitedMediaPickerVisible(visible)

      if (visible) {
        pauseLatestMessagePresentation()
        limitedMediaPickerVisibleRef.current = true
        messageStore.setActiveConversation(null)
      } else {
        requestAnimationFrame(() => {
          restoreLatestMessageAutoFollow()
          limitedMediaPickerVisibleRef.current = false
          syncActiveConversation()
        })
      }
    },
    [pauseLatestMessagePresentation, restoreLatestMessageAutoFollow, syncActiveConversation]
  )

  useFocusEffect(
    useCallback(() => {
      focusedRef.current = true
      syncActiveConversation()
      requestAnimationFrame(() => {
        if (pausedTimelineMessageCountRef.current === messageCountRef.current) {
          pausedTimelineMessageCountRef.current = null
          syncActiveConversation()
        }
      })

      return () => {
        focusedRef.current = false
        pauseLatestMessagePresentation()
        stopAllMessageAudioPlayback()
        messageStore.setActiveConversation(null)
      }
    }, [pauseLatestMessagePresentation, syncActiveConversation])
  )

  useEffect(() => {
    if (!conversationId || messageState.list.length === 0) {
      return
    }

    if (pendingForegroundReadReceiptConversationIdRef.current === conversationId) {
      flushPendingLatestReadReceipts(conversationId)
    }

    if (
      !focusedRef.current ||
      appStateRef.current !== 'active' ||
      externalChatSurfaceActiveRef.current ||
      limitedMediaPickerVisibleRef.current ||
      !isNearBottomRef.current ||
      isBrowsingHistoryRef.current ||
      newMessageNoticeKeySetRef.current.size > 0 ||
      scrollBottomShortcutCount > 0
    ) {
      return
    }

    messageStore.sendChatReadReceipts(conversationId).catch(() => undefined)
    messageStore.refreshReadState(conversationId).catch(() => undefined)
  }, [
    conversationId,
    flushPendingLatestReadReceipts,
    isNearBottom,
    messageState.list.length,
    newMessageNoticeKeySet.size,
    scrollBottomShortcutCount
  ])

  const visibleMessages = useMemo(() => {
    const latestByKey = new Map<string, V2NIMMessage>()
    const deferredKeys = deferredLatestMessageKeys

    messageState.list.forEach((message) => {
      const messageKey = getMessageKey(message)
      if (!messageKey) {
        return
      }
      if (deferredKeys.has(messageKey)) {
        return
      }

      latestByKey.set(messageKey, message)
    })

    return Array.from(latestByKey.values())
  }, [deferredLatestMessageKeys, messageState.list])
  const replyHydrationSignature = useMemo(
    () =>
      visibleMessages
        .map((message) =>
          message.threadReply
            ? [
                getMessageKey(message),
                message.threadReply.messageClientId || '',
                message.threadReply.messageServerId || ''
              ].join(':')
            : ''
        )
        .filter(Boolean)
        .sort()
        .join('|'),
    [visibleMessages]
  )

  useEffect(() => {
    if (!conversationId || !replyHydrationSignature) {
      return
    }

    messageStore.hydrateMissingReplySources(conversationId, visibleMessages).catch(() => undefined)
  }, [conversationId, replyHydrationSignature, visibleMessages])

  const revokedMapForCurrentConversation = conversationId
    ? messageStore.revokedMessageMap[conversationId]
    : null
  const revokedNoticeKeySignature = revokedMapForCurrentConversation
    ? Object.keys(revokedMapForCurrentConversation).filter(Boolean).sort().join('|')
    : ''
  const revokedNoticeKeySet = useMemo(
    () => new Set(revokedNoticeKeySignature.split('|').filter(Boolean)),
    [revokedNoticeKeySignature]
  )
  const messageListKeySignature = messageState.list
    .map((message) => getMessageKey(message))
    .filter(Boolean)
    .sort()
    .join('|')

  useEffect(() => {
    if (newMessageNoticeKeySetRef.current.size === 0) {
      return
    }

    const messageKeys = new Set(messageState.list.map((message) => getMessageKey(message)))
    const nextNoticeKeys = new Set<string>()

    newMessageNoticeKeySetRef.current.forEach((messageKey) => {
      if (messageKeys.has(messageKey) && !revokedNoticeKeySet.has(messageKey)) {
        nextNoticeKeys.add(messageKey)
      }
    })

    if (nextNoticeKeys.size !== newMessageNoticeKeySetRef.current.size) {
      setNewMessageNoticeKeys(nextNoticeKeys)
    } else {
      setShowScrollBottomShortcut(
        nextNoticeKeys.size > 0 ||
          deferredLatestMessageKeySetRef.current.size > 0 ||
          (!isNearBottomRef.current && isBrowsingHistoryRef.current)
      )
    }
  }, [messageListKeySignature, messageState.list, revokedNoticeKeySet, setNewMessageNoticeKeys])

  useEffect(() => {
    const teamSenderAccountIds =
      conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM
        ? visibleMessages
            .map((message) => getMessageDisplaySenderAccountId(message, aiUserAccountIds))
            .filter((senderId) => !!senderId && senderId !== currentUserId)
        : []
    const aiReplySenderAccountIds =
      conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P
        ? visibleMessages
            .map((message) => getAIReplySenderAccountId(message, aiUserAccountIds))
            .filter((senderId) => !!senderId && senderId !== currentUserId)
        : []
    const accountIds = [
      ...teamSenderAccountIds,
      ...aiReplySenderAccountIds,
      ...visibleMessages.flatMap((message) => getTeamNotificationAccountIds(message))
    ]

    if (accountIds.length === 0) {
      return
    }

    ensureUIKitUserProfiles(accountIds).catch(() => undefined)
  }, [aiUserAccountIds, conversationType, currentUserId, visibleMessages])

  const teamMessageSenderNameSignature =
    conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM && targetId
      ? Array.from(
          new Set(
            visibleMessages
              .map((message) => getMessageDisplaySenderAccountId(message, aiUserAccountIds))
              .filter((senderId) => senderId && senderId !== currentUserId)
          )
        )
          .sort()
          .map((senderId) => {
            const friend = friendStore.friends.get(senderId)
            const teamMember = teamStore
              .getMembers(targetId)
              .find((member) => member.accountId === senderId)
            const user = userStore.users.get(senderId)
            const selfProfile =
              userStore.selfProfile?.accountId === senderId ? userStore.selfProfile : null

            return [
              senderId,
              friend?.alias || '',
              teamMember?.teamNick || '',
              user?.name || '',
              friend?.userProfile?.name || '',
              selfProfile?.name || ''
            ].join(':')
          })
          .join('|')
      : ''
  const aiReplySenderSignature =
    conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P
      ? visibleMessages
          .map((message) => {
            const messageKey = getMessageKey(message)
            const aiSenderAccountId = getAIReplySenderAccountId(message, aiUserAccountIds)

            return aiSenderAccountId ? `${messageKey}:${aiSenderAccountId}` : ''
          })
          .filter(Boolean)
          .join('|')
      : ''
  const messageIdentitySignature = `${teamMessageSenderNameSignature}:${aiReplySenderSignature}`
  const timeline = useMemo<TimelineItem[]>(() => {
    let previousTime: number | null = null
    const nextItems: TimelineItem[] = []

    if (!messageState.hasMore && !messageState.loadingMore && visibleMessages.length > 0) {
      nextItems.push({
        key: 'system-no-more',
        type: 'system',
        label: t('noMoreText' as never)
      })
    }

    visibleMessages.forEach((message) => {
      const currentTime = message.createTime || Date.now()

      if (shouldInsertTimeDivider(previousTime, currentTime)) {
        nextItems.push({
          key: `time-${message.messageClientId}-${currentTime}`,
          type: 'time',
          label: formatTimeLabel(currentTime)
        })
      }

      nextItems.push({
        key: message.messageClientId || message.messageServerId,
        type: 'message',
        message
      })

      const antispamReason = messageStore.getAntispamReason(message)
      const isFailedOutgoingMessage =
        message.senderId === currentUserId &&
        message.sendingState === V2NIMMessageSendingState.V2NIM_MESSAGE_SENDING_STATE_FAILED

      if (isFailedOutgoingMessage && antispamReason) {
        nextItems.push({
          key: `antispam-${getMessageKey(message)}`,
          type: 'antispam',
          label: antispamReason
        })
      }

      previousTime = currentTime
    })

    return nextItems
  }, [currentUserId, messageState.hasMore, messageState.loadingMore, t, visibleMessages])

  const displayTimeline = useMemo(() => [...timeline].reverse(), [timeline])

  useEffect(() => {
    setHighlightedMessageId(null)
  }, [conversationId])

  useEffect(() => {
    const highlightTimer = highlightTimerRef.current

    return () => {
      if (highlightTimer) {
        clearTimeout(highlightTimer)
      }
    }
  }, [])

  useEffect(() => {
    if (
      !conversationId ||
      displayTimeline.length === 0 ||
      hasInitialBottomAlignedRef.current ||
      hasUserScrolledRef.current
    ) {
      return
    }

    scheduleInitialBottomAlignment()

    const timer = setTimeout(() => {
      if (
        hasInitialBottomAlignedRef.current ||
        hasUserScrolledRef.current ||
        displayTimeline.length === 0
      ) {
        return
      }

      scrollToBottom(false)
    }, 100)

    initialBottomRetryTimersRef.current.push(timer)

    return () => {
      clearTimeout(timer)
      initialBottomRetryTimersRef.current = initialBottomRetryTimersRef.current.filter(
        (currentTimer) => currentTimer !== timer
      )
    }
  }, [conversationId, displayTimeline.length, scheduleInitialBottomAlignment, scrollToBottom])

  useLayoutEffect(() => {
    const currentCount = messageState.list.length
    const previousCount = lastMessageCountRef.current
    const latestMessage = messageState.list[currentCount - 1]
    const latestMessageKey = latestMessage ? getMessageKey(latestMessage) : null

    if (currentCount === previousCount) {
      return
    }

    if (currentCount < previousCount) {
      const pendingBatchDeleteLatestMessageKey = pendingBatchDeleteLatestMessageKeyRef.current
      const shouldAlignAfterBatchDelete =
        pendingBatchDeleteBottomAlignmentRef.current &&
        !!pendingBatchDeleteLatestMessageKey &&
        latestMessageKey !== pendingBatchDeleteLatestMessageKey

      lastMessageCountRef.current = currentCount
      lastLatestMessageKeyRef.current = latestMessageKey

      if (shouldAlignAfterBatchDelete) {
        pendingBatchDeleteBottomAlignmentRef.current = false
        pendingBatchDeleteLatestMessageKeyRef.current = null
        if (batchDeleteBottomAlignmentExpiryTimerRef.current) {
          clearTimeout(batchDeleteBottomAlignmentExpiryTimerRef.current)
          batchDeleteBottomAlignmentExpiryTimerRef.current = null
        }
        alignBottomAfterBatchDelete()
      }

      return
    }

    if (previousCount === 0 && !hasInitialBottomAlignedRef.current) {
      lastMessageCountRef.current = currentCount
      lastLatestMessageKeyRef.current = latestMessageKey
      return
    }

    if (latestMessageKey === lastLatestMessageKeyRef.current) {
      lastMessageCountRef.current = currentCount
      lastLatestMessageKeyRef.current = latestMessageKey
      return
    }

    const addedMessages = messageState.list.slice(previousCount)
    const isLocalOutgoingMessage = (message?: V2NIMMessage | null) =>
      !!message &&
      message.senderId === currentUserId &&
      (message.sendingState === V2NIMMessageSendingState.V2NIM_MESSAGE_SENDING_STATE_SENDING ||
        message.sendingState === V2NIMMessageSendingState.V2NIM_MESSAGE_SENDING_STATE_FAILED)
    const isCurrentAccountMessage = (message?: V2NIMMessage | null) =>
      !!message && message.senderId === currentUserId
    const noticeableAddedMessages = addedMessages.filter((item) => !isCurrentAccountMessage(item))
    const noticeableAddedMessageCount = noticeableAddedMessages.length
    const noticeableAddedMessageKeys = noticeableAddedMessages.map((item) => getMessageKey(item))
    const isIncomingLatestMessage =
      !!conversationId && !!latestMessage && latestMessage.senderId !== currentUserId

    if (isIncomingLatestMessage && messageStore.activeConversationId === conversationId) {
      imStoreV2Bridge.clearUnread(conversationId).catch(() => undefined)
    }

    const isLocalOutgoingLatestMessage = isLocalOutgoingMessage(latestMessage)
    const shouldAlignLatestAfterForward =
      !!conversationId &&
      !!latestMessage &&
      latestMessage.senderId === currentUserId &&
      forwardStore.consumeLatestAlignment(conversationId)
    const isOwnLatestImageMessage =
      isLocalOutgoingLatestMessage &&
      latestMessage?.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_IMAGE
    const isChatTimelineReadable =
      focusedRef.current &&
      appStateRef.current === 'active' &&
      !externalChatSurfaceActiveRef.current &&
      !limitedMediaPickerVisibleRef.current
    const pausedMessageCount = pausedTimelineMessageCountRef.current
    const addedWhileTimelinePausedMessages =
      pausedMessageCount === null ? [] : messageState.list.slice(pausedMessageCount)
    const noticeablePausedAddedMessages = addedWhileTimelinePausedMessages.filter(
      (item) => !isCurrentAccountMessage(item)
    )
    const noticeablePausedAddedMessageKeys = noticeablePausedAddedMessages.map((item) =>
      getMessageKey(item)
    )
    const shouldDeferLatestPresentation =
      ((!isChatTimelineReadable && noticeableAddedMessageCount > 0) ||
        noticeablePausedAddedMessages.length > 0) &&
      !isLocalOutgoingLatestMessage
    const shouldPreserveHistoryPosition =
      (isBrowsingHistoryRef.current || shouldDeferLatestPresentation) &&
      (noticeableAddedMessageCount > 0 || noticeablePausedAddedMessages.length > 0) &&
      !isLocalOutgoingLatestMessage &&
      !shouldAlignLatestAfterForward
    const shouldAutoScroll =
      (isChatTimelineReadable || isLocalOutgoingLatestMessage) &&
      (newMessageNoticeKeySetRef.current.size === 0 || isLocalOutgoingLatestMessage) &&
      currentCount > 0 &&
      !shouldPreserveHistoryPosition &&
      (previousCount === 0 ||
        (isNearBottomRef.current && !isBrowsingHistoryRef.current) ||
        isLocalOutgoingLatestMessage ||
        shouldAlignLatestAfterForward)

    pendingOutgoingImageBottomSettleMessageKeyRef.current = isOwnLatestImageMessage
      ? getMessageKey(latestMessage)
      : null
    if (shouldPreserveHistoryPosition) {
      const preservedOffset = pausedTimelineScrollOffsetRef.current
      const nextDeferredKeys = new Set(deferredLatestMessageKeySetRef.current)
      ;[...noticeableAddedMessageKeys, ...noticeablePausedAddedMessageKeys].forEach(
        (messageKey) => {
          if (messageKey) {
            nextDeferredKeys.add(messageKey)
          }
        }
      )
      setDeferredLatestMessageKeys(nextDeferredKeys)
      if (preservedOffset !== null) {
        requestAnimationFrame(() => {
          messageScrollRef.current?.scrollToOffset({ offset: preservedOffset, animated: false })
        })
      }
    } else {
      pausedTimelineMessageCountRef.current = null
      pausedTimelineScrollOffsetRef.current = null
    }

    if (shouldAutoScroll) {
      setNewMessageNoticeKeys(new Set())
      if (!isOwnLatestImageMessage) {
        scrollToBottom(previousCount !== 0 && !shouldAlignLatestAfterForward)
      }
    } else if (noticeableAddedMessageCount > 0) {
      const nextNoticeKeys = new Set(newMessageNoticeKeySetRef.current)
      ;[...noticeableAddedMessageKeys, ...noticeablePausedAddedMessageKeys].forEach(
        (messageKey) => {
          if (messageKey) {
            nextNoticeKeys.add(messageKey)
          }
        }
      )
      setNewMessageNoticeKeys(nextNoticeKeys)
    }

    lastMessageCountRef.current = currentCount
    lastLatestMessageKeyRef.current = latestMessageKey
  }, [
    conversationId,
    currentUserId,
    isNearBottom,
    messageState.list,
    scheduleInitialBottomAlignment,
    setDeferredLatestMessageKeys,
    setNewMessageNoticeKeys,
    alignBottomAfterBatchDelete,
    scrollToBottom
  ])

  useEffect(() => {
    if (!selectionMode) {
      return
    }

    const availableIds = new Set(
      visibleMessages
        .filter((message) => isSelectableMessage(message, messageStore.getRevokedText(message)))
        .map((message) => getMessageKey(message))
    )

    setSelectedMessageIds((current) => current.filter((item) => availableIds.has(item)))
  }, [selectionMode, visibleMessages])

  const clearComposerDraft = useCallback(() => {
    setInputText('')
    setMentionDraft({})
    setReplyDraft(null)
    setInputSelection({ start: 0, end: 0 })
    setPanelVisible(false)
    setEmojiPanelVisible(false)
    setMentionSelectorVisible(false)
    setPendingMentionSelectionStart(null)
  }, [])

  const showSendFailureAlert = useCallback((error: unknown, fallbackMessage: string) => {
    const message = getDisplayErrorMessage(error, fallbackMessage)

    if (!messageStore.shouldSuppressSendFailureAlert(error)) {
      toast.alert(message)
    }

    if (__DEV__) {
      console.warn('[ChatScreen] send failed', {
        fallbackMessage,
        message,
        error
      })
    }
  }, [])

  const loadLimitedMediaAssets = useCallback(
    async (mode: 'reset' | 'append' = 'reset') => {
      if (limitedMediaLoadingRef.current) {
        return null
      }

      if (mode === 'append' && (!limitedMediaHasNextPage || !limitedMediaEndCursor)) {
        return null
      }

      try {
        limitedMediaLoadingRef.current = true

        if (mode === 'reset') {
          setLimitedMediaLoading(true)
        } else {
          setLimitedMediaLoadingMore(true)
        }

        const result = await MediaLibrary.getAssetsAsync({
          first: LIMITED_MEDIA_PAGE_SIZE,
          after: mode === 'append' ? limitedMediaEndCursor || undefined : undefined,
          mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
          sortBy: [
            [MediaLibrary.SortBy.creationTime, false],
            [MediaLibrary.SortBy.modificationTime, false]
          ]
        })
        const knownScopeIds = limitedMediaKnownScopeIdsRef.current
        const nextAssets = result.assets

        setLimitedMediaAssets((currentAssets) =>
          mode === 'append'
            ? mergeLimitedMediaAssets(currentAssets, nextAssets)
            : mergeLimitedMediaAssets([], nextAssets)
        )
        setLimitedMediaHasNextPage(result.hasNextPage)
        setLimitedMediaEndCursor(result.endCursor || null)

        if (Platform.OS === 'ios') {
          if (!limitedMediaAccessLimited) {
            limitedMediaKnownScopeIdsRef.current = null
          } else if (!knownScopeIds || mode === 'reset') {
            limitedMediaKnownScopeIdsRef.current = new Set(nextAssets.map((asset) => asset.id))
          } else if (mode === 'append' && nextAssets.length > 0) {
            nextAssets.forEach((asset) => {
              knownScopeIds.add(asset.id)
            })
          }
        }

        return nextAssets
      } finally {
        limitedMediaLoadingRef.current = false
        setLimitedMediaLoading(false)
        setLimitedMediaLoadingMore(false)
      }
    },
    [limitedMediaAccessLimited, limitedMediaEndCursor, limitedMediaHasNextPage]
  )

  const resetLimitedMediaPickerData = useCallback((options?: { preserveSelection?: boolean }) => {
    setLimitedMediaAssets([])
    if (!options?.preserveSelection) {
      setLimitedMediaSelectedAssetIds([])
    }
    setLimitedMediaThumbnailUriMap({})
    setLimitedMediaVisibleVideoIdSet(new Set())
    setLimitedMediaEndCursor(null)
    setLimitedMediaHasNextPage(false)
    prefetchedLimitedMediaCountRef.current = 0
    limitedMediaEndReachedDuringMomentumRef.current = false
    limitedMediaThumbnailFailedIdSetRef.current = new Set()
    limitedMediaThumbnailTaskIdRef.current += 1
    setLimitedMediaPickerRevision((current) => current + 1)
  }, [])

  const refreshLimitedMediaAssetsAfterPermissionChange = useCallback(async () => {
    if (limitedMediaPermissionRefreshRunningRef.current) {
      return
    }

    limitedMediaPermissionRefreshRunningRef.current = true
    resetLimitedMediaPickerData({ preserveSelection: true })

    try {
      const previousAssetKey = limitedMediaAssets.map((asset) => asset.id).join('|')

      for (let attempt = 0; attempt < 4; attempt += 1) {
        const permission = await getMediaLibraryPermissionState()
        setLimitedMediaAccessLimited(permission.accessPrivileges === 'limited')

        const nextAssets = await loadLimitedMediaAssets('reset')
        const nextAssetKey = (nextAssets || []).map((asset) => asset.id).join('|')

        if (!permission.granted || permission.accessPrivileges !== 'limited') {
          break
        }

        if (!previousAssetKey || nextAssetKey !== previousAssetKey) {
          break
        }

        await waitForLimitedMediaPermissionRefresh()
      }
    } finally {
      limitedMediaPermissionRefreshPendingRef.current = false
      limitedMediaPermissionRefreshRunningRef.current = false
      limitedMediaScopeExpansionInProgressRef.current = false
    }
  }, [limitedMediaAssets, loadLimitedMediaAssets, resetLimitedMediaPickerData])

  useEffect(() => {
    if (Platform.OS !== 'ios' || !limitedMediaPickerVisible || !limitedMediaAccessLimited) {
      return
    }

    const subscription = MediaLibrary.addListener((event) => {
      if (!limitedMediaPickerVisibleRef.current || !limitedMediaAccessLimited) {
        return
      }

      if (__DEV__) {
        console.info('[ChatScreen] media library changed', {
          hasIncrementalChanges: event.hasIncrementalChanges,
          insertedAssetsCount: event.insertedAssets?.length || 0,
          deletedAssetsCount: event.deletedAssets?.length || 0,
          updatedAssetsCount: event.updatedAssets?.length || 0
        })
      }

      refreshLimitedMediaAssetsAfterPermissionChange().catch(() => undefined)
    })

    return () => {
      subscription.remove()
    }
  }, [
    limitedMediaAccessLimited,
    limitedMediaPickerVisible,
    refreshLimitedMediaAssetsAfterPermissionChange
  ])

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      const previousState = appStateRef.current

      if (
        nextState !== 'active' &&
        focusedRef.current &&
        pausedTimelineMessageCountRef.current === null
      ) {
        wasLatestReadableBeforeBackgroundRef.current = isChatLatestReadable()
        pauseLatestMessagePresentation()
      }
      appStateRef.current = nextState

      if (
        previousState !== 'active' &&
        nextState === 'active' &&
        wasLatestReadableBeforeBackgroundRef.current
      ) {
        pausedTimelineMessageCountRef.current = null
        pausedTimelineScrollOffsetRef.current = null
        setDeferredLatestMessageKeys(new Set())
        setNewMessageNoticeKeys(new Set())
        listAutoFollowEnabledRef.current = true
        setListAutoFollowEnabled(true)
        wasLatestReadableBeforeBackgroundRef.current = false
        if (conversationId) {
          pendingForegroundReadReceiptConversationIdRef.current = conversationId
          flushPendingLatestReadReceipts(conversationId)
        }
      }

      syncActiveConversation()

      if (
        nextState === 'active' &&
        limitedMediaPermissionRefreshPendingRef.current &&
        limitedMediaPickerVisibleRef.current
      ) {
        refreshLimitedMediaAssetsAfterPermissionChange().catch(() => undefined)
      }
    })

    return () => {
      subscription.remove()
    }
  }, [
    conversationId,
    flushPendingLatestReadReceipts,
    isChatLatestReadable,
    pauseLatestMessagePresentation,
    refreshLimitedMediaAssetsAfterPermissionChange,
    setDeferredLatestMessageKeys,
    setNewMessageNoticeKeys,
    syncActiveConversation
  ])

  useEffect(() => {
    if (!isIMSendReady) {
      return
    }

    flushPendingLatestReadReceipts()
  }, [flushPendingLatestReadReceipts, isIMSendReady])

  const triggerLimitedMediaPrefetch = useCallback(() => {
    if (limitedMediaLoadingRef.current || limitedMediaLoadingMore) {
      return
    }

    if (prefetchedLimitedMediaCountRef.current === limitedMediaAssets.length) {
      return
    }

    prefetchedLimitedMediaCountRef.current = limitedMediaAssets.length
    loadLimitedMediaAssets('append').catch(() => undefined)
  }, [limitedMediaAssets.length, limitedMediaLoadingMore, loadLimitedMediaAssets])

  const handleLimitedMediaViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken<LimitedMediaPickerItem>[] }) => {
      const nextVisibleVideoIds = new Set(
        viewableItems
          .map((viewableItem) => viewableItem.item)
          .filter(
            (
              item
            ): item is {
              type: 'asset'
              asset: MediaLibrary.Asset
            } => !!item && item.type === 'asset'
          )
          .map((item) => item.asset)
          .filter((asset): asset is MediaLibrary.Asset => !!asset && isLimitedMediaVideo(asset))
          .map((asset) => asset.id)
      )

      setLimitedMediaVisibleVideoIdSet((currentIds) => {
        if (
          currentIds.size === nextVisibleVideoIds.size &&
          Array.from(nextVisibleVideoIds).every((assetId) => currentIds.has(assetId))
        ) {
          return currentIds
        }

        return nextVisibleVideoIds
      })
    }
  ).current

  const limitedMediaViewabilityConfig = useMemo(
    () => ({
      itemVisiblePercentThreshold: 35,
      minimumViewTime: 80
    }),
    []
  )

  const closeLimitedMediaPicker = useCallback(() => {
    setLimitedMediaPickerVisibility(false)
    setLimitedMediaSendMode('media')
    limitedMediaEndReachedDuringMomentumRef.current = false
    limitedMediaThumbnailTaskIdRef.current += 1
  }, [setLimitedMediaPickerVisibility])

  const openLimitedMediaPicker = useCallback(
    async (
      mode: LimitedMediaSendMode = 'media',
      options?: {
        limitedAccess?: boolean
      }
    ) => {
      setLimitedMediaSendMode(mode)
      setLimitedMediaAccessLimited(Boolean(options?.limitedAccess))
      resetLimitedMediaPickerData()
      setLimitedMediaPickerVisibility(true)

      try {
        await clearLimitedMediaThumbnailCacheDir()
        await loadLimitedMediaAssets('reset')
      } catch (error) {
        closeLimitedMediaPicker()
        showSendFailureAlert(
          error,
          mode === 'file' ? t('chatSendFileFailed') : t('chatSendMediaFailed')
        )
      }
    },
    [
      closeLimitedMediaPicker,
      loadLimitedMediaAssets,
      resetLimitedMediaPickerData,
      setLimitedMediaPickerVisibility,
      showSendFailureAlert,
      t
    ]
  )

  const handleAddMoreLimitedMediaAssets = useCallback(async () => {
    try {
      limitedMediaPermissionRefreshPendingRef.current = true
      limitedMediaScopeExpansionInProgressRef.current = true
      stopAllMessageAudioPlayback()
      await MediaLibrary.presentPermissionsPickerAsync(['photo', 'video'])
      await refreshLimitedMediaAssetsAfterPermissionChange()
    } catch {
      limitedMediaPermissionRefreshPendingRef.current = false
      limitedMediaScopeExpansionInProgressRef.current = false
      toast.alert(t('commonPermissionDenied'), t('chatLimitedPhotoAccessUnsupported'))
    }
  }, [refreshLimitedMediaAssetsAfterPermissionChange, t])

  const toggleLimitedMediaSelection = useCallback(
    (asset: MediaLibrary.Asset) => {
      setLimitedMediaSelectedAssetIds((currentIds) => {
        const existingIndex = currentIds.indexOf(asset.id)

        if (existingIndex >= 0) {
          return currentIds.filter((item) => item !== asset.id)
        }

        if (currentIds.length >= MAX_MEDIA_SELECTION_COUNT) {
          showComposerToast(
            t('chatSelectMediaUpToCount', {
              count: MAX_MEDIA_SELECTION_COUNT
            })
          )
          return currentIds
        }

        const nextSelectionType = isLimitedMediaVideo(asset) ? 'video' : 'image'

        if (limitedMediaSendMode === 'file') {
          return [...currentIds, asset.id]
        }

        if (limitedMediaSelectionType && limitedMediaSelectionType !== nextSelectionType) {
          showComposerToast(t('chatMixedMediaUnsupported'))
          return currentIds
        }

        if (nextSelectionType === 'video' && currentIds.length >= MAX_VIDEO_SELECTION_COUNT) {
          showComposerToast(t('chatSingleVideoOnly'))
          return currentIds
        }

        return [...currentIds, asset.id]
      })
    },
    [limitedMediaSelectionType, limitedMediaSendMode, showComposerToast, t]
  )

  const handleSendLimitedMediaSelection = useCallback(async () => {
    if (limitedMediaSelectedAssets.length === 0 || isPickingMediaRef.current) {
      return
    }

    try {
      isPickingMediaRef.current = true
      setLimitedMediaPickerVisibility(false)
      setLimitedMediaSelectedAssetIds([])
      clearComposerDraft()

      const fallbackMessage =
        limitedMediaSendMode === 'file' ? t('chatSendFileFailed') : t('chatSendMediaFailed')
      const preparedSelections = await Promise.allSettled(
        limitedMediaSelectedAssets.map(async (asset) => {
          const resolvedAsset = await resolveLimitedMediaAsset(asset)
          const previewUri =
            limitedMediaSendMode === 'media' && isLimitedMediaVideo(asset)
              ? await createVideoUploadPreview(resolvedAsset.localUri)
              : undefined

          return {
            asset,
            resolvedAsset,
            previewUri
          }
        })
      )
      const sendTasks: Promise<unknown>[] = []
      let firstValidationMessage: string | null = null
      let firstPreparationError: unknown = null

      preparedSelections.forEach((result) => {
        if (result.status === 'rejected') {
          if (!firstPreparationError) {
            firstPreparationError = result.reason
          }
          return
        }

        const { asset, resolvedAsset, previewUri } = result.value

        if (!isUploadFileSizeWithinLimit(resolvedAsset.fileSize)) {
          firstValidationMessage = firstValidationMessage || t('chatFileTooLarge')
          return
        }

        if (
          limitedMediaSendMode === 'media' &&
          !isLimitedMediaVideo(asset) &&
          !isLimitedMediaImageSupported({
            ...asset,
            filename: resolvedAsset.fileName,
            uri: resolvedAsset.localUri
          })
        ) {
          firstValidationMessage = firstValidationMessage || t('chatUnsupportedFormat')
          return
        }

        if (limitedMediaSendMode === 'file') {
          sendTasks.push(
            messageStore.sendFileMessage(
              conversationId,
              resolvedAsset.localUri,
              resolvedAsset.fileName || (isLimitedMediaVideo(asset) ? 'video' : 'image')
            )
          )
          return
        }

        if (isLimitedMediaVideo(asset)) {
          sendTasks.push(
            messageStore.sendVideoMessage(conversationId, resolvedAsset.localUri, {
              name: resolvedAsset.fileName || 'video.mp4',
              duration: asset.duration ? Math.round(asset.duration) : 0,
              width: asset.width,
              height: asset.height,
              previewUri
            })
          )
          return
        }

        sendTasks.push(
          messageStore.sendImageMessage(
            conversationId,
            resolvedAsset.localUri,
            resolvedAsset.fileName,
            {
              width: asset.width,
              height: asset.height
            }
          )
        )
      })

      if (firstValidationMessage) {
        showComposerToast(firstValidationMessage)
      }

      if (sendTasks.length === 0) {
        if (firstPreparationError) {
          showSendFailureAlert(firstPreparationError, fallbackMessage)
        }
        return
      }

      setPanelVisible(false)

      const sendResults = await Promise.allSettled(sendTasks)
      const firstSendError = sendResults.find(
        (result): result is PromiseRejectedResult => result.status === 'rejected'
      )

      if (firstPreparationError || firstSendError) {
        showSendFailureAlert(firstSendError?.reason || firstPreparationError, fallbackMessage)
      }
    } catch (error) {
      showSendFailureAlert(
        error,
        limitedMediaSendMode === 'file' ? t('chatSendFileFailed') : t('chatSendMediaFailed')
      )
    } finally {
      isPickingMediaRef.current = false
      setLimitedMediaSendMode('media')
    }
  }, [
    clearComposerDraft,
    conversationId,
    limitedMediaSelectedAssets,
    limitedMediaSendMode,
    setLimitedMediaPickerVisibility,
    showComposerToast,
    showSendFailureAlert,
    t
  ])

  const handleSendMessage = async () => {
    if (isCurrentTeamChatBanned) {
      return
    }

    if (isSendingTextMessage || textSendLockRef.current) {
      return
    }

    const text = replaceEmoji(inputText.trim())

    if (!text) {
      showComposerToast(t('chatEmptyMessageUnsupported'))
      return
    }

    const mentions = mentionDraft
    const currentReplyDraft = replyDraft
    const shouldRefocusComposer = inputFocusedRef.current

    try {
      textSendLockRef.current = true
      setIsSendingTextMessage(true)
      clearComposerDraft()

      const options = { mentions }
      if (currentReplyDraft) {
        await messageStore.replyTextMessage(
          conversationId,
          text,
          currentReplyDraft.message,
          options
        )
      } else {
        await messageStore.sendMessage(conversationId, text, options)
      }
      if (shouldRefocusComposer) {
        requestAnimationFrame(() => {
          inputRef.current?.focus()
        })
      }
    } catch (error) {
      showSendFailureAlert(error, t('chatSendMessageFailed'))
    } finally {
      textSendLockRef.current = false
      setIsSendingTextMessage(false)
    }
  }

  const handleComposerTextChange = (nextText: string) => {
    const changeResult = applyMentionTextChange(
      inputText,
      nextText,
      mentionDraft,
      inputSelection.start
    )
    const effectiveText = changeResult.text
    const effectiveMentions = changeResult.mentions
    const mentionPrefix = replyDraft?.mentionPrefix

    if (
      !mentionPrefix ||
      !inputText.startsWith(mentionPrefix) ||
      effectiveText.startsWith(mentionPrefix)
    ) {
      const mentionTriggerSelectionStart = findMentionTriggerSelectionStart(
        inputText,
        effectiveText
      )

      setInputText(effectiveText)
      setMentionDraft(effectiveMentions)
      if (isMentionSelectorSupported && mentionTriggerSelectionStart !== null) {
        setPendingMentionSelectionStart(mentionTriggerSelectionStart)
        setMentionSelectorVisible(true)
      }
      return
    }

    const isDeleting = effectiveText.length < inputText.length
    const isEditingMentionPrefix = inputSelection.start <= mentionPrefix.length

    if (!isDeleting || !isEditingMentionPrefix) {
      setInputText(effectiveText)
      setMentionDraft(effectiveMentions)
      return
    }

    let partialPrefixLength = 0

    while (
      partialPrefixLength < effectiveText.length &&
      partialPrefixLength < mentionPrefix.length &&
      effectiveText[partialPrefixLength] === mentionPrefix[partialPrefixLength]
    ) {
      partialPrefixLength += 1
    }

    setInputText(effectiveText.slice(partialPrefixLength))
    setMentionDraft({})
  }

  const insertMention = useCallback(
    (accountId: string, displayName: string, replaceAt = false) => {
      if (
        conversationType !== V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM &&
        conversationType !== V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P
      ) {
        return
      }

      const selectionStart = replaceAt
        ? (pendingMentionSelectionStart ?? inputSelection.start)
        : inputSelection.start
      const result = insertMentionToken(
        inputText,
        mentionDraft,
        accountId,
        displayName,
        selectionStart,
        replaceAt
      )

      setInputText(result.text)
      setMentionDraft(result.mentions)
      setInputSelection(result.selection)
      setMentionSelectorVisible(false)
      setPendingMentionSelectionStart(null)
      setPanelVisible(false)
      setEmojiPanelVisible(false)
      setComposerMode('text')
      requestAnimationFrame(() => {
        inputRef.current?.focus()
      })
    },
    [conversationType, inputSelection.start, inputText, mentionDraft, pendingMentionSelectionStart]
  )

  const insertMentionFromMessage = useCallback(
    (message: V2NIMMessage) => {
      const displaySenderAccountId = getMessageDisplaySenderAccountId(message, aiUserAccountIds)

      if (
        conversationType !== V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM ||
        !targetId ||
        displaySenderAccountId === currentUserId
      ) {
        return
      }

      insertMention(
        displaySenderAccountId,
        getMessageMentionTokenName(
          displaySenderAccountId,
          conversationType,
          targetId,
          getMessageSenderSnapshotName(message)
        )
      )
    },
    [aiUserAccountIds, conversationType, currentUserId, insertMention, targetId]
  )

  const handlePickImage = async () => {
    if (isPickingMediaRef.current) {
      console.warn('[ChatScreen] handlePickImage ignored because picker is already active')
      return
    }

    if (isCurrentTeamChatBanned) {
      return
    }

    scrollToBottomForComposerInteraction()
    setComposerMode('text')
    setEmojiPanelVisible(false)
    setPanelVisible(false)
    stopAllMessageAudioPlayback()

    const permission = await getMediaLibraryPermissionState()

    if (permission.accessPrivileges === 'limited') {
      openLimitedMediaPicker('media', { limitedAccess: true }).catch((error) => {
        showSendFailureAlert(error, t('chatSendMediaFailed'))
      })
      return
    }

    if (!(await ensureMediaLibraryPermission())) {
      return
    }

    const nextPermission = await getMediaLibraryPermissionState()

    openLimitedMediaPicker('media', {
      limitedAccess: nextPermission.accessPrivileges === 'limited'
    }).catch((error) => {
      showSendFailureAlert(error, t('chatSendMediaFailed'))
    })
  }

  const handlePickAlbumFile = async () => {
    if (isPickingMediaRef.current) {
      console.warn('[ChatScreen] handlePickAlbumFile ignored because picker is already active')
      return
    }

    if (isCurrentTeamChatBanned) {
      return
    }

    scrollToBottomForComposerInteraction()
    setComposerMode('text')
    setEmojiPanelVisible(false)
    setPanelVisible(false)
    stopAllMessageAudioPlayback()

    const permission = await getMediaLibraryPermissionState()

    if (permission.accessPrivileges === 'limited') {
      openLimitedMediaPicker('file', { limitedAccess: true }).catch((error) => {
        showSendFailureAlert(error, t('chatSendFileFailed'))
      })
      return
    }

    if (!(await ensureMediaLibraryPermission())) {
      return
    }

    const nextPermission = await getMediaLibraryPermissionState()

    openLimitedMediaPicker('file', {
      limitedAccess: nextPermission.accessPrivileges === 'limited'
    }).catch((error) => {
      showSendFailureAlert(error, t('chatSendFileFailed'))
    })
  }

  const handleTakePhoto = async () => {
    let result: ImagePicker.ImagePickerResult

    if (!(await ensureCameraPermission())) {
      return
    }

    stopAllMessageAudioPlayback()
    const captureSource = 'chat-take-photo'
    pauseChatTimelineVisibility()
    beginNativeCameraCapture(captureSource)
    await beginNativeCameraKeepAlive(captureSource)
    try {
      result = await ImagePicker.launchInAppCameraAsync({
        mediaTypes: ['images'],
        quality: COMPRESSED_IMAGE_QUALITY
      })

      if (result.canceled || !result.assets?.[0]?.uri) {
        return
      }

      if (!validatePickedImage(result.assets[0], showComposerToast)) {
        return
      }

      const imageAsset = await resolvePickedImageUri(result.assets[0])

      if (!(await validateLocalUploadFileSize(imageAsset.localUri, showComposerToast))) {
        return
      }

      clearComposerDraft()
      await messageStore.sendImageMessage(
        conversationId,
        imageAsset.localUri,
        imageAsset.fileName,
        {
          width: result.assets[0].width,
          height: result.assets[0].height
        }
      )
      setPanelVisible(false)
    } catch (error) {
      showSendFailureAlert(error, t('chatSendMessageFailed'))
    } finally {
      await endNativeCameraKeepAlive(captureSource)
      endNativeCameraCapture(captureSource)
      resumeChatTimelineVisibility()
    }
  }

  const handleOpenCameraActions = () => {
    scrollToBottomForComposerInteraction()
    nativeCameraActionSelectedRef.current = false
    Alert.alert(
      t('chatOpenCameraActionsTitle'),
      '',
      [
        {
          text: t('chatTakePhoto'),
          onPress: () => {
            nativeCameraActionSelectedRef.current = true
            handleTakePhoto().catch((error) => {
              showSendFailureAlert(error, t('chatSendMessageFailed'))
            })
          }
        },
        {
          text: t('chatRecordVideo'),
          onPress: () => {
            nativeCameraActionSelectedRef.current = true
            handleRecordVideo().catch((error) => {
              showSendFailureAlert(error, t('chatSendOriginalVideoFailed'))
            })
          }
        },
        {
          text: t('actionCancel'),
          style: 'cancel',
          onPress: () => {
            nativeCameraActionSelectedRef.current = false
          }
        }
      ],
      {
        cancelable: true,
        onDismiss: () => {
          nativeCameraActionSelectedRef.current = false
        }
      }
    )
  }

  const handleRecordVideo = async () => {
    let result: ImagePicker.ImagePickerResult

    if (!(await ensureCameraPermission())) {
      return
    }

    if (Platform.OS === 'android' && !(await ensureVoiceRecordingPermission())) {
      return
    }

    stopAllMessageAudioPlayback()
    const captureSource = 'chat-record-video'
    pauseChatTimelineVisibility()
    beginNativeCameraCapture(captureSource)
    await beginNativeCameraKeepAlive(captureSource)
    try {
      result = await ImagePicker.launchInAppCameraAsync({
        mediaTypes: ['videos'],
        quality: 1,
        videoExportPreset: ImagePicker.VideoExportPreset.HighestQuality
      })

      if (result.canceled || !result.assets?.[0]?.uri) {
        return
      }

      const videoAsset = result.assets[0]
      const resolvedAsset = await resolveRecordedVideoAsset(videoAsset)

      if (!validateUploadFileSize(resolvedAsset.fileSize, showComposerToast)) {
        return
      }

      const previewUri = await createVideoUploadPreview(resolvedAsset.localUri)
      clearComposerDraft()
      await messageStore.sendVideoMessage(conversationId, resolvedAsset.localUri, {
        name: resolvedAsset.fileName || 'camera-video.mp4',
        duration: videoAsset.duration ? Math.round(videoAsset.duration / 1000) : 0,
        width: videoAsset.width,
        height: videoAsset.height,
        previewUri
      })
      setPanelVisible(false)
    } catch (error) {
      showSendFailureAlert(error, t('chatSendOriginalVideoFailed'))
    } finally {
      await endNativeCameraKeepAlive(captureSource)
      endNativeCameraCapture(captureSource)
      resumeChatTimelineVisibility()
    }
  }

  const handlePickDocumentFile = async () => {
    stopAllMessageAudioPlayback()
    pauseChatTimelineVisibility()
    let result: DocumentPicker.DocumentPickerResult

    try {
      result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: false
      })
    } finally {
      resumeChatTimelineVisibility()
    }

    if (result.canceled || !result.assets?.[0]?.uri) {
      return
    }

    if (!validateUploadFileSize(result.assets[0].size, showComposerToast)) {
      return
    }

    try {
      const fileName = result.assets[0].name || 'file'
      const localUri = await ensureLocalFileUri(result.assets[0].uri, fileName)

      if (!(await validateLocalUploadFileSize(localUri, showComposerToast))) {
        return
      }

      clearComposerDraft()
      await messageStore.sendFileMessage(conversationId, localUri, fileName)
      setPanelVisible(false)
    } catch (error) {
      showSendFailureAlert(error, t('chatSendFileFailed'))
    }
  }

  const handlePickFile = async () => {
    scrollToBottomForComposerInteraction()
    stopAllMessageAudioPlayback()

    if (Platform.OS !== 'ios') {
      if (!(await ensureMediaLibraryPermission())) {
        return
      }
      await handlePickDocumentFile()
      return
    }

    const selectedSource = await new Promise<'album' | 'document' | 'cancel'>((resolve) => {
      Alert.alert(t('chatFileSourceTitle'), '', [
        {
          text: t('chatFileSourceAlbum'),
          onPress: () => resolve('album')
        },
        {
          text: t('chatFileSourceICloud'),
          onPress: () => resolve('document')
        },
        {
          text: t('actionCancel'),
          style: 'cancel',
          onPress: () => resolve('cancel')
        }
      ])
    })

    if (selectedSource === 'album') {
      await handlePickAlbumFile()
      return
    }

    if (selectedSource === 'document') {
      await handlePickDocumentFile()
    }
  }

  const handleStartVoiceRecording = async () => {
    const shouldReuseActiveTrace =
      !!voiceRecordingTraceIdRef.current &&
      (recorderState.isRecording ||
        voiceRecordingStartingRef.current ||
        voiceRecordingStoppingRef.current ||
        voiceRecordingActiveRef.current)
    const traceId = shouldReuseActiveTrace
      ? voiceRecordingTraceIdRef.current
      : createVoiceDebugTraceId()
    voiceRecordingTraceIdRef.current = traceId
    logIOSVoiceDebug('touch.pressIn', {
      traceId,
      conversationId,
      isCurrentTeamChatBanned,
      recordingBusy,
      isRecording: recorderState.isRecording,
      isStarting: voiceRecordingStartingRef.current,
      isStopping: voiceRecordingStoppingRef.current,
      isActive: voiceRecordingActiveRef.current,
      pendingStop: voicePendingStopRef.current
    })

    if (isCurrentTeamChatBanned) {
      logIOSVoiceDebug('record.start.blocked.teamBanned', {
        traceId,
        conversationId
      })
      voiceRecordingTraceIdRef.current = null
      return
    }

    scrollToBottomForComposerInteraction()

    if (
      recordingBusy ||
      voiceRecordingStartingRef.current ||
      voiceRecordingStoppingRef.current ||
      voiceRecordingActiveRef.current
    ) {
      logIOSVoiceDebug('record.start.blocked.busy', {
        traceId,
        conversationId,
        recordingBusy,
        isRecording: recorderState.isRecording,
        isStarting: voiceRecordingStartingRef.current,
        isStopping: voiceRecordingStoppingRef.current,
        isActive: voiceRecordingActiveRef.current,
        pendingStop: voicePendingStopRef.current
      })
      return
    }

    voiceTouchCancelledRef.current = false
    voiceLastTouchLocationRef.current = null
    voicePendingStopRef.current = null
    setVoiceCancelHintVisible(false)

    const hasPermission = await ensureVoiceRecordingPermission()
    logIOSVoiceDebug('record.permission', {
      traceId,
      conversationId,
      granted: hasPermission
    })

    if (!hasPermission) {
      voiceRecordingTraceIdRef.current = null
      return
    }

    try {
      voiceRecordingStartingRef.current = true
      setRecordingBusy(true)
      setPanelVisible(false)
      setEmojiPanelVisible(false)
      Keyboard.dismiss()
      stopAudioPlayback()
      await configureVoiceRecordingAudioMode()
      await audioRecorder.prepareToRecordAsync()
      setVoiceAutoSending(false)
      audioRecorder.record()
      voiceRecordingActiveRef.current = true
      voiceRecordingStartedAtRef.current = Date.now()
      logIOSVoiceDebug('record.start', {
        traceId,
        conversationId,
        recorderUri: audioRecorder.uri,
        pendingStop: voicePendingStopRef.current,
        recorderStatus: audioRecorder.getStatus()
      })
    } catch (error) {
      logIOSVoiceDebug('record.start.error', {
        traceId,
        conversationId,
        error: error instanceof Error ? error.message : String(error),
        code: getSdkErrorCode(error),
        recorderUri: audioRecorder.uri,
        recorderStatus: audioRecorder.getStatus()
      })
      voicePendingStopRef.current = null
      voiceRecordingTraceIdRef.current = null
      toast.alert(
        t('chatRecordFailedTitle'),
        error instanceof Error ? error.message : t('chatRecordStartFailed')
      )
    } finally {
      voiceRecordingStartingRef.current = false
      setRecordingBusy(false)
    }
  }

  const handleVoiceRecordTouchMove = (locationX: number, locationY: number) => {
    const { shouldCancel, buttonRadius, cancelRadius, distance } = getVoiceRecordCancelState(
      locationX,
      locationY
    )
    voiceLastTouchLocationRef.current = { locationX, locationY }

    if (voiceTouchCancelledRef.current !== shouldCancel) {
      voiceTouchCancelledRef.current = shouldCancel
      setVoiceCancelHintVisible(shouldCancel)
      logIOSVoiceDebug('touch.cancelStateChanged', {
        traceId: voiceRecordingTraceIdRef.current,
        conversationId,
        shouldCancel,
        locationX,
        locationY,
        buttonRadius,
        cancelRadius,
        distance,
        edgeTolerance: VOICE_RECORD_CANCEL_EDGE_TOLERANCE,
        isRecording: recorderState.isRecording,
        durationMillis: recorderState.durationMillis
      })
    }
  }

  const handleStopVoiceRecording = useCallback(
    async (
      cancel = false,
      releaseLocation?: {
        locationX: number
        locationY: number
      }
    ) => {
      const releaseCancelState = releaseLocation
        ? getVoiceRecordCancelState(releaseLocation.locationX, releaseLocation.locationY)
        : null
      const shouldCancel =
        cancel || (releaseCancelState?.shouldCancel ?? voiceTouchCancelledRef.current)
      const traceId = voiceRecordingTraceIdRef.current

      logIOSVoiceDebug('touch.pressOut', {
        traceId,
        conversationId,
        cancel,
        shouldCancel,
        latchedShouldCancel: voiceTouchCancelledRef.current,
        releaseLocation,
        releaseCancelState,
        lastTouchLocation: voiceLastTouchLocationRef.current,
        isRecording: recorderState.isRecording,
        isActive: voiceRecordingActiveRef.current,
        isStarting: voiceRecordingStartingRef.current,
        isStopping: voiceRecordingStoppingRef.current,
        pendingStop: voicePendingStopRef.current,
        durationMillis: recorderState.durationMillis,
        recorderUri: audioRecorder.uri
      })

      if (!recorderState.isRecording && !voiceRecordingStoppingRef.current) {
        voicePendingStopRef.current = shouldCancel
        logIOSVoiceDebug('record.stop.pending', {
          traceId,
          conversationId,
          shouldCancel,
          isActive: voiceRecordingActiveRef.current,
          isStarting: voiceRecordingStartingRef.current,
          isStopping: voiceRecordingStoppingRef.current,
          recorderStatus: audioRecorder.getStatus()
        })
        return
      }

      if (!voiceRecordingActiveRef.current) {
        logIOSVoiceDebug('record.stop.skip.inactive', {
          traceId,
          conversationId,
          shouldCancel,
          recorderStatus: audioRecorder.getStatus()
        })
        return
      }

      if (voiceRecordingStoppingRef.current) {
        logIOSVoiceDebug('record.stop.skip.stopping', {
          traceId,
          conversationId,
          shouldCancel
        })
        return
      }

      const durationMs = Math.round((recorderState.durationMillis || 0) as number)
      const elapsedDurationMs = voiceRecordingStartedAtRef.current
        ? Date.now() - voiceRecordingStartedAtRef.current
        : 0
      const finalDurationMs = Math.max(durationMs, elapsedDurationMs)
      const statusBeforeStop = audioRecorder.getStatus()

      logIOSVoiceDebug('record.stop.before', {
        traceId,
        conversationId,
        shouldCancel,
        durationMs,
        elapsedDurationMs,
        finalDurationMs,
        recorderUri: audioRecorder.uri,
        recorderState: {
          isRecording: recorderState.isRecording,
          durationMillis: recorderState.durationMillis,
          url: recorderState.url
        },
        recorderStatus: statusBeforeStop
      })

      try {
        voiceRecordingStoppingRef.current = true
        setRecordingBusy(true)
        await audioRecorder.stop()
        const statusAfterStop = audioRecorder.getStatus()
        voiceRecordingActiveRef.current = false
        voiceRecordingStartedAtRef.current = null
        await configureVoicePlaybackAudioMode()

        const audioUri = audioRecorder.uri
        const audioFileInfo = await getVoiceDebugFileInfo(audioUri)

        logIOSVoiceDebug('record.stop.after', {
          traceId,
          conversationId,
          shouldCancel,
          durationMs,
          elapsedDurationMs,
          finalDurationMs,
          audioUri,
          audioFileInfo,
          recorderStatus: statusAfterStop
        })

        if (!audioUri) {
          logIOSVoiceDebug('record.send.skip.missingFile', {
            traceId,
            conversationId,
            audioFileInfo
          })
          toast.alert(t('chatRecordFailedTitle'), t('chatRecordFileMissing'))
          return
        }

        if (shouldCancel) {
          logIOSVoiceDebug('record.send.skip.cancelled', {
            traceId,
            conversationId,
            finalDurationMs,
            audioUri,
            audioFileInfo
          })
          return
        }

        if (finalDurationMs < MIN_VOICE_DURATION_MS) {
          logIOSVoiceDebug('record.send.skip.tooShort', {
            traceId,
            conversationId,
            finalDurationMs,
            audioUri,
            audioFileInfo
          })
          showComposerToast(t('chatRecordTooShort'))
          return
        }

        clearComposerDraft()
        const sendDuration = Math.max(1, finalDurationMs)
        const sendName = `voice-${Date.now()}.m4a`
        const preparedAudio = await resolveRecordedVoiceSendUri(audioUri, sendName)
        logIOSVoiceDebug('record.send', {
          traceId,
          conversationId,
          audioUri: preparedAudio.localUri,
          originalAudioUri: preparedAudio.sourceUri,
          persistedAudioUri: preparedAudio.persistedUri,
          audioFileInfo: preparedAudio.fileInfo,
          name: sendName,
          duration: sendDuration,
          durationSecondsRounded: Math.max(1, Math.round(sendDuration / 1000))
        })

        if (!preparedAudio.fileInfo?.exists) {
          logIOSVoiceDebug('record.send.skip.persistedMissing', {
            traceId,
            conversationId,
            audioUri: preparedAudio.localUri,
            originalAudioUri: preparedAudio.sourceUri,
            persistedAudioUri: preparedAudio.persistedUri,
            audioFileInfo: preparedAudio.fileInfo
          })
          toast.alert(t('chatRecordFailedTitle'), t('chatRecordFileMissing'))
          return
        }

        const sentMessage = await messageStore.sendAudioMessage(
          conversationId,
          preparedAudio.localUri,
          {
            debugTraceId: traceId || undefined,
            name: sendName,
            duration: sendDuration
          }
        )
        const sentAudioAttachment = sentMessage?.attachment as
          | (V2NIMMessageAudioAttachment & {
              ext?: unknown
              size?: unknown
              raw?: unknown
            })
          | undefined
        logIOSVoiceDebug('record.send.done', {
          traceId,
          conversationId,
          messageClientId: sentMessage?.messageClientId,
          messageServerId: sentMessage?.messageServerId,
          sendingState: sentMessage?.sendingState,
          attachmentDuration: sentAudioAttachment?.duration,
          attachmentName: sentAudioAttachment?.name,
          attachmentExt: sentAudioAttachment?.ext,
          attachmentSize: sentAudioAttachment?.size,
          attachmentPath: sentAudioAttachment?.path,
          attachmentUrl: sentAudioAttachment?.url,
          attachmentRaw: sentAudioAttachment?.raw
        })
      } catch (error) {
        logIOSVoiceDebug('record.error', {
          traceId,
          conversationId,
          error: error instanceof Error ? error.message : String(error),
          code: getSdkErrorCode(error),
          recorderUri: audioRecorder.uri,
          recorderStatus: audioRecorder.getStatus()
        })
        voiceRecordingActiveRef.current = false
        voiceRecordingStartedAtRef.current = null
        showSendFailureAlert(error, t('chatSendAudioFailed'))
      } finally {
        logIOSVoiceDebug('record.cleanup', {
          traceId,
          conversationId,
          pendingStop: voicePendingStopRef.current,
          wasCancelled: voiceTouchCancelledRef.current,
          recorderStatus: audioRecorder.getStatus()
        })
        voicePendingStopRef.current = null
        voiceTouchCancelledRef.current = false
        voiceLastTouchLocationRef.current = null
        voiceRecordingStoppingRef.current = false
        voiceRecordingTraceIdRef.current = null
        setVoiceAutoSending(false)
        setVoiceCancelHintVisible(false)
        setRecordingBusy(false)
      }
    },
    [
      audioRecorder,
      clearComposerDraft,
      conversationId,
      recorderState.durationMillis,
      recorderState.isRecording,
      recorderState.url,
      showComposerToast,
      showSendFailureAlert,
      t
    ]
  )

  const handleOutsideComposerPress = useCallback(() => {
    if (
      recorderState.isRecording ||
      voiceRecordingActiveRef.current ||
      voiceRecordingStartingRef.current ||
      voiceRecordingStoppingRef.current
    ) {
      return
    }

    setComposerMode('text')
    setPanelVisible(false)
    setEmojiPanelVisible(false)
    voiceTouchCancelledRef.current = false
    setVoiceCancelHintVisible(false)
    Keyboard.dismiss()
    inputRef.current?.blur()
  }, [recorderState.isRecording])

  const handleScrollBottomShortcutPress = useCallback(() => {
    handleOutsideComposerPress()
    hasUserScrolledRef.current = true
    isBrowsingHistoryRef.current = false
    settleLatestMessagesAtBottom()

    if (conversationId) {
      pendingForegroundReadReceiptConversationIdRef.current = conversationId
      flushPendingLatestReadReceipts(conversationId)
    }
  }, [
    conversationId,
    flushPendingLatestReadReceipts,
    handleOutsideComposerPress,
    settleLatestMessagesAtBottom
  ])

  useEffect(() => {
    if (!recorderState.isRecording || voicePendingStopRef.current === null) {
      return
    }

    const shouldCancel = voicePendingStopRef.current
    voicePendingStopRef.current = null
    logIOSVoiceDebug('record.stop.pending.consume', {
      traceId: voiceRecordingTraceIdRef.current,
      conversationId,
      shouldCancel,
      isRecording: recorderState.isRecording,
      durationMillis: recorderState.durationMillis,
      recorderStatus: audioRecorder.getStatus()
    })
    handleStopVoiceRecording(shouldCancel).catch((error) => {
      showSendFailureAlert(error, t('chatSendAudioFailed'))
    })
  }, [
    audioRecorder,
    conversationId,
    handleStopVoiceRecording,
    recorderState.durationMillis,
    recorderState.isRecording,
    showSendFailureAlert,
    t
  ])

  useEffect(() => {
    if (!recorderState.isRecording || recordingBusy || voiceAutoSending) {
      return
    }

    const durationMs = Math.round((recorderState.durationMillis || 0) as number)

    if (durationMs < MAX_VOICE_DURATION_SECONDS * 1000) {
      return
    }

    setVoiceAutoSending(true)
    logIOSVoiceDebug('record.autoSend.maxDuration', {
      traceId: voiceRecordingTraceIdRef.current,
      conversationId,
      durationMs
    })
    handleStopVoiceRecording(false).catch((error) => {
      showSendFailureAlert(error, t('chatSendAudioFailed'))
    })
  }, [
    conversationId,
    handleStopVoiceRecording,
    recordingBusy,
    recorderState.durationMillis,
    recorderState.isRecording,
    showSendFailureAlert,
    t,
    voiceAutoSending
  ])

  const handleOpenEmoji = () => {
    if (isCurrentTeamChatBanned) {
      return
    }

    const shouldRefocusInput = scrollToBottomForComposerInteraction()
    setComposerMode('text')
    setPanelVisible(false)
    setEmojiPanelVisible((current) => {
      const nextVisible = !current

      if (nextVisible) {
        Keyboard.dismiss()
      } else if (shouldRefocusInput) {
        requestAnimationFrame(() => {
          inputRef.current?.focus()
        })
      }

      return nextVisible
    })
  }

  useEffect(() => {
    if (!recorderState.isRecording) {
      voiceWaveAnimation.stopAnimation()
      voiceWaveAnimation.setValue(0)
      return
    }

    const loopAnimation = Animated.loop(
      Animated.timing(voiceWaveAnimation, {
        toValue: 1,
        duration: VOICE_RECORD_WAVE_DURATION_MS,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true
      })
    )

    loopAnimation.start()

    return () => {
      loopAnimation.stop()
      voiceWaveAnimation.stopAnimation()
      voiceWaveAnimation.setValue(0)
    }
  }, [recorderState.isRecording, voiceWaveAnimation])

  const voiceWaveAnimatedStyle = useMemo(
    () => ({
      opacity: voiceWaveAnimation.interpolate({
        inputRange: [0, 0.65, 1],
        outputRange: [0.3, 0.16, 0]
      }),
      transform: [
        {
          scale: voiceWaveAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [VOICE_RECORD_BUTTON_SIZE / VOICE_RECORD_WAVE_SIZE, 1]
          })
        }
      ]
    }),
    [voiceWaveAnimation]
  )

  const handleEmojiPress = (emoji: { key: string; type: string }) => {
    if (isCurrentTeamChatBanned) {
      return
    }

    setComposerMode('text')
    setPanelVisible(false)
    setInputText((current) => `${current}${emoji.key}`)
  }

  const handleEmojiDelete = () => {
    setInputText((current) => {
      if (!current) {
        return current
      }

      const nextText = deleteTrailingEmojiToken(current)
      const result = applyMentionTextChange(
        current,
        nextText,
        mentionDraft,
        Math.max(0, current.length)
      )

      setMentionDraft(result.mentions)
      return result.text
    })
  }

  const handleMessageListScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent
    const nextIsNearBottom = contentOffset.y < 72
    const wasNearBottom = isNearBottomRef.current
    lastMessageListScrollOffsetRef.current = contentOffset.y

    if (forceLatestScrollUntilSettledRef.current && nextIsNearBottom) {
      forceLatestScrollUntilSettledRef.current = false
      if (forceLatestScrollRetryTimerRef.current) {
        clearTimeout(forceLatestScrollRetryTimerRef.current)
        forceLatestScrollRetryTimerRef.current = null
      }
    }

    isNearBottomRef.current = nextIsNearBottom
    setIsNearBottom(nextIsNearBottom)

    if (nextIsNearBottom && deferredLatestMessageKeySetRef.current.size > 0) {
      const revealAnchorOffset = deferredRevealScrollOffsetRef.current

      if (revealAnchorOffset === null) {
        if (revealNextDeferredLatestMessage()) {
          deferredRevealScrollOffsetRef.current = contentOffset.y
        }
      } else if (
        Math.abs(contentOffset.y - revealAnchorOffset) >= DEFERRED_NEW_MESSAGE_REVEAL_SCROLL_STEP
      ) {
        if (revealNextDeferredLatestMessage()) {
          deferredRevealScrollOffsetRef.current = contentOffset.y
        }
      }
    } else if (!nextIsNearBottom) {
      deferredRevealScrollOffsetRef.current = null
    }

    if (nextIsNearBottom) {
      const wasBrowsingHistory = isBrowsingHistoryRef.current
      const hasDeferredLatestMessages = deferredLatestMessageKeySetRef.current.size > 0

      if (hasDeferredLatestMessages) {
        isBrowsingHistoryRef.current = true
        listAutoFollowEnabledRef.current = false
        setListAutoFollowEnabled(false)
        setShowScrollBottomShortcut(true)
      } else {
        isBrowsingHistoryRef.current = false
        listAutoFollowEnabledRef.current = true
        setListAutoFollowEnabled(true)
        setNewMessageNoticeKeys(new Set())
        if (!wasNearBottom || wasBrowsingHistory) {
          syncActiveConversation()
        }
      }
    } else if (!selectionMode) {
      isBrowsingHistoryRef.current = true
      listAutoFollowEnabledRef.current = false
      setListAutoFollowEnabled(false)
      setShowScrollBottomShortcut(true)
      setScrollBottomShortcutCount((count) => Math.max(0, count))
      if (wasNearBottom) {
        syncActiveConversation()
      }
    }

    const distanceToHistoryEdge = contentSize.height - (contentOffset.y + layoutMeasurement.height)
    const isNearHistoryEdge = distanceToHistoryEdge <= HISTORY_PREFETCH_TOP_OFFSET

    if (!isNearHistoryEdge) {
      loadingMoreTriggeredRef.current = false
      return
    }

    if (
      loadingMoreTriggeredRef.current ||
      messageState.loadingMore ||
      messageState.loading ||
      !messageState.hasMore
    ) {
      return
    }

    loadingMoreTriggeredRef.current = true
    isBrowsingHistoryRef.current = true
    listAutoFollowEnabledRef.current = false
    setListAutoFollowEnabled(false)
    messageStore.loadMoreHistory(conversationId).catch((error) => {
      loadingMoreTriggeredRef.current = false
      toast.alert(
        t('commonLoadingFailed'),
        error instanceof Error ? error.message : t('chatLoadEarlierMessagesFailed')
      )
    })
  }

  const handleMessageListContentSizeChange = useCallback(() => {
    flushPendingInitialBottom()

    if (forceLatestScrollUntilSettledRef.current) {
      requestAnimationFrame(() => {
        scrollToBottom(false)
      })
    }

    const pendingMessageKey = pendingOutgoingImageBottomSettleMessageKeyRef.current

    if (!pendingMessageKey || hasUserScrolledRef.current) {
      return
    }

    const latestMessage = messageState.list[messageState.list.length - 1]

    if (!latestMessage || getMessageKey(latestMessage) !== pendingMessageKey) {
      pendingOutgoingImageBottomSettleMessageKeyRef.current = null
      return
    }

    pendingOutgoingImageBottomSettleMessageKeyRef.current = null

    requestAnimationFrame(() => {
      if (hasUserScrolledRef.current) {
        return
      }

      scrollToBottom(false)
    })
  }, [flushPendingInitialBottom, messageState.list, scrollToBottom])

  const messageListViewabilityConfig = useMemo(
    () => ({
      itemVisiblePercentThreshold: 40,
      minimumViewTime: 80
    }),
    []
  )

  const handleMessageListViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken<TimelineItem>[] }) => {
      if (newMessageNoticeKeySetRef.current.size === 0) {
        return
      }

      const nextNoticeKeys = new Set(newMessageNoticeKeySetRef.current)
      let changed = false

      viewableItems.forEach((viewToken) => {
        const item = viewToken.item
        if (!viewToken.isViewable || item.type !== 'message') {
          return
        }

        const messageKey = getMessageKey(item.message)
        if (nextNoticeKeys.delete(messageKey)) {
          changed = true
        }
      })

      if (changed) {
        setNewMessageNoticeKeys(nextNoticeKeys)
      }
    },
    [setNewMessageNoticeKeys]
  )

  const handleScrollToIndexFailed = useCallback(
    ({
      index,
      averageItemLength
    }: {
      index: number
      highestMeasuredFrameIndex: number
      averageItemLength: number
    }) => {
      messageScrollRef.current?.scrollToOffset({
        offset: Math.max(0, averageItemLength * index - 72),
        animated: false
      })

      setTimeout(() => {
        messageScrollRef.current?.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.35
        })
      }, 50)
    },
    []
  )

  const conversationIdentity = getUIKitConversationIdentity({
    conversationId,
    type: conversationType,
    name: conversation?.name,
    avatar: conversation?.avatar
  })
  useEffect(() => {
    if (
      conversationIdentity.type !== V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P ||
      !conversationIdentity.targetId ||
      isUIKitAIUser(conversationIdentity.targetId)
    ) {
      return
    }

    ensureUIKitUserProfiles([conversationIdentity.targetId]).catch(() => undefined)
  }, [conversationIdentity.targetId, conversationIdentity.type])

  const title = conversationIdentity.title || t('chatDetailTitle')
  const forwardSourceTitle =
    conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P && targetId
      ? getUIKitAppellation({ account: targetId }) || targetId
      : title
  const forwardSourcePayloadTitle =
    conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P && targetId
      ? getForwardPayloadP2PTitle(targetId)
      : title
  const actionMessage = actionContext?.message || null
  const actionItems = actionMessage ? getMessageActionItems(actionMessage, currentUserId, t) : []
  const actionMenuColumns = Math.min(
    LONG_PRESS_MENU_COLUMNS,
    Math.max(LONG_PRESS_MENU_MIN_COLUMNS, actionItems.length || 1)
  )
  const actionMenuRows = Math.max(1, Math.ceil(actionItems.length / actionMenuColumns))
  const actionMenuWidth = Math.min(
    windowWidth - LONG_PRESS_MENU_SIDE_MARGIN * 2,
    Math.min(
      LONG_PRESS_MENU_MAX_WIDTH,
      actionMenuColumns * LONG_PRESS_MENU_COLUMN_WIDTH + LONG_PRESS_MENU_HORIZONTAL_PADDING
    )
  )
  const actionMenuHeight =
    LONG_PRESS_MENU_VERTICAL_PADDING * 2 + actionMenuRows * LONG_PRESS_MENU_ROW_HEIGHT
  const actionMenuPosition = useMemo(() => {
    if (!actionContext) {
      return null
    }

    const minLeft = LONG_PRESS_MENU_SIDE_MARGIN
    const maxLeft = Math.max(minLeft, windowWidth - LONG_PRESS_MENU_SIDE_MARGIN - actionMenuWidth)
    const preferredLeft =
      actionContext.align === 'right'
        ? actionContext.anchorRect.x + actionContext.anchorRect.width - actionMenuWidth
        : actionContext.anchorRect.x
    const left = Math.min(Math.max(preferredLeft, minLeft), maxLeft)
    const preferredBelowTop =
      actionContext.anchorRect.y + actionContext.anchorRect.height + LONG_PRESS_MENU_TOP_GAP
    const maxTop = Math.max(
      insets.top + LONG_PRESS_MENU_TOP_GAP,
      windowHeight - insets.bottom - LONG_PRESS_MENU_BOTTOM_MARGIN - actionMenuHeight
    )

    let top = Math.min(preferredBelowTop, maxTop)

    if (preferredBelowTop > maxTop) {
      top = Math.max(
        insets.top + LONG_PRESS_MENU_TOP_GAP,
        actionContext.anchorRect.y - actionMenuHeight - LONG_PRESS_MENU_TOP_GAP
      )
    }

    return { left, top }
  }, [
    actionContext,
    actionMenuHeight,
    actionMenuWidth,
    insets.bottom,
    insets.top,
    windowHeight,
    windowWidth
  ])
  const replyPreviewText = replyDraft ? getUIKitReplySourcePreview(replyDraft.message) : ''
  const replySenderName = replyDraft
    ? getMessageDisplayName(replyDraft.message.senderId, conversationType, targetId)
    : ''
  const securityTipVisible = true
  const handleOpenReport = useCallback(() => {
    router.push('/chat/report' as never)
  }, [])
  const currentTeam =
    conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM && targetId
      ? teamStore.getTeam(targetId)
      : null
  const teamMembers =
    conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM && targetId
      ? teamStore.getMembers(targetId)
      : EMPTY_TEAM_MEMBERS
  const hasLoadedTeamMembers =
    conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM && targetId
      ? teamStore.hasLoadedMembers(targetId)
      : false
  const currentTeamMemberRole =
    conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM && targetId
      ? teamStore.getMyMemberRole(targetId)
      : V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_NORMAL
  const isCurrentTeamPrivilegedMember =
    currentTeamMemberRole === V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_OWNER ||
    currentTeamMemberRole === V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_MANAGER
  const isCurrentTeamChatBanned =
    conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM &&
    currentTeam?.chatBannedMode ===
      V2NIMTeamChatBannedMode.V2NIM_TEAM_CHAT_BANNED_MODE_BANNED_NORMAL &&
    !isCurrentTeamPrivilegedMember
  const isP2PConversation = conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P
  const isPeerAIUser = targetId ? isUIKitAIUser(targetId) : false
  const isPeerFriend = targetId ? friendStore.friends.has(targetId) : false
  const shouldShowNonFriendTip =
    isP2PConversation && !!targetId && !isPeerAIUser && currentUserId !== targetId && !isPeerFriend
  const shouldShowSecurityTip = securityTipVisible && !shouldShowNonFriendTip
  const shouldShowPeerOnlineStatus = isP2PConversation && targetId ? !isPeerAIUser : false
  const peerStatusAccountId = shouldShowPeerOnlineStatus ? targetId || '' : ''
  const peerOnlineStatus = peerStatusAccountId ? getUIKitOnlineStatusText(peerStatusAccountId) : ''
  const shouldBroadcastTyping =
    !selectionMode && composerMode === 'text' && isP2PConversation && inputText.length > 0
  const headerSubtitle = !selectionMode && isPeerTyping ? t('chatPeerTyping') : ''
  const headerStatusText = !selectionMode && !isPeerTyping ? peerOnlineStatus : ''
  const isMentionSelectorSupported =
    conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM
  const mentionSelectorActive = mentionSelectorVisible && isMentionSelectorSupported
  const mentionCandidateNameResolutionKey = isMentionSelectorSupported
    ? getTeamMentionNameResolutionKey(
        teamMembers
          .map((member) => member.accountId)
          .filter((accountId) => !!accountId && accountId !== currentUserId),
        targetId
      )
    : ''
  const teamMentionNameRevision = mentionCandidateNameResolutionKey
  const mentionCandidates = useMemo<MentionCandidate[]>(() => {
    void teamMentionNameRevision

    if (!isMentionSelectorSupported) {
      return []
    }

    const teamMemberCandidates: MentionCandidate[] =
      conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM && targetId
        ? teamMembers
            .filter((member) => {
              return (
                member.accountId !== currentUserId &&
                (!mentionAIUsersReady || !aiUserAccountIds.has(member.accountId))
              )
            })
            .map((member) => ({
              accountId: member.accountId,
              displayName: getTeamMentionPickerName(member.accountId, targetId),
              insertName: getTeamMentionTokenName(member.accountId, targetId)
            }))
        : []
    const teamCandidates =
      conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM
        ? [
            ...(isAtAllAllowedForCurrentUser(
              currentTeam?.serverExtension,
              isCurrentTeamPrivilegedMember
            )
              ? [
                  {
                    accountId: AT_ALL_ACCOUNT,
                    displayName: t('teamAll' as never),
                    insertName: t('teamAll' as never),
                    isAtAll: true
                  }
                ]
              : []),
            ...teamMemberCandidates
          ]
        : []

    return teamCandidates
  }, [
    conversationType,
    aiUserAccountIds,
    currentTeam?.serverExtension,
    currentUserId,
    isCurrentTeamPrivilegedMember,
    isMentionSelectorSupported,
    mentionAIUsersReady,
    t,
    targetId,
    teamMembers,
    teamMentionNameRevision
  ])
  const handleMentionViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken<MentionCandidate>[] }) => {
      const accountIds = viewableItems
        .map((viewableItem) => viewableItem.item)
        .filter(
          (item): item is MentionCandidate =>
            !!item &&
            !item.isAtAll &&
            !!item.accountId &&
            item.accountId !== currentUserId &&
            !visibleMentionProfileAccountIdsRef.current.has(item.accountId)
        )
        .map((item) => {
          visibleMentionProfileAccountIdsRef.current.add(item.accountId)
          return item.accountId
        })

      if (accountIds.length > 0) {
        ensureUIKitUserProfiles(accountIds).catch(() => undefined)
      }
    }
  ).current
  const mentionViewabilityConfig = useRef({ itemVisiblePercentThreshold: 20 }).current
  useEffect(() => {
    if (!mentionSelectorVisible) {
      visibleMentionProfileAccountIdsRef.current.clear()
    }
  }, [mentionSelectorVisible, targetId])
  useEffect(() => {
    if (isMentionSelectorSupported || !mentionSelectorVisible) {
      return
    }

    setMentionSelectorVisible(false)
    setPendingMentionSelectionStart(null)
  }, [isMentionSelectorSupported, mentionSelectorVisible])
  const networkBannerText = useMemo(() => {
    if (!isAuthenticated) {
      return null
    }

    if (isIMSendReady) {
      return null
    }

    if (loginStatus === 0) {
      return t('commonNetworkUnavailable')
    }

    return t('connectingText' as never)
  }, [isAuthenticated, isIMSendReady, loginStatus, t])
  const p2pStatusAccountIds = useMemo(
    () => (peerStatusAccountId ? [peerStatusAccountId] : []),
    [peerStatusAccountId]
  )

  useEffect(() => {
    if (!isP2PConversation || !targetId || isPeerAIUser || currentUserId === targetId) {
      return
    }

    friendStore.ensureFriendRelationFresh(targetId).catch(() => undefined)
  }, [currentUserId, isP2PConversation, isPeerAIUser, targetId])

  useEffect(() => {
    const shouldPrepareAIUsers =
      !!targetId &&
      (conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM || isP2PConversation)

    if (!shouldPrepareAIUsers) {
      setMentionAIUsersReady(false)
      return
    }

    if (aiUserCount > 0) {
      setMentionAIUsersReady(true)
      return
    }

    let isCancelled = false

    setMentionAIUsersReady(false)
    imStoreV2Bridge
      .ensureAIUsersLoaded()
      .catch(() => undefined)
      .finally(() => {
        if (!isCancelled) {
          setMentionAIUsersReady(true)
        }
      })

    return () => {
      isCancelled = true
    }
  }, [aiUserCount, conversationType, isP2PConversation, targetId])

  useUIKitUserStatusSubscription(p2pStatusAccountIds)

  useEffect(() => {
    if (
      !nimStore.nim?.V2NIMNotificationService ||
      !isP2PConversation ||
      !targetId ||
      !currentUserId
    ) {
      return
    }

    const handleReceiveCustomNotifications = (
      notifications: {
        senderId: string
        receiverId: string
        conversationType: V2NIMConversationType
        content: string
      }[]
    ) => {
      notifications.forEach((notification) => {
        if (
          notification.senderId !== targetId ||
          notification.receiverId !== currentUserId ||
          notification.conversationType !== V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P
        ) {
          return
        }

        try {
          const parsedContent = JSON.parse(notification.content) as {
            typing?: number | boolean
          }
          const typingValue = parsedContent[TYPING_NOTIFICATION_KEY]
          const nextTypingState = typingValue === 1 || typingValue === true

          clearPeerTypingResetTimer()
          setIsPeerTyping(nextTypingState)

          if (nextTypingState) {
            peerTypingResetTimerRef.current = setTimeout(() => {
              setIsPeerTyping(false)
              peerTypingResetTimerRef.current = null
            }, PEER_TYPING_RESET_MS)
          }
        } catch {
          // Ignore malformed custom notifications from unrelated integrations.
        }
      })
    }

    nimStore.nim.V2NIMNotificationService.on(
      'onReceiveCustomNotifications',
      handleReceiveCustomNotifications
    )

    return () => {
      nimStore.nim?.V2NIMNotificationService.off(
        'onReceiveCustomNotifications',
        handleReceiveCustomNotifications
      )
    }
  }, [clearPeerTypingResetTimer, currentUserId, isP2PConversation, targetId])

  useEffect(() => {
    if (shouldBroadcastTyping) {
      startSelfTyping()
      return
    }

    stopSelfTyping()
  }, [inputText, shouldBroadcastTyping, startSelfTyping, stopSelfTyping])

  useEffect(() => {
    return () => {
      stopSelfTyping()
    }
  }, [conversationId, stopSelfTyping])

  useEffect(() => {
    if (!isCurrentTeamChatBanned) {
      return
    }

    setInputText('')
    setReplyDraft(null)
    setComposerMode('text')
    setPanelVisible(false)
    setEmojiPanelVisible(false)
    Keyboard.dismiss()
  }, [isCurrentTeamChatBanned])

  const toolRow = (
    <View style={styles.toolRow}>
      <UIKitChatToolbarAction
        label={t('chatVoiceAction')}
        icon="toolbar-voice"
        hideLabel
        active={composerMode === 'voice'}
        activeTintColor="#337EFF"
        inactiveTintColor="#656A72"
        disabled={isCurrentTeamChatBanned}
        onPress={() => {
          const shouldRefocusInput = scrollToBottomForComposerInteraction()

          setComposerMode((current) => {
            const nextMode = current === 'voice' ? 'text' : 'voice'

            if (nextMode === 'voice') {
              Keyboard.dismiss()
            } else if (shouldRefocusInput) {
              requestAnimationFrame(() => {
                inputRef.current?.focus()
              })
            }

            return nextMode
          })
          setPanelVisible(false)
          setEmojiPanelVisible(false)
        }}
      />
      <UIKitChatToolbarAction
        label={t('toolbarEmoji' as never)}
        icon="icon-biaoqing"
        hideLabel
        active={emojiPanelVisible}
        disabled={isCurrentTeamChatBanned}
        onPress={handleOpenEmoji}
      />
      <UIKitChatToolbarAction
        label={t('chatImageAction')}
        icon="icon-tupian"
        hideLabel
        disabled={isCurrentTeamChatBanned}
        onPress={() => {
          handlePickImage().catch((error) => {
            showSendFailureAlert(error, t('chatSendMediaFailed'))
          })
        }}
      />
      <UIKitChatToolbarAction
        label={t('chatMoreAction')}
        icon="send-more"
        hideLabel
        active={panelVisible}
        disabled={isCurrentTeamChatBanned}
        onPress={() => {
          if (isCurrentTeamChatBanned) {
            return
          }

          setComposerMode('text')
          setEmojiPanelVisible(false)
          scrollToBottomForComposerInteraction()
          setPanelVisible((current) => {
            const nextVisible = !current

            if (nextVisible) {
              Keyboard.dismiss()
            }

            return nextVisible
          })
        }}
      />
    </View>
  )

  const composerLiftInset =
    Platform.OS === 'android' && androidKeyboardInset > 0
      ? androidKeyboardInset + ANDROID_KEYBOARD_EXTRA_LIFT
      : 0

  useEffect(() => {
    if (
      !mentionSelectorVisible ||
      !mentionSelectorActive ||
      conversationType !== V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM ||
      !targetId ||
      hasLoadedTeamMembers
    ) {
      return
    }

    teamStore.loadMembers(targetId).catch(() => undefined)
  }, [
    conversationType,
    hasLoadedTeamMembers,
    mentionSelectorActive,
    mentionSelectorVisible,
    targetId
  ])

  useEffect(() => {
    if (
      !nimStore.nim ||
      conversationType !== V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM ||
      !targetId
    ) {
      return
    }

    let cancelled = false

    teamStore
      .refreshTeamInfoWithNativeFallback(targetId)
      .then((team) => {
        if (cancelled || !team || team.isValidTeam === false || team.isTeamEffective === false) {
          if (!cancelled) {
            handleUnavailableTeam()
          }
          return
        }
      })
      .catch((error) => {
        if (cancelled) {
          return
        }

        console.warn('[ChatScreen] refresh team info failed', {
          teamId: targetId,
          error: error instanceof Error ? error.message : String(error)
        })

        if (isTeamUnavailableError(error)) {
          handleUnavailableTeam()
        }
      })

    return () => {
      cancelled = true
    }
  }, [conversationType, handleUnavailableTeam, targetId])

  useEffect(() => {
    if (
      !nimStore.nim ||
      conversationType !== V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM ||
      !targetId
    ) {
      return
    }

    const isCurrentTeam = (team?: { teamId?: string }) => team?.teamId === targetId

    const handleTeamDismissed = (team: V2NIMTeam) => {
      if (!isCurrentTeam(team)) {
        return
      }

      handleUnavailableTeam(TEAM_DISMISSED_TIP(), { force: true })
    }

    const handleTeamLeft = (team: V2NIMTeam) => {
      if (!isCurrentTeam(team)) {
        return
      }

      handleUnavailableTeam(TEAM_UNAVAILABLE_TIP(), { force: true })
    }

    const handleTeamInfoUpdated = (team: V2NIMTeam) => {
      if (!isCurrentTeam(team)) {
        return
      }

      teamStore.refreshTeamInfoWithNativeFallback(targetId).catch(() => undefined)
    }

    nimStore.nim.V2NIMTeamService.on('onTeamDismissed', handleTeamDismissed)
    nimStore.nim.V2NIMTeamService.on('onTeamLeft', handleTeamLeft)
    nimStore.nim.V2NIMTeamService.on('onTeamInfoUpdated', handleTeamInfoUpdated)

    return () => {
      nimStore.nim?.V2NIMTeamService.off('onTeamDismissed', handleTeamDismissed)
      nimStore.nim?.V2NIMTeamService.off('onTeamLeft', handleTeamLeft)
      nimStore.nim?.V2NIMTeamService.off('onTeamInfoUpdated', handleTeamInfoUpdated)
    }
  }, [conversationType, handleUnavailableTeam, targetId])

  const openMessage = useCallback(
    async (message: V2NIMMessage) => {
      const messageKey = getMessageKey(message)
      if (isMergedForwardMessage(message)) {
        runWithNavigationLock(() => {
          stopAllMessageAudioPlayback()
          router.push({
            pathname: '/chat/merged-forward-detail',
            params: {
              conversationId,
              messageId: messageKey
            }
          } as never)
        })
        return
      }

      if (message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_IMAGE) {
        stopAllMessageAudioPlayback()
        router.push({
          pathname: '/chat/media-viewer',
          params: {
            conversationId,
            messageId: messageKey
          }
        } as never)
        return
      }

      if (message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_VIDEO) {
        const videoAttachment = message.attachment as V2NIMMessageVideoAttachment | undefined
        const source = getVideoRenderSource(videoAttachment)

        if (!source) {
          toast.alert(t('mediaViewerOpenFailedTitle'), t('chatVideoUnavailable'))
          return
        }

        const downloadedUri = downloadedVideoMap[messageKey]
        const isLocalSource = source.startsWith('file://') || source.startsWith('content://')

        if (!isLocalSource && !downloadedUri) {
          if (downloadingVideoIds.includes(messageKey)) {
            toast.alert(t('chatDownloadingTitle'), t('chatVideoDownloading'))
            return
          }

          try {
            setDownloadingVideoIds((current) => [...current, messageKey])
            setVideoDownloadProgressMap((current) => ({
              ...current,
              [messageKey]: 0
            }))
            const localUri = await downloadFileToLocal(
              source,
              resolveFileName(
                source,
                videoAttachment?.name || 'video',
                getAttachmentExtension(videoAttachment) || 'mp4'
              ),
              (progress) => {
                setVideoDownloadProgressMap((current) => ({
                  ...current,
                  [messageKey]: progress
                }))
              }
            )
            setDownloadedVideoMap((current) => ({
              ...current,
              [messageKey]: localUri
            }))
          } catch (error) {
            toast.alert(
              t('commonLoadingFailed'),
              error instanceof Error ? error.message : t('chatVideoDownloadFailed')
            )
          } finally {
            setDownloadingVideoIds((current) => current.filter((item) => item !== messageKey))
            setVideoDownloadProgressMap((current) => {
              const next = { ...current }
              delete next[messageKey]
              return next
            })
          }
          return
        }

        stopAllMessageAudioPlayback()
        router.push({
          pathname: '/chat/media-viewer',
          params: {
            conversationId,
            messageId: messageKey,
            uri: downloadedUri || source,
            type: 'video',
            name: videoAttachment?.name || '',
            ext: getAttachmentExtension(videoAttachment)
          }
        } as never)
        return
      }

      if (message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_LOCATION) {
        router.push({
          pathname: '/chat/location-detail',
          params: {
            conversationId,
            messageId: messageKey
          }
        } as never)
        return
      }

      if (message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_FILE) {
        const fileAttachment = message.attachment as V2NIMMessageFileAttachment | undefined
        const source = getFileTransferSource(fileAttachment)
        const downloadedUri = downloadedFileMap[messageKey]
        const fileName = resolveFileName(
          source,
          fileAttachment?.name || 'attachment',
          fileAttachment?.ext
        )
        const previewableFileKind = getPreviewableFileKind(fileName, fileAttachment?.ext)

        if (!source) {
          toast.alert(t('mediaViewerOpenFailedTitle'), t('chatFileUnavailable'))
          return
        }

        const isLocalSource = source.startsWith('file://') || source.startsWith('content://')

        if (!isLocalSource && !downloadedUri) {
          if (downloadingFileIds.includes(messageKey)) {
            toast.alert(t('chatDownloadingTitle'), t('chatFileDownloading'))
            return
          }

          try {
            setDownloadingFileIds((current) => [...current, messageKey])
            setFileDownloadProgressMap((current) => ({
              ...current,
              [messageKey]: 0
            }))
            const downloadedLocalUri = await downloadFileToLocal(source, fileName, (progress) => {
              setFileDownloadProgressMap((current) => ({
                ...current,
                [messageKey]: progress
              }))
            })
            const localUri = await ensureLocalFileUri(downloadedLocalUri, fileName)
            setDownloadedFileMap((current) => ({
              ...current,
              [messageKey]: localUri
            }))
          } catch (error) {
            toast.alert(
              t('commonLoadingFailed'),
              error instanceof Error ? error.message : t('chatFileDownloadFailed')
            )
          } finally {
            setDownloadingFileIds((current) => current.filter((item) => item !== messageKey))
            setFileDownloadProgressMap((current) => {
              const next = { ...current }
              delete next[messageKey]
              return next
            })
          }
          return
        }

        try {
          const localUri = await ensureLocalFileUri(downloadedUri || source, fileName)
          setDownloadedFileMap((current) => ({
            ...current,
            [messageKey]: localUri
          }))

          if (previewableFileKind) {
            stopAllMessageAudioPlayback()
            router.push({
              pathname: '/chat/media-viewer',
              params: {
                conversationId,
                messageId: messageKey,
                uri: localUri,
                type: previewableFileKind
              }
            } as never)
            return
          }

          await openLocalFile(localUri)
        } catch (error) {
          toast.alert(
            t('mediaViewerOpenFailedTitle'),
            error instanceof Error ? error.message : t('chatFileOpenFailed')
          )
        }
        return
      }

      if (message.messageType === V2NIMMessageType.V2NIM_MESSAGE_TYPE_AUDIO) {
        await playAudioMessage(message)
        return
      }
    },
    [
      conversationId,
      downloadedFileMap,
      downloadedVideoMap,
      downloadingFileIds,
      downloadingVideoIds,
      playAudioMessage,
      runWithNavigationLock,
      t
    ]
  )

  const openReplySourceMessage = useCallback(
    async (message: V2NIMMessage) => {
      const messageKey = getMessageKey(message)

      runWithNavigationLock(() => {
        stopAllMessageAudioPlayback()
        router.push({
          pathname: '/chat/source-message',
          params: {
            conversationId: message.conversationId,
            messageId: messageKey
          }
        } as never)
      })
    },
    [runWithNavigationLock]
  )

  const startReply = (message: V2NIMMessage) => {
    const mentionPrefix = getReplyMentionPrefix(message, currentUserId, conversationType, targetId)

    setReplyDraft({ message, mentionPrefix })
    if (mentionPrefix && targetId) {
      const shouldInsertSpacer =
        inputText.length > 0 && !/\s$/.test(inputText) && !inputText.startsWith(mentionPrefix)
      const baseText = shouldInsertSpacer ? `${inputText} ` : inputText
      const result = insertMentionToken(
        baseText,
        mentionDraft,
        message.senderId,
        getMessageMentionTokenName(
          message.senderId,
          conversationType,
          targetId,
          getMessageSenderSnapshotName(message)
        ),
        baseText.length,
        false
      )
      setInputText(result.text)
      setMentionDraft(result.mentions)
      setInputSelection(result.selection)
    } else {
      setInputText((current) => {
        if (!mentionPrefix || current.includes(mentionPrefix)) {
          return current
        }

        if (!current) {
          return mentionPrefix
        }

        return /\s$/.test(current) ? current + mentionPrefix : `${current} ${mentionPrefix}`
      })
    }
    setPanelVisible(false)
    setEmojiPanelVisible(false)
    setComposerMode('text')
    setActionContext(null)
    requestAnimationFrame(() => {
      inputRef.current?.focus()
    })
  }

  const handleResendMessage = useCallback(
    async (message: V2NIMMessage) => {
      if (selectionMode) {
        return
      }

      try {
        const result = await messageStore.resendMessage(message)

        if (!result) {
          showComposerToast(t('chatResendUnsupported'))
        }
      } catch (error) {
        showSendFailureAlert(error, t('chatSendMessageFailed'))
      }
    },
    [selectionMode, showComposerToast, showSendFailureAlert, t]
  )

  const toggleMessageSelection = (message: V2NIMMessage) => {
    const revokedText = messageStore.getRevokedText(message)

    if (!isSelectableMessage(message, revokedText)) {
      return
    }

    const messageId = getMessageKey(message)
    setSelectedMessageIds((current) =>
      current.includes(messageId)
        ? current.filter((item) => item !== messageId)
        : [...current, messageId]
    )
  }
  const selectedMessageIdSet = useMemo(() => new Set(selectedMessageIds), [selectedMessageIds])

  const renderTimelineItem = useCallback(
    ({ item }: { item: TimelineItem }) => {
      if (item.type === 'time') {
        return (
          <Pressable style={styles.timeDivider} onPress={handleOutsideComposerPress}>
            <ThemedText style={styles.timeDividerText}>{item.label}</ThemedText>
          </Pressable>
        )
      }

      if (item.type === 'system') {
        return (
          <Pressable style={styles.systemRow} onPress={handleOutsideComposerPress}>
            <View style={styles.systemBubble}>
              <ThemedText style={styles.historyButtonText}>{item.label}</ThemedText>
            </View>
          </Pressable>
        )
      }

      if (item.type === 'antispam') {
        return (
          <Pressable style={styles.systemRow} onPress={handleOutsideComposerPress}>
            <View style={styles.antispamTipBubble}>
              <ThemedText style={styles.antispamTipText}>{item.label}</ThemedText>
            </View>
          </Pressable>
        )
      }

      const displaySenderAccountId = getMessageDisplaySenderAccountId(
        item.message,
        aiUserAccountIds
      )
      const isAIReplyMessage = !!getAIReplySenderAccountId(item.message, aiUserAccountIds)
      const shouldShowSenderNameOverride =
        displaySenderAccountId !== currentUserId &&
        (isAIReplyMessage ||
          (conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM && !!targetId))
      const senderNameOverride = shouldShowSenderNameOverride
        ? getMessageDisplaySenderName(
            item.message,
            displaySenderAccountId,
            conversationType,
            targetId
          )
        : undefined

      return (
        <View>
          <UIKitChatMessageBubble
            message={item.message}
            currentUserId={currentUserId}
            conversationId={conversationId}
            conversationType={conversationType}
            targetId={targetId}
            senderAccountOverride={displaySenderAccountId}
            senderNameOverride={senderNameOverride}
            onLongPress={setActionContext}
            onLongPressAvatar={insertMentionFromMessage}
            onPressMessage={(message) => {
              openMessage(message).catch((error) => {
                toast.alert(
                  t('mediaViewerOpenFailedTitle'),
                  error instanceof Error ? error.message : t('chatOpenMessageFailed')
                )
              })
            }}
            onPressReplyMessage={(message) => {
              openReplySourceMessage(message).catch((error) => {
                toast.alert(
                  t('mediaViewerOpenFailedTitle'),
                  error instanceof Error ? error.message : t('chatOpenMessageFailed')
                )
              })
            }}
            onReeditMessage={(message) => {
              if (!messageStore.canReeditRevokedMessage(message)) {
                setHiddenReeditMessageIds((current) => [...current, getMessageKey(message)])
                showComposerToast(t('chatReeditExpired'))
                return
              }

              setInputText(message.text || '')
              setMentionDraft(parseMentionExtension(message.serverExtension))
              const replyToMessage = getReplySourceMessage(conversationId, message)
              setReplyDraft(
                replyToMessage
                  ? {
                      message: replyToMessage,
                      mentionPrefix: getReplyMentionPrefix(
                        replyToMessage,
                        currentUserId,
                        conversationType,
                        targetId
                      )
                    }
                  : null
              )
              setPanelVisible(false)
              setEmojiPanelVisible(false)
              setComposerMode('text')
              requestAnimationFrame(() => {
                inputRef.current?.focus()
              })
            }}
            reeditHidden={
              hiddenReeditMessageIds.includes(getMessageKey(item.message)) ||
              !messageStore.canReeditRevokedMessage(item.message)
            }
            onRetry={handleResendMessage}
            downloadingVideoIds={downloadingVideoIds}
            downloadedVideoMap={downloadedVideoMap}
            videoDownloadProgressMap={videoDownloadProgressMap}
            downloadingFileIds={downloadingFileIds}
            downloadedFileMap={downloadedFileMap}
            fileDownloadProgressMap={fileDownloadProgressMap}
            attachmentUploadProgress={messageStore.getAttachmentUploadProgress(item.message)}
            videoUploadPreview={messageStore.getVideoUploadPreview(item.message)}
            playingAudioMessageId={playingAudioMessageId}
            selectionMode={selectionMode}
            selected={selectedMessageIdSet.has(getMessageKey(item.message))}
            selectable={isSelectableMessage(
              item.message,
              messageStore.getRevokedText(item.message)
            )}
            onToggleSelect={toggleMessageSelection}
            highlighted={highlightedMessageId === getMessageKey(item.message)}
          />
        </View>
      )
    },
    [
      aiUserAccountIds,
      conversationId,
      conversationType,
      currentUserId,
      handleOutsideComposerPress,
      downloadedFileMap,
      downloadedVideoMap,
      downloadingFileIds,
      downloadingVideoIds,
      fileDownloadProgressMap,
      hiddenReeditMessageIds,
      highlightedMessageId,
      insertMentionFromMessage,
      openMessage,
      openReplySourceMessage,
      playingAudioMessageId,
      selectedMessageIdSet,
      selectionMode,
      handleResendMessage,
      showComposerToast,
      t,
      targetId,
      videoDownloadProgressMap
    ]
  )

  const enterSelectionMode = useCallback((message?: V2NIMMessage) => {
    setSelectionMode(true)
    setPanelVisible(false)
    setEmojiPanelVisible(false)
    setReplyDraft(null)
    setActionContext(null)
    Keyboard.dismiss()

    if (message) {
      const revokedText = messageStore.getRevokedText(message)

      setSelectedMessageIds(
        isSelectableMessage(message, revokedText) ? [getMessageKey(message)] : []
      )
      return
    }

    setSelectedMessageIds([])
  }, [])

  const exitSelectionMode = useCallback(() => {
    setSelectionMode(false)
    setSelectedMessageIds([])
  }, [])

  useFocusEffect(
    useCallback(() => {
      if (!selectionMode) {
        return
      }

      if (forwardStore.consumeExitBatchSelection(conversationId)) {
        exitSelectionMode()
      }
    }, [conversationId, exitSelectionMode, selectionMode])
  )

  const messageById = useMemo(
    () =>
      new Map(
        visibleMessages
          .map((message) => [getMessageKey(message), message] as const)
          .filter(([messageId]) => !!messageId)
      ),
    [visibleMessages]
  )
  const selectedMessages = useMemo(
    () =>
      selectedMessageIds
        .map((messageId) => messageById.get(messageId))
        .filter((message): message is V2NIMMessage => !!message),
    [messageById, selectedMessageIds]
  )

  const openBatchForward = async (mode: BatchForwardMode) => {
    const limit = mode === 'serial' ? MAX_SERIAL_FORWARD : MAX_MERGED_FORWARD
    const openForwardWithMessages = (messages: V2NIMMessage[]) => {
      router.push({
        pathname: '/chat/forward',
        params: {
          conversationId,
          messageIds: messages.map((item) => getMessageKey(item)).join(','),
          mode,
          sourceTitle: forwardSourceTitle,
          sourcePayloadTitle: forwardSourcePayloadTitle
        }
      } as never)
    }

    if (selectedMessages.length === 0) {
      return
    }

    if (selectedMessages.length > limit) {
      showComposerToast(
        mode === 'serial'
          ? t('chatBatchForwardSerialLimit', { count: MAX_SERIAL_FORWARD })
          : t('chatBatchForwardMergedLimit', { count: MAX_MERGED_FORWARD })
      )
      return
    }

    const invalidMessages = selectedMessages.filter((message) => {
      if (mode === 'merged') {
        return (
          !isSelectableMessage(message, messageStore.getRevokedText(message)) ||
          message.sendingState !== V2NIMMessageSendingState.V2NIM_MESSAGE_SENDING_STATE_SUCCEEDED
        )
      }

      return !isForwardableMessage(message, messageStore.getRevokedText(message))
    })

    if (mode === 'merged') {
      const tooDeepMessages = selectedMessages.filter(
        (message) => getMergedForwardNestedLevel(message) > 2
      )

      if (tooDeepMessages.length > 0) {
        Alert.alert(t('commonTip'), t('chatMergedForwardTrimConfirm'), [
          { text: t('actionCancel'), style: 'cancel' },
          {
            text: t('actionConfirm'),
            onPress: () => {
              const blockedIds = new Set(tooDeepMessages.map((item) => getMessageKey(item)))
              const remainingMessages = selectedMessages.filter(
                (item) => !blockedIds.has(getMessageKey(item))
              )
              setSelectedMessageIds(remainingMessages.map((item) => getMessageKey(item)))

              if (remainingMessages.length === 0) {
                return
              }

              openForwardWithMessages(remainingMessages)
            }
          }
        ])
        return
      }
    }

    if (invalidMessages.length > 0) {
      showComposerToast(t('chatForwardUnsupportedMessages'))
      const blockedIds = new Set(invalidMessages.map((item) => getMessageKey(item)))
      const remainingMessages = selectedMessages.filter(
        (item) => !blockedIds.has(getMessageKey(item))
      )
      setSelectedMessageIds(remainingMessages.map((item) => getMessageKey(item)))

      return
    }

    await ensureNetworkAvailable()
    openForwardWithMessages(selectedMessages)
  }

  const handleBatchDelete = () => {
    if (selectedMessages.length === 0) {
      return
    }

    if (selectedMessages.length > MAX_BATCH_DELETE) {
      showComposerToast(t('chatBatchDeleteLimit', { count: MAX_BATCH_DELETE }))
      return
    }

    ;(async () => {
      try {
        await ensureNetworkAvailable()

        const latestMessage = visibleMessages[visibleMessages.length - 1]
        const latestMessageKey = latestMessage ? getMessageKey(latestMessage) : null
        const selectedMessageKeySet = new Set(
          selectedMessages.map((message) => getMessageKey(message))
        )
        pendingBatchDeleteBottomAlignmentRef.current =
          !!latestMessageKey && selectedMessageKeySet.has(latestMessageKey)
        pendingBatchDeleteLatestMessageKeyRef.current = pendingBatchDeleteBottomAlignmentRef.current
          ? latestMessageKey
          : null

        await messageStore.deleteRemoteMessages(selectedMessages)
        exitSelectionMode()

        if (pendingBatchDeleteBottomAlignmentRef.current) {
          if (batchDeleteBottomAlignmentExpiryTimerRef.current) {
            clearTimeout(batchDeleteBottomAlignmentExpiryTimerRef.current)
          }
          batchDeleteBottomAlignmentExpiryTimerRef.current = setTimeout(() => {
            pendingBatchDeleteBottomAlignmentRef.current = false
            pendingBatchDeleteLatestMessageKeyRef.current = null
            batchDeleteBottomAlignmentExpiryTimerRef.current = null
          }, 1000)
        }
      } catch (error) {
        pendingBatchDeleteBottomAlignmentRef.current = false
        pendingBatchDeleteLatestMessageKeyRef.current = null
        if (batchDeleteBottomAlignmentExpiryTimerRef.current) {
          clearTimeout(batchDeleteBottomAlignmentExpiryTimerRef.current)
          batchDeleteBottomAlignmentExpiryTimerRef.current = null
        }
        toast.alert(
          t('commonDeleteFailed'),
          error instanceof Error ? error.message : NETWORK_UNAVAILABLE_MESSAGE
        )
      }
    })().catch(() => undefined)
  }

  const handleCopyMessage = async (message: V2NIMMessage | null) => {
    if (!message?.text) {
      return
    }

    await Clipboard.setStringAsync(message.text)
    showComposerToast(t('chatCopySuccess'))
  }

  const handleDeleteMessage = (message: V2NIMMessage) => {
    if (!message) {
      return
    }

    setActionContext(null)
    Alert.alert(t('chatDeleteMessageTitle'), t('chatDeleteSingleConfirm'), [
      { text: t('actionCancel'), style: 'cancel' },
      {
        text: t('actionConfirm'),
        style: 'destructive',
        onPress: async () => {
          try {
            await ensureNetworkAvailable()

            if (
              message.sendingState === V2NIMMessageSendingState.V2NIM_MESSAGE_SENDING_STATE_FAILED
            ) {
              messageStore.deleteMessage(conversationId, getMessageKey(message))
              return
            }

            await messageStore.deleteRemoteMessage(message)
          } catch (error) {
            toast.alert(
              t('commonDeleteFailed'),
              error instanceof Error ? error.message : NETWORK_UNAVAILABLE_MESSAGE
            )
          }
        }
      }
    ])
  }

  const handleRevokeMessage = (message: V2NIMMessage) => {
    if (!message) {
      return
    }

    if (Date.now() - message.createTime > 2 * 60 * 1000) {
      setActionContext(null)
      toast.alert(t('chatRevokeFailedTitle'), t('chatRevokeExpired'))
      return
    }

    setActionContext(null)
    Alert.alert(t('chatRevokeMessageTitle'), t('chatRevokeConfirm'), [
      { text: t('actionCancel'), style: 'cancel' },
      {
        text: t('actionConfirm'),
        onPress: async () => {
          try {
            await ensureNetworkAvailable()
            await messageStore.revokeMessage(message)
          } catch (error) {
            toast.alert(
              t('chatRevokeFailedTitle'),
              error instanceof Error ? error.message : NETWORK_UNAVAILABLE_MESSAGE
            )
          }
        }
      }
    ])
  }

  const handleActionPress = async (key: MessageActionKey | 'multi') => {
    const selectedActionMessage = actionMessage
    setActionContext(null)

    if (key === 'copy') {
      await handleCopyMessage(selectedActionMessage)
      return
    }

    if (key === 'reply' && selectedActionMessage) {
      startReply(selectedActionMessage)
      return
    }

    if (key === 'forward' && selectedActionMessage) {
      const messageKey =
        selectedActionMessage.messageClientId || selectedActionMessage.messageServerId
      stopAllMessageAudioPlayback()
      router.push({
        pathname: '/chat/forward',
        params: {
          conversationId,
          messageId: messageKey
        }
      } as never)
      return
    }

    if (key === 'multi') {
      enterSelectionMode(selectedActionMessage || undefined)
      return
    }

    if (key === 'pin' && selectedActionMessage) {
      const wasPinned = messageStore.isMessagePinned(selectedActionMessage)

      try {
        await ensureNetworkAvailable()
        await messageStore.toggleMessagePin(selectedActionMessage)
        toast.alert(wasPinned ? t('chatUnpinSuccess') : t('chatPinSuccess'))
      } catch (error) {
        toast.alert(
          wasPinned ? t('chatUnpinFailed') : t('chatPinFailed'),
          error instanceof Error ? error.message : NETWORK_UNAVAILABLE_MESSAGE
        )
      }
      return
    }

    if (key === 'collect' && selectedActionMessage) {
      try {
        await ensureNetworkAvailable()
        await collectionStore.collectMessage(selectedActionMessage)
        toast.alert(t('chatCollectSuccess'))
      } catch (error) {
        toast.alert(
          t('chatCollectFailed'),
          error instanceof Error ? error.message : NETWORK_UNAVAILABLE_MESSAGE
        )
      }
      return
    }

    if (key === 'resend' && selectedActionMessage) {
      await handleResendMessage(selectedActionMessage)
      return
    }

    if (key === 'delete' && selectedActionMessage) {
      handleDeleteMessage(selectedActionMessage)
      return
    }

    if (key === 'revoke' && selectedActionMessage) {
      handleRevokeMessage(selectedActionMessage)
    }
  }

  const handleHeaderRightPress = useCallback(() => {
    if (selectionMode) {
      setSelectionMode(false)
      setSelectedMessageIds([])
      return
    }

    runWithNavigationLock(() => {
      stopAllMessageAudioPlayback()
      if (conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM) {
        router.push({
          pathname: '/team/settings',
          params: { teamId: targetId, conversationId }
        } as never)
        return
      }

      router.push({
        pathname: '/session/p2p-settings',
        params: { conversationId }
      } as never)
    })
  }, [conversationId, conversationType, runWithNavigationLock, selectionMode, targetId])

  const headerTitleNode = useMemo(
    () => (
      <UIKitChatHeaderTitle
        title={title}
        subtitle={headerSubtitle || undefined}
        statusText={headerStatusText || undefined}
      />
    ),
    [headerStatusText, headerSubtitle, title]
  )

  const headerRightNode = useMemo(
    () => (
      <TouchableOpacity
        style={styles.headerButton}
        onPress={handleHeaderRightPress}
        disabled={!selectionMode && isNavigationLocked()}
      >
        {selectionMode ? (
          <ThemedText style={styles.headerButtonText}>{t('actionCancel')}</ThemedText>
        ) : (
          <UIKitIcon type="icon-More" size={28} />
        )}
      </TouchableOpacity>
    ),
    [handleHeaderRightPress, isNavigationLocked, selectionMode, t]
  )

  useLayoutEffect(() => {
    navigationRef.current.setOptions({
      headerShown: true,
      headerTitle: () => headerTitleNode,
      headerTitleAlign: 'center',
      headerBackVisible: false,
      headerShadowVisible: false,
      headerStyle: {
        backgroundColor: '#FFFFFF'
      },
      headerRight: () => headerRightNode
    })
  }, [headerRightNode, headerTitleNode])

  const composerToastOverlay = composerToastMessage ? (
    <View style={styles.composerToastOverlay} pointerEvents="none">
      <View style={styles.composerToastBubble}>
        <ThemedText style={styles.composerToastText}>{composerToastMessage}</ThemedText>
      </View>
    </View>
  ) : null

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight : undefined}
      >
        {selectionMode ? (
          <View style={styles.selectionBanner} onTouchStart={handleOutsideComposerPress}>
            <ThemedText style={styles.selectionBannerText}>
              {t('chatSelectDoneCount', { count: selectedMessages.length })}
            </ThemedText>
          </View>
        ) : null}

        {networkBannerText ? (
          <View onTouchStart={handleOutsideComposerPress}>
            <UIKitNoticeBanner text={networkBannerText} />
          </View>
        ) : null}

        {shouldShowNonFriendTip && !selectionMode ? (
          <View onTouchStart={handleOutsideComposerPress}>
            <UIKitNoticeBanner text={NON_FRIEND_TIP_TEXT()} tone="warning" />
          </View>
        ) : null}

        {shouldShowSecurityTip && !securityTipDismissed && !selectionMode ? (
          <View style={styles.securityTip} onTouchStart={handleOutsideComposerPress}>
            <ThemedText style={styles.securityTipText}>
              {SECURITY_TIP_TEXT()}
              <ThemedText
                accessibilityRole="link"
                style={styles.securityTipLinkText}
                onPress={() => {
                  handleOpenReport()
                }}
              >
                {t('chatSecurityTipReportLink')}
              </ThemedText>
            </ThemedText>
            <TouchableOpacity
              style={styles.securityTipClose}
              onPress={() => {
                setSecurityTipDismissed(true)
              }}
            >
              <ThemedText style={styles.securityTipCloseText}>×</ThemedText>
            </TouchableOpacity>
          </View>
        ) : null}

        <FlatList
          key={conversationId}
          ref={messageScrollRef}
          style={styles.messagesListView}
          onTouchStart={handleOutsideComposerPress}
          data={displayTimeline}
          inverted
          maintainVisibleContentPosition={
            forceLatestScrollUntilSettledRef.current
              ? undefined
              : {
                  minIndexForVisible: 0,
                  ...(listAutoFollowEnabled ? { autoscrollToTopThreshold: 72 } : {})
                }
          }
          keyExtractor={(item) => item.key}
          renderItem={renderTimelineItem}
          extraData={messageIdentitySignature}
          contentContainerStyle={[
            styles.messagesList,
            messageState.loading && displayTimeline.length === 0 && styles.messagesListEmpty
          ]}
          onLayout={flushPendingInitialBottom}
          onContentSizeChange={handleMessageListContentSizeChange}
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={() => {
            hasUserScrolledRef.current = true
            if (
              isNearBottomRef.current &&
              !isBrowsingHistoryRef.current &&
              deferredLatestMessageKeySetRef.current.size > 0 &&
              pausedTimelineMessageCountRef.current !== null
            ) {
              isBrowsingHistoryRef.current = true
              listAutoFollowEnabledRef.current = false
              setListAutoFollowEnabled(false)
              setShowScrollBottomShortcut(true)
              if (revealNextDeferredLatestMessage()) {
                deferredRevealScrollOffsetRef.current = lastMessageListScrollOffsetRef.current
              }
            }
          }}
          onScroll={handleMessageListScroll}
          scrollEventThrottle={16}
          onViewableItemsChanged={handleMessageListViewableItemsChanged}
          viewabilityConfig={messageListViewabilityConfig}
          initialNumToRender={18}
          maxToRenderPerBatch={12}
          windowSize={9}
          removeClippedSubviews={Platform.OS === 'android'}
          onScrollToIndexFailed={handleScrollToIndexFailed}
          ListFooterComponent={
            messageState.hasMore || messageState.loadingMore ? (
              <View style={styles.historyLoadingWrap}>
                {messageState.loadingMore ? (
                  <ActivityIndicator color="#337EFF" />
                ) : (
                  <ThemedText style={styles.historyButtonText}>
                    {t('chatPullToLoadHistory')}
                  </ThemedText>
                )}
              </View>
            ) : composerMode === 'voice' || panelVisible || emojiPanelVisible ? (
              <Pressable
                style={styles.messagesBlankDismissArea}
                onPress={handleOutsideComposerPress}
              />
            ) : null
          }
          ListEmptyComponent={
            messageState.loading ? (
              <View style={styles.emptyState}>
                <ActivityIndicator color="#337EFF" />
              </View>
            ) : (
              <Pressable
                style={styles.emptyVoiceDismissArea}
                onPress={handleOutsideComposerPress}
              />
            )
          }
        />

        <Modal
          transparent
          visible={!selectionMode && !!actionMessage}
          animationType="fade"
          onRequestClose={() => setActionContext(null)}
        >
          <Pressable style={styles.actionMask} onPress={() => setActionContext(null)}>
            <View style={styles.actionOverlay} pointerEvents="box-none">
              {actionMessage && actionMenuPosition ? (
                <Pressable
                  style={[
                    styles.actionSheet,
                    {
                      width: actionMenuWidth,
                      left: actionMenuPosition.left,
                      top: actionMenuPosition.top
                    }
                  ]}
                  onPress={() => undefined}
                >
                  <UIKitChatActionGrid
                    columns={actionMenuColumns}
                    items={actionItems.map((item) => ({
                      key: item.key,
                      label: item.label,
                      icon: item.icon,
                      danger: item.destructive,
                      onPress: () => {
                        handleActionPress(item.key).catch((error) => {
                          toast.alert(
                            t('chatActionFailedTitle'),
                            error instanceof Error ? error.message : t('chatActionFailedMessage')
                          )
                        })
                      }
                    }))}
                  />
                </Pressable>
              ) : null}
            </View>
          </Pressable>
        </Modal>

        <Modal
          transparent
          visible={mentionSelectorActive}
          animationType="slide"
          onRequestClose={() => {
            setMentionSelectorVisible(false)
            setPendingMentionSelectionStart(null)
          }}
        >
          <Pressable
            style={styles.mentionMask}
            onPress={() => {
              setMentionSelectorVisible(false)
              setPendingMentionSelectionStart(null)
            }}
          >
            <Pressable style={styles.mentionSheet} onPress={() => undefined}>
              <View style={styles.mentionHandle} />
              <View style={styles.mentionHeader}>
                <ThemedText style={styles.mentionTitle}>{t('chatMentionSelectTitle')}</ThemedText>
                <TouchableOpacity
                  style={styles.mentionCloseButton}
                  onPress={() => {
                    setMentionSelectorVisible(false)
                    setPendingMentionSelectionStart(null)
                  }}
                >
                  <UIKitIcon type="icon-guanbi" size={16} tintColor="#7B8594" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={mentionCandidates}
                keyExtractor={(item) => item.accountId}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.mentionListContent}
                removeClippedSubviews={Platform.OS !== 'android'}
                initialNumToRender={MENTION_LIST_INITIAL_RENDER_COUNT}
                maxToRenderPerBatch={MENTION_LIST_BATCH_RENDER_COUNT}
                windowSize={MENTION_LIST_WINDOW_SIZE}
                updateCellsBatchingPeriod={0}
                onViewableItemsChanged={handleMentionViewableItemsChanged}
                viewabilityConfig={mentionViewabilityConfig}
                getItemLayout={(_, index) => ({
                  length: MENTION_ROW_HEIGHT,
                  offset: MENTION_ROW_HEIGHT * index,
                  index
                })}
                ListEmptyComponent={
                  <View style={styles.mentionEmpty}>
                    <ThemedText style={styles.mentionEmptyText}>{t('chatMentionEmpty')}</ThemedText>
                  </View>
                }
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.mentionRow}
                    onPress={() => insertMention(item.accountId, item.insertName, true)}
                  >
                    {item.isAtAll ? (
                      <UIKitIcon type="icon-team-all-avatar" size={42} />
                    ) : (
                      <UIKitUserAvatar account={item.accountId} teamId={targetId} size={42} />
                    )}
                    <View style={styles.mentionMeta}>
                      <ThemedText style={styles.mentionName} numberOfLines={1}>
                        {item.displayName}
                      </ThemedText>
                    </View>
                  </TouchableOpacity>
                )}
              />
            </Pressable>
          </Pressable>
        </Modal>

        <Modal
          transparent
          visible={limitedMediaPickerVisible}
          animationType="slide"
          onRequestClose={closeLimitedMediaPicker}
        >
          <View style={styles.limitedMediaMask}>
            <Pressable style={StyleSheet.absoluteFill} onPress={closeLimitedMediaPicker} />
            <View
              style={[styles.limitedMediaSheet, { paddingBottom: Math.max(insets.bottom, 12) }]}
            >
              {composerToastOverlay}
              <View style={styles.limitedMediaHandle} />
              <View style={styles.limitedMediaHeader}>
                <TouchableOpacity
                  style={styles.limitedMediaHeaderSide}
                  onPress={closeLimitedMediaPicker}
                >
                  <ThemedText style={styles.limitedMediaHeaderAction}>
                    {t('actionCancel')}
                  </ThemedText>
                </TouchableOpacity>
                <ThemedText style={styles.limitedMediaTitle}>
                  {t(
                    limitedMediaSendMode === 'file'
                      ? 'chatFileAlbumPickerTitle'
                      : 'chatLimitedMediaPickerTitle'
                  )}
                </ThemedText>
                <TouchableOpacity
                  disabled={limitedMediaSelectedAssetIds.length === 0}
                  style={styles.limitedMediaHeaderSide}
                  onPress={() => {
                    handleSendLimitedMediaSelection().catch((error) => {
                      showSendFailureAlert(error, t('chatSendMediaFailed'))
                    })
                  }}
                >
                  <ThemedText
                    style={[
                      styles.limitedMediaHeaderAction,
                      limitedMediaSelectedAssetIds.length === 0 &&
                        styles.limitedMediaHeaderActionDisabled
                    ]}
                  >
                    {`${t('chatLimitedMediaPickerConfirm')}(${limitedMediaSelectedAssetIds.length})`}
                  </ThemedText>
                </TouchableOpacity>
              </View>

              {limitedMediaLoading ? (
                <View style={styles.limitedMediaLoadingState}>
                  <ActivityIndicator color="#337EFF" />
                  <ThemedText style={styles.limitedMediaLoadingText}>
                    {t('chatLimitedMediaPickerLoading')}
                  </ThemedText>
                </View>
              ) : (
                <FlatList
                  key={`limited-media-${limitedMediaPickerRevision}`}
                  data={limitedMediaPickerItems}
                  keyExtractor={(item) =>
                    item.type === 'asset' ? item.asset.id : 'limited-media-add-more'
                  }
                  numColumns={3}
                  initialNumToRender={LIMITED_MEDIA_GRID_INITIAL_RENDER_COUNT}
                  maxToRenderPerBatch={LIMITED_MEDIA_GRID_BATCH_RENDER_COUNT}
                  windowSize={LIMITED_MEDIA_GRID_WINDOW_SIZE}
                  updateCellsBatchingPeriod={32}
                  contentContainerStyle={[
                    styles.limitedMediaGridContent,
                    limitedMediaPickerItems.length === 0 && styles.limitedMediaGridEmptyContent
                  ]}
                  columnWrapperStyle={styles.limitedMediaGridRow}
                  getItemLayout={getLimitedMediaItemLayout}
                  extraData={limitedMediaGridExtraData}
                  scrollEventThrottle={16}
                  onViewableItemsChanged={handleLimitedMediaViewableItemsChanged}
                  viewabilityConfig={limitedMediaViewabilityConfig}
                  onMomentumScrollBegin={() => {
                    limitedMediaEndReachedDuringMomentumRef.current = false
                  }}
                  onEndReached={() => {
                    if (limitedMediaEndReachedDuringMomentumRef.current) {
                      return
                    }

                    limitedMediaEndReachedDuringMomentumRef.current = true
                    triggerLimitedMediaPrefetch()
                  }}
                  onEndReachedThreshold={0.35}
                  ListEmptyComponent={
                    <View style={styles.limitedMediaEmptyState}>
                      <ThemedText style={styles.limitedMediaEmptyText}>
                        {t('chatLimitedMediaPickerEmpty')}
                      </ThemedText>
                      {limitedMediaAccessLimited ? null : (
                        <TouchableOpacity
                          style={styles.limitedMediaEmptyAction}
                          onPress={() => {
                            handleAddMoreLimitedMediaAssets().catch(() => undefined)
                          }}
                        >
                          <ThemedText style={styles.limitedMediaEmptyActionText}>
                            {t('chatAddMorePhotos')}
                          </ThemedText>
                        </TouchableOpacity>
                      )}
                    </View>
                  }
                  ListFooterComponent={
                    limitedMediaLoadingMore ? (
                      <View style={styles.limitedMediaFooterLoading}>
                        <ActivityIndicator color="#337EFF" />
                      </View>
                    ) : null
                  }
                  renderItem={({ item }) => {
                    if (item.type === 'add-more') {
                      return (
                        <LimitedMediaAddTile
                          size={limitedMediaTileSize}
                          onPress={() => {
                            handleAddMoreLimitedMediaAssets().catch(() => undefined)
                          }}
                        />
                      )
                    }

                    const asset = item.asset
                    const selectionOrder = limitedMediaSelectionOrderMap.get(asset.id) || 0
                    const isSelected = limitedMediaSelectedIdSet.has(asset.id)
                    const isDisabled = limitedMediaDisabledIdSet.has(asset.id)

                    return (
                      <LimitedMediaTile
                        asset={asset}
                        disabled={isDisabled}
                        selected={isSelected}
                        selectionOrder={selectionOrder}
                        size={limitedMediaTileSize}
                        thumbnailUri={limitedMediaThumbnailUriMap[asset.id]}
                        onPress={toggleLimitedMediaSelection}
                      />
                    )
                  }}
                />
              )}
            </View>
          </View>
        </Modal>

        {selectionMode ? (
          <View style={[styles.selectionActions, { paddingBottom: Math.max(insets.bottom, 12) }]}>
            {composerToastOverlay}
            <UIKitChatToolbarAction
              label={t('chatBatchForwardMerged')}
              icon="icon-multiselect-merge-forward"
              noTint
              iconSize={48}
              iconWrapSize={48}
              onPress={() =>
                openBatchForward('merged').catch((error) => {
                  toast.alert(
                    t('chatActionFailedTitle'),
                    error instanceof Error ? error.message : NETWORK_UNAVAILABLE_MESSAGE
                  )
                })
              }
              active={selectedMessages.length > 0}
              disabled={selectedMessages.length === 0}
            />
            <UIKitChatToolbarAction
              label={t('chatBatchForwardSerial')}
              icon="icon-multiselect-serial-forward"
              noTint
              iconSize={48}
              iconWrapSize={48}
              onPress={() =>
                openBatchForward('serial').catch((error) => {
                  toast.alert(
                    t('chatActionFailedTitle'),
                    error instanceof Error ? error.message : NETWORK_UNAVAILABLE_MESSAGE
                  )
                })
              }
              active={selectedMessages.length > 0}
              disabled={selectedMessages.length === 0}
            />
            <UIKitChatToolbarAction
              label={t('commonDelete')}
              icon="icon-multiselect-delete"
              noTint
              iconSize={48}
              iconWrapSize={48}
              onPress={handleBatchDelete}
              active={selectedMessages.length > 0}
              disabled={selectedMessages.length === 0}
            />
          </View>
        ) : (
          <View
            style={[
              styles.composerDock,
              composerLiftInset > 0 && { paddingBottom: composerLiftInset }
            ]}
          >
            {composerToastOverlay}
            {showScrollBottomShortcut && !selectionMode ? (
              <View style={styles.scrollBottomShortcutOverlay} pointerEvents="box-none">
                <TouchableOpacity
                  style={[
                    styles.scrollBottomShortcutButton,
                    scrollBottomShortcutCount > 0 && styles.scrollBottomShortcutButtonWithText
                  ]}
                  onPress={handleScrollBottomShortcutPress}
                >
                  <MaterialCommunityIcons name="chevron-double-down" size={18} color="#1861DF" />
                  {scrollBottomShortcutCount > 0 ? (
                    <ThemedText style={styles.scrollBottomShortcutText}>
                      {t('chatNewMessageNoticeCount', {
                        count: Math.max(1, scrollBottomShortcutCount)
                      })}
                    </ThemedText>
                  ) : null}
                </TouchableOpacity>
              </View>
            ) : null}
            <ThemedView
              style={[styles.composerContainer, { paddingBottom: Math.max(insets.bottom, 12) }]}
            >
              {replyDraft ? (
                <View style={styles.replyDraftContainer}>
                  <View style={styles.replyDraftContent}>
                    <ThemedText style={styles.replyDraftTitle} numberOfLines={1}>
                      {t('chatReplyTo', { name: replySenderName })}
                    </ThemedText>
                    <ThemedText style={styles.replyDraftText} numberOfLines={1}>
                      {replyPreviewText}
                    </ThemedText>
                  </View>
                  <TouchableOpacity
                    style={styles.replyDraftClose}
                    onPress={() => setReplyDraft(null)}
                  >
                    <UIKitIcon type="icon-guanbi" size={14} tintColor="#7B8594" />
                  </TouchableOpacity>
                </View>
              ) : null}
              {composerMode === 'voice' && !recorderState.isRecording ? toolRow : null}
              {composerMode === 'voice' ? (
                <View
                  style={[
                    styles.voiceRecorderPanel,
                    recorderState.isRecording
                      ? styles.voiceRecorderPanelActive
                      : styles.voiceRecorderPanelIdle
                  ]}
                >
                  {recorderState.isRecording ? (
                    <ThemedText style={styles.voiceRecorderTopTip}>
                      {voiceCancelHintVisible
                        ? t('chatVoiceReleaseToCancel')
                        : t('chatVoiceReleaseToSend')}
                    </ThemedText>
                  ) : null}
                  <Pressable
                    style={styles.voiceRecordTouchArea}
                    onPressIn={() => {
                      handleStartVoiceRecording().catch((error) => {
                        toast.alert(
                          t('chatRecordFailedTitle'),
                          error instanceof Error ? error.message : t('chatRecordStartFailed')
                        )
                      })
                    }}
                    onPressOut={(event) => {
                      handleStopVoiceRecording(false, {
                        locationX: event.nativeEvent.locationX,
                        locationY: event.nativeEvent.locationY
                      }).catch((error) => {
                        showSendFailureAlert(error, t('chatSendAudioFailed'))
                      })
                    }}
                    onTouchMove={(event) => {
                      handleVoiceRecordTouchMove(
                        event.nativeEvent.locationX,
                        event.nativeEvent.locationY
                      )
                    }}
                    disabled={recordingBusy}
                  >
                    {recorderState.isRecording ? (
                      <Animated.View
                        style={[styles.voiceRecorderOuterWave, voiceWaveAnimatedStyle]}
                      />
                    ) : null}
                    <View
                      style={[
                        styles.voiceRecorderButton,
                        recorderState.isRecording && styles.voiceRecorderButtonActive
                      ]}
                    >
                      <UIKitIcon type="toolbar-voice" size={34} tintColor="#FFFFFF" />
                      {recorderState.isRecording ? <View style={styles.voicePressedMask} /> : null}
                    </View>
                  </Pressable>
                  {!recorderState.isRecording ? (
                    <ThemedText style={styles.voiceRecorderText}>
                      {recordingBusy ? t('chatVoiceProcessing') : t('chatHoldToTalk')}
                    </ThemedText>
                  ) : null}
                </View>
              ) : (
                <View
                  style={[
                    styles.inputContainer,
                    isCurrentTeamChatBanned && styles.inputContainerDisabled
                  ]}
                >
                  <View style={styles.inputRow}>
                    <View style={styles.inputFieldWrap}>
                      {!inputText ? (
                        <ThemedText
                          numberOfLines={1}
                          ellipsizeMode="tail"
                          style={[
                            styles.inputPlaceholder,
                            isCurrentTeamChatBanned && styles.inputPlaceholderDisabled
                          ]}
                        >
                          {isCurrentTeamChatBanned
                            ? TEAM_CHAT_BANNED_PLACEHOLDER()
                            : t('chatSendToConversation', { name: title })}
                        </ThemedText>
                      ) : null}
                      <TextInput
                        ref={inputRef}
                        style={[styles.input, isCurrentTeamChatBanned && styles.inputDisabled]}
                        value={inputText}
                        onChangeText={handleComposerTextChange}
                        editable={!isCurrentTeamChatBanned}
                        onPressIn={() => {
                          scrollToBottomForComposerInteraction()
                        }}
                        onSelectionChange={(event) => {
                          setInputSelection(event.nativeEvent.selection)
                        }}
                        onFocus={() => {
                          const shouldAlignBottom = scrollToBottomForComposerInteraction()
                          inputFocusedRef.current = true
                          setComposerMode('text')
                          setPanelVisible(false)
                          setEmojiPanelVisible(false)
                          pendingKeyboardBottomAlignmentRef.current = shouldAlignBottom
                        }}
                        onBlur={() => {
                          inputFocusedRef.current = false
                        }}
                        multiline={false}
                        returnKeyType="send"
                        blurOnSubmit={false}
                        enablesReturnKeyAutomatically
                        onSubmitEditing={() => {
                          handleSendMessage().catch((error) => {
                            showSendFailureAlert(error, t('chatSendMessageFailed'))
                          })
                        }}
                      />
                    </View>
                  </View>
                </View>
              )}
              {composerMode === 'voice' ? null : toolRow}
            </ThemedView>
            {panelVisible ? (
              <View style={[styles.panel, { paddingBottom: Math.max(insets.bottom, 12) }]}>
                <TouchableOpacity
                  style={[
                    styles.panelButton,
                    isCurrentTeamChatBanned && styles.panelButtonDisabled
                  ]}
                  disabled={isCurrentTeamChatBanned}
                  onPress={handleOpenCameraActions}
                >
                  <View style={styles.panelButtonIcon}>
                    <UIKitIcon type="icon-paishe" size={26} />
                  </View>
                  <ThemedText style={styles.panelButtonText}>{t('chatPanelCapture')}</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.panelButton,
                    isCurrentTeamChatBanned && styles.panelButtonDisabled
                  ]}
                  disabled={isCurrentTeamChatBanned}
                  onPress={handlePickFile}
                >
                  <View style={styles.panelButtonIcon}>
                    <UIKitIcon type="icon-file" size={24} />
                  </View>
                  <ThemedText style={styles.panelButtonText}>{t('chatPanelFile')}</ThemedText>
                </TouchableOpacity>
              </View>
            ) : null}
            {emojiPanelVisible ? (
              <UIKitEmojiPanel
                bottomInset={Math.max(insets.bottom, 8)}
                onEmojiPress={handleEmojiPress}
                onDeletePress={handleEmojiDelete}
                onSendPress={() => {
                  handleSendMessage().catch((error) => {
                    showSendFailureAlert(error, t('chatSendMessageFailed'))
                  })
                }}
              />
            ) : null}
          </View>
        )}
      </KeyboardAvoidingView>
    </ThemedView>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  keyboardAvoidingView: {
    flex: 1
  },
  messagesListView: {
    flex: 1,
    minHeight: 0
  },
  messagesList: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF'
  },
  messagesListEmpty: {
    justifyContent: 'center'
  },
  securityTip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFF7E8',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#F2E1C4',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F2E1C4',
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  securityTipText: {
    flex: 1,
    color: '#9A5B00',
    fontSize: 13,
    lineHeight: 18
  },
  securityTipLinkText: {
    color: '#337EFF',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600'
  },
  securityTipClose: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
  securityTipCloseText: {
    color: '#9A5B00',
    fontSize: 22,
    lineHeight: 24
  },
  scrollBottomShortcutOverlay: {
    position: 'absolute',
    top: -52,
    right: 16,
    alignItems: 'flex-end',
    zIndex: 2,
    elevation: 4
  },
  scrollBottomShortcutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3
  },
  scrollBottomShortcutButtonWithText: {
    width: 'auto',
    minWidth: 40,
    paddingLeft: 12,
    paddingRight: 16,
    columnGap: 2
  },
  scrollBottomShortcutText: {
    color: '#337EFF',
    fontSize: 14,
    lineHeight: 20
  },
  composerToastOverlay: {
    position: 'absolute',
    top: -94,
    left: 16,
    right: 16,
    alignItems: 'center',
    zIndex: 3,
    elevation: 5
  },
  composerToastBubble: {
    maxWidth: '86%',
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    paddingHorizontal: 14,
    paddingVertical: 9
  },
  composerToastText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center'
  },
  mentionMask: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.28)'
  },
  mentionSheet: {
    maxHeight: '68%',
    minHeight: 360,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: '#FFFFFF',
    paddingTop: 8,
    overflow: 'hidden'
  },
  mentionHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D9DEE8',
    marginBottom: 8
  },
  mentionHeader: {
    minHeight: 44,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  mentionTitle: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '700',
    color: '#1F2937'
  },
  mentionCloseButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center'
  },
  mentionListContent: {
    paddingBottom: 18
  },
  mentionRow: {
    minHeight: 64,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  mentionMeta: {
    flex: 1,
    minWidth: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EEF1F5',
    paddingVertical: 10
  },
  mentionName: {
    color: '#1F2937',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600'
  },
  mentionEmpty: {
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center'
  },
  mentionEmptyText: {
    color: '#8B95A5',
    fontSize: 14
  },
  limitedMediaMask: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.28)'
  },
  limitedMediaSheet: {
    maxHeight: '78%',
    minHeight: 420,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: '#FFFFFF',
    paddingTop: 8,
    overflow: 'hidden'
  },
  limitedMediaHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D9DEE8',
    marginBottom: 8
  },
  limitedMediaHeader: {
    minHeight: 44,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  limitedMediaHeaderSide: {
    minWidth: 64,
    minHeight: 36,
    justifyContent: 'center'
  },
  limitedMediaHeaderAction: {
    color: '#337EFF',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700'
  },
  limitedMediaHeaderActionDisabled: {
    opacity: 0.45
  },
  limitedMediaTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#1F2937',
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '700'
  },
  limitedMediaLoadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10
  },
  limitedMediaLoadingText: {
    color: '#8B95A5',
    fontSize: 14,
    lineHeight: 20
  },
  limitedMediaGridContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12
  },
  limitedMediaGridEmptyContent: {
    flexGrow: 1
  },
  limitedMediaGridRow: {
    gap: 4,
    marginBottom: 4
  },
  limitedMediaTile: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#EEF1F5'
  },
  limitedMediaAddTile: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#D6DEEA',
    backgroundColor: '#F7F9FC',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12
  },
  limitedMediaAddTileIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E9F1FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10
  },
  limitedMediaAddTileIconHorizontal: {
    position: 'absolute',
    width: 14,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#337EFF'
  },
  limitedMediaAddTileIconVertical: {
    position: 'absolute',
    width: 2,
    height: 14,
    borderRadius: 1,
    backgroundColor: '#337EFF'
  },
  limitedMediaAddTileText: {
    color: '#337EFF',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    textAlign: 'center'
  },
  limitedMediaTileDisabled: {
    opacity: 0.52
  },
  limitedMediaTileImage: {
    width: '100%',
    height: '100%'
  },
  limitedMediaTilePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#EEF1F5'
  },
  limitedMediaTileSelectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(51, 126, 255, 0.22)'
  },
  limitedMediaTileDisabledOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.46)'
  },
  limitedMediaTileCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    backgroundColor: 'rgba(15, 23, 42, 0.24)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  limitedMediaTileCheckSelected: {
    borderColor: '#337EFF',
    backgroundColor: '#337EFF'
  },
  limitedMediaTileCheckDisabled: {
    borderColor: 'rgba(255, 255, 255, 0.66)',
    backgroundColor: 'rgba(15, 23, 42, 0.14)'
  },
  limitedMediaTileCheckText: {
    color: '#FFFFFF',
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700'
  },
  limitedMediaVideoBadge: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.62)',
    paddingHorizontal: 8,
    paddingVertical: 3
  },
  limitedMediaVideoBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600'
  },
  limitedMediaEmptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24
  },
  limitedMediaEmptyText: {
    color: '#8B95A5',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center'
  },
  limitedMediaEmptyAction: {
    marginTop: 14,
    minHeight: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: '#EEF4FF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  limitedMediaEmptyActionText: {
    color: '#337EFF',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700'
  },
  limitedMediaFooterLoading: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerButtonText: {
    color: '#337EFF',
    fontWeight: '700'
  },
  historyButton: {
    alignSelf: 'center',
    minHeight: 32,
    minWidth: 118,
    borderRadius: 16,
    backgroundColor: '#F2F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    marginBottom: 16
  },
  historyButtonText: {
    color: '#8B95A5',
    fontSize: 12,
    fontWeight: '600'
  },
  historyLoadingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 32,
    marginBottom: 16
  },
  emptyState: {
    paddingVertical: 48,
    alignItems: 'center'
  },
  messagesBlankDismissArea: {
    minHeight: 48,
    marginBottom: 16
  },
  emptyVoiceDismissArea: {
    flex: 1,
    minHeight: 160
  },
  timeDivider: {
    alignItems: 'center',
    marginBottom: 18
  },
  timeDividerText: {
    fontSize: 12,
    color: '#97A2B2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#F5F7FA'
  },
  systemRow: {
    alignItems: 'center',
    marginBottom: 18
  },
  systemBubble: {
    borderRadius: 999,
    backgroundColor: '#F3F6FA',
    paddingHorizontal: 14,
    paddingVertical: 6
  },
  reeditSystemBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  antispamTipBubble: {
    maxWidth: '92%',
    paddingHorizontal: 4
  },
  antispamTipText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#8A95A5',
    textAlign: 'center'
  },
  friendDeletedTipBubble: {
    maxWidth: '92%',
    borderRadius: 999,
    backgroundColor: '#F3F6FA',
    paddingHorizontal: 14,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  friendDeletedTipText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#8A95A5'
  },
  friendVerificationText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#337EFF',
    fontWeight: '700'
  },
  inlineFriendDeletedTip: {
    maxWidth: 240,
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end'
  },
  systemText: {
    fontSize: 12,
    color: '#8A95A5'
  },
  reeditText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#337EFF',
    fontWeight: '700'
  },
  myMessageRow: {
    flexDirection: 'row',
    marginBottom: 18,
    alignItems: 'flex-end',
    justifyContent: 'flex-end'
  },
  otherMessageRow: {
    flexDirection: 'row',
    marginBottom: 18,
    alignItems: 'flex-end',
    justifyContent: 'flex-start'
  },
  messageBubbleContainer: {
    maxWidth: '76%'
  },
  messageBubbleContainerPinned: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFF9D8'
  },
  myMessageContainer: {
    alignItems: 'flex-end'
  },
  otherMessageContainer: {
    alignItems: 'flex-start'
  },
  messageSenderName: {
    marginBottom: 6,
    marginLeft: 8,
    color: '#97A0AD',
    fontSize: 12,
    lineHeight: 16
  },
  messageBubble: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 20
  },
  selectBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#C5CFDC',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    marginBottom: 8
  },
  selectBoxActive: {
    backgroundColor: '#337EFF',
    borderColor: '#337EFF'
  },
  selectBoxDisabled: {
    opacity: 0
  },
  selectBoxText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
  },
  replyPreview: {
    borderLeftWidth: 3,
    paddingLeft: 8,
    marginBottom: 8
  },
  replyPreviewMy: {
    borderLeftColor: 'rgba(255, 255, 255, 0.72)'
  },
  replyPreviewOther: {
    borderLeftColor: '#D9E1EC'
  },
  replyPreviewTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2
  },
  replyPreviewText: {
    fontSize: 12,
    opacity: 0.78
  },
  myMessage: {
    backgroundColor: '#CBE7FF',
    borderTopRightRadius: 8
  },
  otherMessage: {
    backgroundColor: '#F2F5F8',
    borderTopLeftRadius: 8
  },
  messageBubblePinned: {
    borderWidth: 1,
    borderColor: '#F0DE84'
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24
  },
  messageRichText: {
    maxWidth: '100%'
  },
  myMessageText: {
    color: '#203040'
  },
  otherMessageText: {
    color: '#263242'
  },
  imageMessage: {
    width: 184,
    height: 160,
    borderRadius: 16,
    backgroundColor: '#D1D5DB',
    overflow: 'hidden'
  },
  imageMessagePortrait: {
    width: 144,
    height: 196
  },
  imageMessagePreview: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#D1D5DB'
  },
  imageLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.28)'
  },
  videoCard: {
    width: 190,
    height: 160,
    borderRadius: 16,
    backgroundColor: 'rgba(17, 24, 39, 0.16)',
    overflow: 'hidden',
    justifyContent: 'flex-end'
  },
  videoCardPortrait: {
    width: 152,
    height: 204
  },
  videoPreviewImage: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#111827'
  },
  videoPreviewFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#374151'
  },
  videoLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.28)'
  },
  videoPlayBadge: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -25,
    marginTop: -25,
    width: 50,
    height: 50,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  videoPlayBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
  },
  videoMeta: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(17, 24, 39, 0.36)'
  },
  audioCard: {
    minWidth: 160,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.32)',
    padding: 12
  },
  fileCard: {
    minWidth: 180,
    maxWidth: 260,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.32)',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  fileIconWrap: {
    width: 44,
    height: 52
  },
  fileIcon: {
    width: 44,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  fileIconText: {
    color: '#337EFF',
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '800'
  },
  fileSendingOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  fileMeta: {
    flex: 1,
    minWidth: 0
  },
  locationCard: {
    minWidth: 180,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.32)',
    padding: 12
  },
  attachmentMeta: {
    marginTop: 6,
    fontSize: 12,
    opacity: 0.74
  },
  mergedForwardCard: {
    minWidth: 200
  },
  mergedForwardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    maxWidth: 230
  },
  mergedForwardTitle: {
    fontSize: 14,
    fontWeight: '700'
  },
  mergedForwardTitlePrefix: {
    flexShrink: 1
  },
  mergedForwardLine: {
    fontSize: 13,
    lineHeight: 18
  },
  mergedForwardFooter: {
    marginTop: 8,
    fontSize: 12,
    opacity: 0.72
  },
  messageBubbleAvatar: {
    width: 42,
    height: 42,
    marginHorizontal: 14
  },
  receiptIndicator: {
    marginRight: 8,
    marginBottom: 6,
    alignSelf: 'flex-end'
  },
  pinBadge: {
    marginTop: 6,
    fontSize: 12,
    color: '#52A168',
    fontWeight: '700'
  },
  retryButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FF4D4F',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
    marginBottom: 6
  },
  retryButtonMuted: {
    backgroundColor: '#9CA3AF'
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 16
  },
  retryButtonTextMuted: {
    color: '#F9FAFB'
  },
  actionMask: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.18)'
  },
  actionOverlay: {
    flex: 1
  },
  actionSheet: {
    position: 'absolute',
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingTop: 12,
    paddingBottom: 8,
    shadowColor: '#101828',
    shadowOffset: {
      width: 0,
      height: 10
    },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 10
  },
  panel: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 12,
    backgroundColor: '#EFF2F6',
    rowGap: 14
  },
  panelButton: {
    width: '33.33%',
    minHeight: 90,
    alignItems: 'center',
    justifyContent: 'center'
  },
  panelButtonDisabled: {
    opacity: 0.45
  },
  panelButtonIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8
  },
  panelButtonText: {
    color: '#768092',
    fontSize: 12
  },
  composerContainer: {
    backgroundColor: '#F4F6F9',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
    gap: 8
  },
  composerDock: {
    position: 'relative',
    backgroundColor: '#F4F6F9'
  },
  selectionBanner: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: '#FFF8DA'
  },
  selectionBannerText: {
    color: '#6D7E2F',
    fontSize: 13,
    fontWeight: '700'
  },
  selectionActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF'
  },
  replyDraftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  replyDraftContent: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8
  },
  replyDraftTitle: {
    color: '#2A3340',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2
  },
  replyDraftText: {
    color: '#7E8795',
    fontSize: 12
  },
  replyDraftClose: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E8EDF3',
    alignItems: 'center',
    justifyContent: 'center'
  },
  inputContainer: {
    width: '100%',
    minHeight: 46,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E3E8EF',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden'
  },
  inputContainerDisabled: {
    borderColor: '#E8EDF3',
    backgroundColor: '#F5F7FA'
  },
  inputRow: {
    width: '100%',
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center'
  },
  inputFieldWrap: {
    flex: 1,
    minHeight: 46,
    position: 'relative',
    justifyContent: 'center'
  },
  toolRow: {
    minHeight: 46,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 0
  },
  input: {
    width: '100%',
    height: 46,
    paddingHorizontal: 16,
    paddingVertical: 0,
    fontSize: 16,
    color: '#1E2837',
    textAlignVertical: 'center',
    backgroundColor: '#FFFFFF'
  },
  inputDisabled: {
    color: '#AEB7C3',
    backgroundColor: '#F5F7FA'
  },
  inputPlaceholder: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: 12,
    zIndex: 1,
    elevation: 1,
    pointerEvents: 'none',
    color: '#A0A8B4',
    fontSize: 16,
    lineHeight: 22
  },
  inputPlaceholderDisabled: {
    color: '#B7C0CC'
  },
  voiceRecorderPanel: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
    paddingBottom: 24
  },
  voiceRecorderPanelIdle: {
    minHeight: VOICE_RECORD_IDLE_PANEL_HEIGHT
  },
  voiceRecorderPanelActive: {
    minHeight: VOICE_RECORD_ACTIVE_PANEL_HEIGHT
  },
  voiceRecorderTopTip: {
    height: 23,
    color: '#B4BCC8',
    fontSize: 12,
    lineHeight: 23,
    textAlign: 'center',
    marginBottom: 31
  },
  voiceRecordTouchArea: {
    width: VOICE_RECORD_WAVE_SIZE,
    height: VOICE_RECORD_WAVE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 26
  },
  voiceRecorderOuterWave: {
    position: 'absolute',
    width: VOICE_RECORD_WAVE_SIZE,
    height: VOICE_RECORD_WAVE_SIZE,
    borderRadius: VOICE_RECORD_WAVE_SIZE / 2,
    backgroundColor: 'rgba(81, 142, 248, 0.58)'
  },
  voiceRecorderButton: {
    width: VOICE_RECORD_BUTTON_SIZE,
    height: VOICE_RECORD_BUTTON_SIZE,
    borderRadius: VOICE_RECORD_BUTTON_SIZE / 2,
    backgroundColor: '#4B87F8',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  voiceRecorderButtonActive: {
    backgroundColor: '#4B87F8'
  },
  voicePressedMask: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.5)'
  },
  voiceRecorderText: {
    color: '#999999',
    fontSize: 12,
    lineHeight: 18,
    height: 18
  }
})

export default ChatScreen
