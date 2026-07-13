import Constants from 'expo-constants'
import { Platform } from 'react-native'

type NotificationPermissionStatus = 'undetermined' | 'denied' | 'granted' | 'unavailable'

type NotificationPermissionResponse = {
  status: NotificationPermissionStatus
}

type NotificationResponseLike = {
  notification?: {
    request?: {
      content?: {
        data?: Record<string, unknown>
      }
    }
  }
}

type NotificationsModule = {
  setNotificationHandler?: (handler: {
    handleNotification: () => Promise<{
      shouldPlaySound: boolean
      shouldSetBadge: boolean
      shouldShowBanner: boolean
      shouldShowList: boolean
    }>
  }) => void
  getPermissionsAsync?: () => Promise<{ status: NotificationPermissionStatus }>
  requestPermissionsAsync?: () => Promise<{ status: NotificationPermissionStatus }>
  getDevicePushTokenAsync?: () => Promise<{ type: 'ios' | 'android'; data: string }>
  getLastNotificationResponseAsync?: () => Promise<NotificationResponseLike | null>
  addNotificationResponseReceivedListener?: (
    listener: (response: NotificationResponseLike | null) => void
  ) => {
    remove?: () => void
  }
  setNotificationChannelAsync?: (
    channelId: string,
    channel: {
      name: string
      importance: number
      enableVibrate?: boolean
      vibrationPattern?: number[]
      sound?: string | null
      showBadge?: boolean
    }
  ) => Promise<unknown>
  dismissAllNotificationsAsync?: () => Promise<void>
  setBadgeCountAsync?: (badgeCount: number) => Promise<boolean>
}

let cachedModule: NotificationsModule | null | undefined
export const DEFAULT_NOTIFICATION_CHANNEL_ID = 'im-default'

function shouldSkipNotificationsModule() {
  return !!Constants.expoGoConfig
}

function getNotificationsModule() {
  if (cachedModule !== undefined) {
    return cachedModule
  }

  if (shouldSkipNotificationsModule()) {
    cachedModule = null
    return cachedModule
  }

  try {
    cachedModule = require('expo-notifications') as NotificationsModule
  } catch {
    cachedModule = null
  }

  return cachedModule
}

export async function getNotificationPermissions(): Promise<NotificationPermissionResponse> {
  const notifications = getNotificationsModule()

  if (!notifications?.getPermissionsAsync) {
    return { status: 'unavailable' }
  }

  try {
    return await notifications.getPermissionsAsync()
  } catch {
    return { status: 'unavailable' }
  }
}

export async function requestNotificationPermissions(): Promise<NotificationPermissionResponse> {
  const notifications = getNotificationsModule()

  if (!notifications?.requestPermissionsAsync) {
    return { status: 'unavailable' }
  }

  try {
    return await notifications.requestPermissionsAsync()
  } catch {
    return { status: 'unavailable' }
  }
}

export async function getNativeDevicePushToken() {
  const notifications = getNotificationsModule()

  if (!notifications?.getDevicePushTokenAsync) {
    return null
  }

  try {
    const token = await notifications.getDevicePushTokenAsync()
    return token?.data ? token : null
  } catch {
    return null
  }
}

export function configureNotificationHandler(
  handler: () => Promise<{
    shouldPlaySound: boolean
    shouldSetBadge: boolean
    shouldShowBanner: boolean
    shouldShowList: boolean
  }>
) {
  const notifications = getNotificationsModule()
  notifications?.setNotificationHandler?.({ handleNotification: handler })
}

export async function getLastNotificationResponse() {
  const notifications = getNotificationsModule()

  if (!notifications?.getLastNotificationResponseAsync) {
    return null
  }

  try {
    return await notifications.getLastNotificationResponseAsync()
  } catch {
    return null
  }
}

export function addNotificationResponseListener(
  listener: (response: NotificationResponseLike | null) => void
) {
  const notifications = getNotificationsModule()

  if (!notifications?.addNotificationResponseReceivedListener) {
    return { remove: () => undefined }
  }

  try {
    return notifications.addNotificationResponseReceivedListener(listener)
  } catch {
    return { remove: () => undefined }
  }
}

export async function syncNotificationChannel(options: {
  enabled: boolean
  soundEnabled: boolean
  vibrationEnabled: boolean
}) {
  if (Platform.OS !== 'android') {
    return
  }

  const notifications = getNotificationsModule()

  if (!notifications?.setNotificationChannelAsync) {
    return
  }

  try {
    await notifications.setNotificationChannelAsync(DEFAULT_NOTIFICATION_CHANNEL_ID, {
      name: 'IM Messages',
      importance: options.enabled ? 5 : 2,
      sound: options.enabled && options.soundEnabled ? 'default' : null,
      enableVibrate: options.enabled && options.vibrationEnabled,
      vibrationPattern: options.enabled && options.vibrationEnabled ? [0, 250, 200, 250] : [0],
      showBadge: options.enabled
    })
  } catch {
    // ignore channel sync errors on unsupported runtimes
  }
}

export async function clearPresentedNotifications() {
  const notifications = getNotificationsModule()

  try {
    await notifications?.dismissAllNotificationsAsync?.()
  } catch {
    // ignore cleanup errors
  }

  try {
    await notifications?.setBadgeCountAsync?.(0)
  } catch {
    // ignore cleanup errors
  }
}
