import { NativeModules, Platform } from 'react-native'

type NativePushPreferences = {
  notificationsEnabled: boolean
  showMessageDetail: boolean
}

type NativeNotificationSettingsModule = {
  getPushPreferences?: () => Promise<NativePushPreferences>
  setPushPreferences?: (
    notificationsEnabled: boolean,
    showMessageDetail: boolean
  ) => Promise<NativePushPreferences>
}

const nativeModule =
  Platform.OS === 'ios'
    ? (NativeModules.NIMNotificationSettings as NativeNotificationSettingsModule | undefined)
    : undefined

export function hasNativeNotificationSettingsBridge() {
  return Platform.OS === 'ios' && !!nativeModule
}

export async function getNativePushPreferences() {
  if (!nativeModule?.getPushPreferences) {
    return null
  }

  return nativeModule.getPushPreferences()
}

export async function setNativePushPreferences(preferences: NativePushPreferences) {
  if (!nativeModule?.setPushPreferences) {
    return false
  }

  await nativeModule.setPushPreferences(
    preferences.notificationsEnabled,
    preferences.showMessageDetail
  )
  return true
}
