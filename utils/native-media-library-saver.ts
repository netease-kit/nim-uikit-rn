import { NativeModules, Platform } from 'react-native'

export type NativeMediaLibrarySaveType = 'image' | 'video'

type NativeMediaLibrarySaveResult = {
  uri?: string
  mediaType?: NativeMediaLibrarySaveType
}

type NativeMediaLibrarySaverModule = {
  saveToLibrary?: (
    localUri: string,
    mediaType: NativeMediaLibrarySaveType
  ) => Promise<NativeMediaLibrarySaveResult | null>
}

const nativeModule = NativeModules.NIMMediaLibrarySaver as NativeMediaLibrarySaverModule | undefined

export function hasNativeMediaLibrarySaver() {
  return Platform.OS === 'android' && !!nativeModule?.saveToLibrary
}

export async function saveNativeMediaToLibrary(
  localUri: string,
  mediaType: NativeMediaLibrarySaveType
) {
  if (!hasNativeMediaLibrarySaver() || !nativeModule?.saveToLibrary) {
    return null
  }

  return nativeModule.saveToLibrary(localUri, mediaType)
}
