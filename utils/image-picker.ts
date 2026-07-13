import * as ExpoImagePicker from 'expo-image-picker'
import { NativeModules, Platform } from 'react-native'

import {
  beginNativeCameraCapture,
  beginNativeCameraKeepAlive,
  endNativeCameraCapture,
  endNativeCameraKeepAlive
} from './native-capture-state'

type LaunchCameraAsync = typeof ExpoImagePicker.launchCameraAsync

type NativeCameraCaptureModule = {
  capture?: (mode: 'image' | 'video') => Promise<ExpoImagePicker.ImagePickerResult>
}

export type {
  CameraPermissionResponse,
  ImagePickerAsset,
  ImagePickerOptions,
  ImagePickerResult,
  MediaLibraryPermissionResponse,
  MediaType
} from 'expo-image-picker/build/ImagePicker.types'

export const launchImageLibraryAsync = ExpoImagePicker.launchImageLibraryAsync
export const getCameraPermissionsAsync = ExpoImagePicker.getCameraPermissionsAsync
export const requestCameraPermissionsAsync = ExpoImagePicker.requestCameraPermissionsAsync
export const getMediaLibraryPermissionsAsync = ExpoImagePicker.getMediaLibraryPermissionsAsync
export const requestMediaLibraryPermissionsAsync =
  ExpoImagePicker.requestMediaLibraryPermissionsAsync
export const MediaTypeOptions = ExpoImagePicker.MediaTypeOptions
export const VideoExportPreset = ExpoImagePicker.VideoExportPreset

function resolveNativeCameraMode(options: Parameters<LaunchCameraAsync>[0]): 'image' | 'video' {
  const mediaTypes = options?.mediaTypes

  if (Array.isArray(mediaTypes) && mediaTypes.includes('videos')) {
    return 'video'
  }

  return 'image'
}

function getNativeCameraCaptureModule() {
  return NativeModules.NIMCameraCapture as NativeCameraCaptureModule | undefined
}

async function launchAndroidInAppCameraAsync(options: Parameters<LaunchCameraAsync>[0]) {
  const nativeCameraCapture = getNativeCameraCaptureModule()

  if (!nativeCameraCapture?.capture) {
    return null
  }

  return nativeCameraCapture.capture(resolveNativeCameraMode(options))
}

export const launchCameraAsync: LaunchCameraAsync = async (options) => {
  if (Platform.OS === 'web') {
    return ExpoImagePicker.launchCameraAsync(options)
  }

  const source = 'image-picker-launch-camera'
  beginNativeCameraCapture(source)
  await beginNativeCameraKeepAlive(source)
  try {
    return await ExpoImagePicker.launchCameraAsync(options)
  } finally {
    await endNativeCameraKeepAlive(source)
    endNativeCameraCapture(source)
  }
}

export const launchInAppCameraAsync: LaunchCameraAsync = async (options) => {
  if (Platform.OS !== 'android') {
    return launchCameraAsync(options)
  }

  const source = 'in-app-camera-capture'
  beginNativeCameraCapture(source)
  await beginNativeCameraKeepAlive(source)
  try {
    const inAppCameraResult = await launchAndroidInAppCameraAsync(options)

    if (inAppCameraResult) {
      return inAppCameraResult
    }

    return await ExpoImagePicker.launchCameraAsync(options)
  } finally {
    await endNativeCameraKeepAlive(source)
    endNativeCameraCapture(source)
  }
}
