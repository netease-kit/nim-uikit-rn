import { getRecordingPermissionsAsync, requestRecordingPermissionsAsync } from 'expo-audio'
import * as Linking from 'expo-linking'
import * as MediaLibrary from 'expo-media-library'
import { Alert, NativeModules, Platform } from 'react-native'

import { translateCurrentApp } from '@/utils/app-language'
import * as ImagePicker from '@/utils/image-picker'
import { getNotificationPermissions, requestNotificationPermissions } from '@/utils/notifications'
import { storage } from '@/utils/storage'

type PermissionKind =
  | 'commonPermissionCamera'
  | 'commonPermissionAlbum'
  | 'commonPermissionMicrophone'

const CAMERA_GRANTED_STORAGE_KEY = 'permissions.camera.granted'
const cameraPermissionCompatModule = NativeModules.CameraPermissionCompat as
  | {
      scheduleRevokeCameraPermissionOnKill?: () => Promise<void>
    }
  | undefined

export type CameraPermissionState = Awaited<
  ReturnType<typeof ImagePicker.getCameraPermissionsAsync>
>
export type MediaLibraryPermissionState = Awaited<
  ReturnType<typeof MediaLibrary.getPermissionsAsync>
>
export type SystemPermissionKind = 'notification' | 'camera' | 'album' | 'microphone'
export type SystemPermissionStatus =
  | 'granted'
  | 'denied'
  | 'undetermined'
  | 'limited'
  | 'unavailable'

export type SystemPermissionState = {
  kind: SystemPermissionKind
  status: SystemPermissionStatus
  canRequest: boolean
  canOpenSettings: boolean
}

type PermissionResponseLike = {
  status?: string
  granted?: boolean
  canAskAgain?: boolean
  accessPrivileges?: string | null
}

function canPromptForPermission(permission: PermissionResponseLike) {
  return permission.status === 'undetermined' || permission.canAskAgain === true
}

async function wasCameraPermissionGrantedBefore() {
  return (await storage.getString(CAMERA_GRANTED_STORAGE_KEY)) === '1'
}

async function setCameraPermissionGranted(granted: boolean) {
  if (granted) {
    await storage.setString(CAMERA_GRANTED_STORAGE_KEY, '1')
    return
  }

  await storage.remove(CAMERA_GRANTED_STORAGE_KEY)
}

async function scheduleCameraPermissionRevokeOnKill() {
  if (Platform.OS !== 'android') {
    return
  }

  try {
    await cameraPermissionCompatModule?.scheduleRevokeCameraPermissionOnKill?.()
  } catch {
    // Ignore native compatibility failures and keep default platform behavior.
  }
}

function logCameraPermissionSnapshot(
  stage: string,
  permission: PermissionResponseLike,
  extra?: Record<string, unknown>
) {
  if (!__DEV__) {
    return
  }

  console.info('[camera-permission]', stage, {
    status: permission.status,
    granted: permission.granted,
    canAskAgain: permission.canAskAgain,
    accessPrivileges: permission.accessPrivileges ?? null,
    ...extra
  })
}

async function shouldAllowCameraPermissionRetry(permission: PermissionResponseLike) {
  if (canPromptForPermission(permission)) {
    return true
  }

  return (
    Platform.OS === 'android' &&
    permission.status === 'denied' &&
    (await wasCameraPermissionGrantedBefore())
  )
}

const MEDIA_LIBRARY_GRANULAR_PERMISSIONS: MediaLibrary.GranularPermission[] = ['photo', 'video']

async function openSettingsAlert(permissionKind: PermissionKind) {
  return new Promise<boolean>((resolve) => {
    Alert.alert(
      translateCurrentApp('commonPermissionDenied'),
      translateCurrentApp('commonGrantPermissionInSettings', {
        permission: translateCurrentApp(permissionKind)
      }),
      [
        {
          text: translateCurrentApp('actionCancel'),
          style: 'cancel',
          onPress: () => resolve(false)
        },
        {
          text: translateCurrentApp('commonOpenSettings'),
          onPress: async () => {
            await Linking.openSettings()
            resolve(false)
          }
        }
      ]
    )
  })
}

export async function ensureCameraPermission() {
  const currentPermission = await ImagePicker.getCameraPermissionsAsync()
  logCameraPermissionSnapshot('get-before-ensure', currentPermission)

  if (currentPermission.granted) {
    await setCameraPermissionGranted(true)
    await scheduleCameraPermissionRevokeOnKill()
    return true
  }

  const hadCameraPermissionBefore = await wasCameraPermissionGrantedBefore()

  if (Platform.OS === 'android') {
    const permission = await ImagePicker.requestCameraPermissionsAsync()
    logCameraPermissionSnapshot('request-android', permission, {
      previousStatus: currentPermission.status,
      previousGranted: currentPermission.granted,
      hadCameraPermissionBefore
    })

    if (permission.granted) {
      await setCameraPermissionGranted(true)
      await scheduleCameraPermissionRevokeOnKill()
      return true
    }

    await setCameraPermissionGranted(false)

    if (
      currentPermission.status !== 'undetermined' &&
      currentPermission.canAskAgain === false &&
      permission.canAskAgain === false &&
      !hadCameraPermissionBefore
    ) {
      await openSettingsAlert('commonPermissionCamera')
    }

    return false
  }

  if (await shouldAllowCameraPermissionRetry(currentPermission)) {
    const permission = await ImagePicker.requestCameraPermissionsAsync()
    logCameraPermissionSnapshot('request-non-android', permission, {
      previousStatus: currentPermission.status,
      previousGranted: currentPermission.granted,
      hadCameraPermissionBefore
    })

    if (permission.granted) {
      await setCameraPermissionGranted(true)
      await scheduleCameraPermissionRevokeOnKill()
      return true
    }

    await setCameraPermissionGranted(false)
    return false
  }

  await openSettingsAlert('commonPermissionCamera')
  return false
}

