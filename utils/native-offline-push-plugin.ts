import { requireOptionalNativeModule } from 'expo-modules-core'
import { Platform } from 'react-native'
import { NativeEventEmitter, NativeModules } from 'react-native'

import {
  getNativeDevicePushToken,
  getNotificationPermissions,
  requestNotificationPermissions
} from '@/utils/notifications'

type Listener = (payload?: string) => void

type NativeOfflinePushModule = {
  init?: (
    configJson: string,
    callback: (type?: string, tokenName?: string, token?: string) => void
  ) => void
  onLogin?: (account: string, pushType: number, hasTokenPreviously: boolean, token: string) => void
  getDeviceInfo?: (callback: (result: string) => void) => void
}

type RNOfflinePushPlugin = NativeOfflinePushModule & {
  checkPermissions?: (callback: () => void) => void
  requestPermissions?: () => void
  addEventListener?: (eventName: string, callback: Listener) => void
}

const nativeModule =
  requireOptionalNativeModule<NativeOfflinePushModule>('V2NIMOfflinePushPlugin') ||
  (NativeModules.V2NIMOfflinePushPlugin as NativeOfflinePushModule | undefined)

function createNoopPlugin(): RNOfflinePushPlugin {
  return {
    init: (_configJson, callback) => callback?.('', '', ''),
    onLogin: () => undefined,
    getDeviceInfo: (callback) => callback('{}'),
    checkPermissions: (callback) => callback(),
    requestPermissions: () => undefined,
    addEventListener: () => undefined
  }
}

function createIOSPlugin(): RNOfflinePushPlugin {
  const listeners = new Map<string, Set<Listener>>()

  const emit = (eventName: string, payload?: string) => {
    listeners.get(eventName)?.forEach((listener) => {
      try {
        listener(payload)
      } catch {
        // ignore listener failures so token delivery still proceeds for the remaining handlers
      }
    })
  }

  return {
    ...createNoopPlugin(),
    checkPermissions: async (callback) => {
      const permission = await getNotificationPermissions()
      if (permission.status === 'granted') {
        callback?.()
      }
    },
    requestPermissions: () => {
      requestNotificationPermissions()
        .then(async (permission) => {
          if (permission.status !== 'granted') {
            emit('registrationError', 'Notification permission denied')
            return
          }

          const token = await getNativeDevicePushToken()
          if (token?.type === 'ios' && typeof token.data === 'string' && token.data) {
            emit('register', token.data)
            return
          }

          emit('registrationError', 'APNs token unavailable')
        })
        .catch((error: unknown) => {
          emit(
            'registrationError',
            error instanceof Error ? error.message : 'Failed to request APNs permissions'
          )
        })
    },
    addEventListener: (eventName, callback) => {
      const current = listeners.get(eventName) || new Set<Listener>()
      current.add(callback)
      listeners.set(eventName, current)
    }
  }
}

function createAndroidPlugin(): RNOfflinePushPlugin {
  if (!nativeModule) {
    return createNoopPlugin()
  }

  const emitter = new NativeEventEmitter(NativeModules.V2NIMOfflinePushPlugin)

  return {
    init: nativeModule.init,
    onLogin: nativeModule.onLogin,
    getDeviceInfo: nativeModule.getDeviceInfo,
    checkPermissions: (callback) => callback(),
    requestPermissions: () => undefined,
    addEventListener: (eventName, callback) => {
      emitter.addListener(eventName, callback)
    }
  }
}

export function installNativeOfflinePushPlugin() {
  const plugin =
    Platform.OS === 'android'
      ? createAndroidPlugin()
      : Platform.OS === 'ios'
        ? createIOSPlugin()
        : createNoopPlugin()

  ;(globalThis as { V2NIMOfflinePushPlugin?: RNOfflinePushPlugin }).V2NIMOfflinePushPlugin = plugin
}
