import Constants from 'expo-constants'

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
  getLastNotificationResponseAsync?: () => Promise<NotificationResponseLike | null>
  addNotificationResponseReceivedListener?: (
    listener: (response: NotificationResponseLike | null) => void
  ) => {
    remove?: () => void
  }
}

let cachedModule: NotificationsModule | null | undefined

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