export async function ensureMediaLibraryPermission() {
  const currentPermission = await MediaLibrary.getPermissionsAsync(
    false,
    MEDIA_LIBRARY_GRANULAR_PERMISSIONS
  )

  if (currentPermission.granted || currentPermission.accessPrivileges === 'limited') {
    return true
  }

  if (canPromptForPermission(currentPermission)) {
    const permission = await MediaLibrary.requestPermissionsAsync(
      false,
      MEDIA_LIBRARY_GRANULAR_PERMISSIONS
    )

    if (permission.granted || permission.accessPrivileges === 'limited') {
      return true
    }

    await openSettingsAlert('commonPermissionAlbum')
    return false
  }

  await openSettingsAlert('commonPermissionAlbum')
  return false
}

export async function ensureMediaLibrarySavePermission() {
  try {
    const currentPermission = await MediaLibrary.getPermissionsAsync(
      true,
      MEDIA_LIBRARY_GRANULAR_PERMISSIONS
    )

    if (currentPermission.granted || currentPermission.accessPrivileges === 'limited') {
      return true
    }

    if (canPromptForPermission(currentPermission)) {
      const permission = await MediaLibrary.requestPermissionsAsync(
        true,
        MEDIA_LIBRARY_GRANULAR_PERMISSIONS
      )

      if (permission.granted || permission.accessPrivileges === 'limited') {
        return true
      }

      await openSettingsAlert('commonPermissionAlbum')
      return false
    }
  } catch {
    await openSettingsAlert('commonPermissionAlbum')
    return false
  }

  await openSettingsAlert('commonPermissionAlbum')
  return false
}

export async function getMediaLibraryPermissionState(): Promise<MediaLibraryPermissionState> {
  return MediaLibrary.getPermissionsAsync(false, MEDIA_LIBRARY_GRANULAR_PERMISSIONS)
}

export async function getCameraPermissionState(): Promise<CameraPermissionState> {
  return ImagePicker.getCameraPermissionsAsync()
}

function normalizePermissionStatus(permission: PermissionResponseLike): SystemPermissionStatus {
  if (permission.granted || permission.status === 'granted') {
    return 'granted'
  }

  if (permission.accessPrivileges === 'limited') {
    return 'limited'
  }

  if (permission.status === 'denied') {
    return 'denied'
  }

  if (permission.status === 'undetermined') {
    return 'undetermined'
  }

  return 'unavailable'
}

function normalizePermissionState(
  kind: SystemPermissionKind,
  permission: PermissionResponseLike
): SystemPermissionState {
  const status = normalizePermissionStatus(permission)

  return {
    kind,
    status,
    canRequest: status === 'undetermined' || permission.canAskAgain === true,
    canOpenSettings: status === 'denied' || status === 'limited' || status === 'unavailable'
  }
}

export async function getSystemPermissionState(
  kind: SystemPermissionKind
): Promise<SystemPermissionState> {
  try {
    if (kind === 'notification') {
      const permission = await getNotificationPermissions()
      return normalizePermissionState(kind, permission)
    }

    if (kind === 'camera') {
      const permission = await ImagePicker.getCameraPermissionsAsync()

      if (permission.granted) {
        await setCameraPermissionGranted(true)
        await scheduleCameraPermissionRevokeOnKill()
      }

      const status = normalizePermissionStatus(permission)

      return {
        kind,
        status,
        canRequest: await shouldAllowCameraPermissionRetry(permission),
        canOpenSettings: status === 'denied' || status === 'limited' || status === 'unavailable'
      }
    }

    if (kind === 'album') {
      const permission = await MediaLibrary.getPermissionsAsync(
        false,
        MEDIA_LIBRARY_GRANULAR_PERMISSIONS
      )
      return normalizePermissionState(kind, permission)
    }

    const permission = await getRecordingPermissionsAsync()
    return normalizePermissionState(kind, permission)
  } catch {
    return {
      kind,
      status: 'unavailable',
      canRequest: false,
      canOpenSettings: true
    }
  }
}

export async function getSystemPermissionStates() {
  return Promise.all(
    (['notification', 'camera', 'album', 'microphone'] as const).map((kind) =>
      getSystemPermissionState(kind)
    )
  )
}

export async function requestSystemPermission(kind: SystemPermissionKind) {
  if (kind === 'notification') {
    await requestNotificationPermissions()
    return getSystemPermissionState(kind)
  }

  if (kind === 'camera') {
    const permission = await ImagePicker.requestCameraPermissionsAsync()

    if (permission.granted) {
      await setCameraPermissionGranted(true)
    } else {
      await setCameraPermissionGranted(false)
    }

    return getSystemPermissionState(kind)
  }

  if (kind === 'album') {
    await MediaLibrary.requestPermissionsAsync(false, MEDIA_LIBRARY_GRANULAR_PERMISSIONS)
    return getSystemPermissionState(kind)
  }

  await requestRecordingPermissionsAsync()
  return getSystemPermissionState(kind)
}

export async function ensureVoiceRecordingPermission() {
  const currentPermission = await getRecordingPermissionsAsync()

  if (currentPermission.granted) {
    return true
  }

  if (canPromptForPermission(currentPermission)) {
    const permission = await requestRecordingPermissionsAsync()

    if (permission.granted) {
      return true
    }

    await openSettingsAlert('commonPermissionMicrophone')
    return false
  }

  await openSettingsAlert('commonPermissionMicrophone')
  return false
}
