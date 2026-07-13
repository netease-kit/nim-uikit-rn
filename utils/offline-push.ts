import { Platform } from 'react-native'

import { NIMConfig } from '@/constants/NIMConfig'
import type { V2NIM } from '@/utils/nim-sdk'

type PushPayloadSessionType = 'p2p' | 'team'

type PushPayload = {
  conversationId: string
  sessionId: string
  sessionType: PushPayloadSessionType
}

type NotificationData = Record<string, unknown> | null | undefined

type RNOfflinePushPlugin = {
  init?: (
    configJson: string,
    callback: (type?: string, tokenName?: string, token?: string) => void
  ) => void
  getDeviceInfo?: (callback: (result: string) => void) => void
  onLogin?: (account: string, pushType: number, hasTokenPreviously: boolean, token: string) => void
  checkPermissions?: (callback: () => void) => void
  requestPermissions?: () => void
  addEventListener?: (eventName: string, callback: (payload?: string) => void) => void
}

type ManufacturerPushConfig = {
  appId?: string
  appKey?: string
  certificateName: string
  secret?: string
}

type OfflinePushConfig = {
  apns?: ManufacturerPushConfig
  hwPush?: ManufacturerPushConfig
  miPush?: ManufacturerPushConfig
  vivoPush?: ManufacturerPushConfig
  oppoPush?: ManufacturerPushConfig
  honorPush?: ManufacturerPushConfig
  fcmPush?: ManufacturerPushConfig
  mzPush?: ManufacturerPushConfig
}

function isNonEmpty(value?: string) {
  return !!value?.trim()
}

function buildOfflinePushConfig(): OfflinePushConfig {
  const config = NIMConfig.offlinePush

  return {
    ...(isNonEmpty(config.apnsCertificateName)
      ? { apns: { certificateName: config.apnsCertificateName } }
      : {}),
    ...(isNonEmpty(config.fcmCertificateName)
      ? { fcmPush: { certificateName: config.fcmCertificateName } }
      : {}),
    ...(isNonEmpty(config.hwPush.certificateName)
      ? {
          hwPush: {
            appId: config.hwPush.appId || undefined,
            certificateName: config.hwPush.certificateName
          }
        }
      : {}),
    ...(isNonEmpty(config.miPush.certificateName)
      ? {
          miPush: {
            appId: config.miPush.appId || undefined,
            appKey: config.miPush.appKey || undefined,
            certificateName: config.miPush.certificateName
          }
        }
      : {}),
    ...(isNonEmpty(config.vivoPush.certificateName)
      ? {
          vivoPush: {
            appId: config.vivoPush.appId || undefined,
            appKey: config.vivoPush.appKey || undefined,
            certificateName: config.vivoPush.certificateName
          }
        }
      : {}),
    ...(isNonEmpty(config.oppoPush.certificateName)
      ? {
          oppoPush: {
            appId: config.oppoPush.appId || undefined,
            appKey: config.oppoPush.appKey || undefined,
            secret: config.oppoPush.secret || undefined,
            certificateName: config.oppoPush.certificateName
          }
        }
      : {}),
    ...(isNonEmpty(config.honorPush.certificateName)
      ? {
          honorPush: {
            appId: config.honorPush.appId || undefined,
            appKey: config.honorPush.appKey || undefined,
            certificateName: config.honorPush.certificateName
          }
        }
      : {}),
    ...(isNonEmpty(config.mzPush.certificateName)
      ? {
          mzPush: {
            appId: config.mzPush.appId || undefined,
            appKey: config.mzPush.appKey || undefined,
            certificateName: config.mzPush.certificateName
          }
        }
      : {})
  }
}

function getRNOfflinePushPlugin(): RNOfflinePushPlugin | null {
  try {
    const runtime = require('nim-web-sdk-ng/dist/v2/NIM_RN_SDK')
    const plugin = runtime?.default?.V2NIMOfflinePushPlugin || runtime?.V2NIMOfflinePushPlugin

    if (plugin && typeof plugin === 'object') {
      return plugin as RNOfflinePushPlugin
    }
  } catch {
    // ignore and fall back to global plugin
  }

  const globalPlugin =
    (globalThis as { V2NIMOfflinePushPlugin?: RNOfflinePushPlugin }).V2NIMOfflinePushPlugin ||
    undefined

  return globalPlugin || null
}

function describeConfiguredChannels(config: OfflinePushConfig) {
  const channels: string[] = []

  if (config.apns?.certificateName) {
    channels.push('APNs')
  }
  if (config.hwPush?.certificateName) {
    channels.push('Huawei')
  }
  if (config.fcmPush?.certificateName) {
    channels.push('FCM')
  }
  if (config.miPush?.certificateName) {
    channels.push('Xiaomi')
  }
  if (config.vivoPush?.certificateName) {
    channels.push('Vivo')
  }
  if (config.oppoPush?.certificateName) {
    channels.push('Oppo')
  }
  if (config.honorPush?.certificateName) {
    channels.push('Honor')
  }
  if (config.mzPush?.certificateName) {
    channels.push('Meizu')
  }

  return channels
}

export function hasOfflinePushConfig() {
  return Object.keys(buildOfflinePushConfig()).length > 0
}

export function configureNIMOfflinePush(nim: V2NIM) {
  const config = buildOfflinePushConfig()
  if (Object.keys(config).length === 0) {
    return
  }

  const plugin = getRNOfflinePushPlugin()
  if (!plugin) {
    console.warn(
      `Offline push config is present for ${describeConfiguredChannels(config).join(
        ', '
      )}, but no React Native offline push plugin is registered yet.`
    )
    return
  }

  nim.V2NIMSettingService.setOfflinePushConfig(plugin as Record<string, unknown>, config)
}

export function buildPushPayload(conversationId: string, nim: V2NIM): string {
  const conversationType = nim.V2NIMConversationIdUtil.parseConversationType(conversationId)
  const targetId = nim.V2NIMConversationIdUtil.parseConversationTargetId(conversationId)
  const sessionType: PushPayloadSessionType = conversationType === 1 ? 'p2p' : 'team'
  const payload: PushPayload = {
    conversationId,
    sessionId: targetId,
    sessionType
  }

  return JSON.stringify(payload)
}

export function resolveConversationIdFromPushData(data: NotificationData, nim?: V2NIM | null) {
  const conversationId = data?.conversationId

  if (typeof conversationId === 'string' && conversationId) {
    return conversationId
  }

  const sessionId = data?.sessionId
  const sessionType = data?.sessionType

  if (!nim || typeof sessionId !== 'string' || !sessionId) {
    return null
  }

  if (sessionType === 'p2p') {
    return nim.V2NIMConversationIdUtil.p2pConversationId(sessionId)
  }

  if (sessionType === 'team') {
    return nim.V2NIMConversationIdUtil.teamConversationId(sessionId)
  }

  return null
}

export function getDefaultPushDeepLinkScheme() {
  return Platform.OS === 'ios' || Platform.OS === 'android' ? 'neteaseyunxinimdemo' : ''
}
