import { NativeModules, Platform } from 'react-native'

const MAX_NATIVE_CAMERA_CAPTURE_MS = 10 * 60 * 1000

let nativeCameraCaptureDepth = 0
let nativeCameraCaptureStartedAt: number | null = null

type NativeCameraKeepAliveModule = {
  begin?: (source: string) => Promise<void>
  end?: (source: string) => Promise<void>
}

type AppStateSubscription = {
  remove: () => void
}

type AppStateModule = {
  addEventListener?: unknown
  __im2NativeCameraCaptureGuardPatched__?: boolean
}

type NIMSettingService = {
  setAppBackground?: unknown
  __im2NativeCameraCaptureBackgroundGuardPatched__?: boolean
}

type NIMInstanceWithSettingService = {
  V2NIMSettingService?: NIMSettingService
}

export function beginNativeCameraCapture(_source: string) {
  nativeCameraCaptureDepth += 1
  if (!nativeCameraCaptureStartedAt) {
    nativeCameraCaptureStartedAt = Date.now()
  }
}

export function endNativeCameraCapture(_source: string) {
  nativeCameraCaptureDepth = Math.max(0, nativeCameraCaptureDepth - 1)

  if (nativeCameraCaptureDepth === 0) {
    nativeCameraCaptureStartedAt = null
  }
}

function getNativeCameraKeepAliveModule() {
  return NativeModules.NativeCameraKeepAlive as NativeCameraKeepAliveModule | undefined
}

export async function beginNativeCameraKeepAlive(source: string) {
  if (Platform.OS !== 'android') {
    return
  }

  const nativeCameraKeepAlive = getNativeCameraKeepAliveModule()

  if (!nativeCameraKeepAlive?.begin) {
    return
  }

  try {
    await nativeCameraKeepAlive.begin(source)
  } catch {}
}

export async function endNativeCameraKeepAlive(source: string) {
  if (Platform.OS !== 'android') {
    return
  }

  const nativeCameraKeepAlive = getNativeCameraKeepAliveModule()

  if (!nativeCameraKeepAlive?.end) {
    return
  }

  try {
    await nativeCameraKeepAlive.end(source)
  } catch {}
}

export function isNativeCameraCaptureActive() {
  if (nativeCameraCaptureDepth <= 0 || !nativeCameraCaptureStartedAt) {
    return false
  }

  if (Date.now() - nativeCameraCaptureStartedAt > MAX_NATIVE_CAMERA_CAPTURE_MS) {
    nativeCameraCaptureDepth = 0
    nativeCameraCaptureStartedAt = null
    return false
  }

  return true
}

export function installNativeCameraCaptureAppStateGuard(appStateModule: AppStateModule | null) {
  if (
    typeof appStateModule?.addEventListener !== 'function' ||
    appStateModule.__im2NativeCameraCaptureGuardPatched__
  ) {
    return
  }

  const originalAddEventListener = appStateModule.addEventListener.bind(appStateModule) as (
    type: string,
    listener: (state: string, ...args: unknown[]) => void
  ) => AppStateSubscription

  appStateModule.__im2NativeCameraCaptureGuardPatched__ = true
  appStateModule.addEventListener = (
    type: string,
    listener: (state: string, ...args: unknown[]) => void
  ) => {
    if (type !== 'change') {
      return originalAddEventListener(type, listener)
    }

    return originalAddEventListener(type, (state, ...args) => {
      if ((state === 'background' || state === 'inactive') && isNativeCameraCaptureActive()) {
        return
      }

      listener(state, ...args)
    })
  }
}

export function installNativeCameraCaptureSettingServiceGuard(
  nimInstance: NIMInstanceWithSettingService | null
) {
  const settingService = nimInstance?.V2NIMSettingService

  if (
    typeof settingService?.setAppBackground !== 'function' ||
    settingService.__im2NativeCameraCaptureBackgroundGuardPatched__
  ) {
    return
  }

  const originalSetAppBackground = settingService.setAppBackground.bind(settingService) as (
    isBackground: boolean,
    badge?: number,
    ...args: unknown[]
  ) => Promise<unknown>

  const callSetAppBackground = (isBackground: boolean, badge?: number, ...args: unknown[]) =>
    originalSetAppBackground(isBackground, badge, ...args).catch(() => undefined)

  settingService.__im2NativeCameraCaptureBackgroundGuardPatched__ = true
  settingService.setAppBackground = (isBackground: boolean, badge?: number, ...args: unknown[]) => {
    if (isBackground && isNativeCameraCaptureActive()) {
      return callSetAppBackground(false, badge, ...args)
    }

    return callSetAppBackground(isBackground, badge, ...args)
  }
}
