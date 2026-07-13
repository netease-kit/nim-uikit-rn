import { NativeModules, Platform } from 'react-native'

export type NativePickedLocation = {
  title: string
  address: string
  latitude: number
  longitude: number
}

type NativeLocationPickerModule = {
  pickLocation?: () => Promise<NativePickedLocation | null>
}

const nativeModule = NativeModules.NIMLocationPicker as NativeLocationPickerModule | undefined

export function isNativeLocationPickerSupported() {
  return Platform.OS === 'android' || Platform.OS === 'ios'
}

export function hasNativeLocationPicker() {
  return !!nativeModule?.pickLocation && isNativeLocationPickerSupported()
}

export async function pickNativeLocation() {
  const picker = nativeModule?.pickLocation

  if (!picker || !isNativeLocationPickerSupported()) {
    return null
  }

  return picker()
}
