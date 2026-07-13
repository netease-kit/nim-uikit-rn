import * as Linking from 'expo-linking'
import { makeAutoObservable, runInAction } from 'mobx'

import { NIMConfig } from '@/constants/NIMConfig'
import type { AppLanguagePreference } from '@/utils/app-language'
import {
  getNativePushPreferences,
  hasNativeNotificationSettingsBridge,
  setNativePushPreferences
} from '@/utils/native-notification-settings'
import { getNotificationPermissions, requestNotificationPermissions } from '@/utils/notifications'
import { storage } from '@/utils/storage'

export type PreferenceSnapshot = {
  cloudConversationEnabled: boolean
  /**
   * Legacy account-scoped storage kept only for compatibility with old snapshots.
   * Cloud/local conversation mode is now a local app preference shared by accounts.
   */
  cloudConversationEnabledByAccount?: Record<string, boolean>
  notificationsEnabled: boolean
  showMessageDetail: boolean
  soundEnabled: boolean
  vibrationEnabled: boolean
  syncPushEnabled: boolean
  readReceiptEnabled: boolean
  earpieceModeEnabled: boolean
  filterNotificationEnabled: boolean
  deleteRemarkSyncEnabled: boolean
  appearance: 'basic' | 'common'
  language: AppLanguagePreference
}

const DEFAULT_SNAPSHOT: PreferenceSnapshot = {
  cloudConversationEnabled: NIMConfig.enableV2CloudConversation,
  notificationsEnabled: true,
  showMessageDetail: true,
  soundEnabled: true,
  vibrationEnabled: true,
  syncPushEnabled: true,
  readReceiptEnabled: true,
  earpieceModeEnabled: false,
  filterNotificationEnabled: false,
  deleteRemarkSyncEnabled: false,
  appearance: 'basic',
  language: 'zh'
}

class PreferenceStore {
  preferences: PreferenceSnapshot = DEFAULT_SNAPSHOT
  notificationPermissionStatus = 'undetermined'
  isReady = false

  private readyPromise: Promise<void>
  private resolveReady!: () => void
  private hasResolvedReady = false

  constructor() {
    this.readyPromise = new Promise<void>((resolve) => {
      this.resolveReady = resolve
    })
    makeAutoObservable(this, {}, { autoBind: true })
    this.bootstrap()
  }

  async bootstrap() {
    try {
      const stored = await storage.getJson<PreferenceSnapshot>(NIMConfig.storageKeys.preferences)

      if (stored) {
        const normalizedAppearance =
          stored.appearance === 'common' || stored.appearance === 'basic'
            ? stored.appearance
            : stored.appearance === 'dark'
              ? 'common'
              : 'basic'

        runInAction(() => {
          const legacyAccountCloudPreferences = Object.values(
            stored.cloudConversationEnabledByAccount ?? {}
          ).filter((value): value is boolean => typeof value === 'boolean')
          const storedGlobalCloudPreference =
            typeof stored.cloudConversationEnabled === 'boolean'
              ? stored.cloudConversationEnabled
              : undefined
          const migratedCloudConversationEnabled =
            storedGlobalCloudPreference === false &&
            legacyAccountCloudPreferences.includes(true) &&
            !legacyAccountCloudPreferences.includes(false)
              ? true
              : (storedGlobalCloudPreference ??
                legacyAccountCloudPreferences[0] ??
                DEFAULT_SNAPSHOT.cloudConversationEnabled)

          this.preferences = {
            ...DEFAULT_SNAPSHOT,
            ...stored,
            cloudConversationEnabled: migratedCloudConversationEnabled,
            appearance: normalizedAppearance
          }
        })
      }

      this.refreshNotificationPermission().catch(() => undefined)
    } finally {
      runInAction(() => {
        this.isReady = true
      })
      this.markReady()
    }
  }

  private markReady() {
    if (this.hasResolvedReady) {
      return
    }

    this.hasResolvedReady = true
    this.resolveReady()
  }

  async waitUntilReady() {
    if (this.isReady || this.hasResolvedReady) {
      return
    }

    await this.readyPromise
  }

  private async persist() {
    await storage.setJson(NIMConfig.storageKeys.preferences, this.preferences)
  }

  getCloudConversationEnabled(_account?: string | null) {
    return this.preferences.cloudConversationEnabled
  }

  async applyCloudConversationPreferenceForAccount(account?: string | null) {
    const nextValue = this.getCloudConversationEnabled(account)

    if (this.preferences.cloudConversationEnabled === nextValue) {
      return
    }

    runInAction(() => {
      this.preferences.cloudConversationEnabled = nextValue
    })
    await this.persist()
  }

  async syncNotificationSettingsToNative() {
    if (!hasNativeNotificationSettingsBridge()) {
      return false
    }

    return setNativePushPreferences({
      notificationsEnabled: this.preferences.notificationsEnabled,
      showMessageDetail: this.preferences.showMessageDetail
    })
  }

  async hydrateNotificationSettingsFromNative() {
    const nativePreferences = await getNativePushPreferences()

    if (!nativePreferences) {
      return false
    }

    runInAction(() => {
      this.preferences.notificationsEnabled = nativePreferences.notificationsEnabled
      this.preferences.showMessageDetail = nativePreferences.showMessageDetail
    })
    await this.persist()
    return true
  }

  resolveColorScheme(systemColorScheme?: string | null) {
    if (this.preferences.appearance === 'common') {
      return 'dark'
    }

    return systemColorScheme === 'dark' ? 'light' : 'light'
  }

  resolveLanguage(systemLanguage?: string | null) {
    if (this.preferences.language === 'zh' || this.preferences.language === 'en') {
      return this.preferences.language
    }

    const normalized = (systemLanguage || '').toLowerCase()
    return normalized.startsWith('zh') ? 'zh' : 'en'
  }

  async updatePreference<K extends keyof PreferenceSnapshot>(key: K, value: PreferenceSnapshot[K]) {
    runInAction(() => {
      this.preferences[key] = value
    })
    await this.persist()
  }

  async setCloudConversationEnabled(value: boolean) {
    if (this.preferences.cloudConversationEnabled === value) {
      return
    }

    runInAction(() => {
      this.preferences.cloudConversationEnabled = value
    })
    await this.persist()
  }

  async setCloudConversationEnabledForAccount(_account: string | null | undefined, value: boolean) {
    await this.setCloudConversationEnabled(value)
  }

  async refreshNotificationPermission() {
    const settings = await getNotificationPermissions()

    runInAction(() => {
      this.notificationPermissionStatus = settings.status
    })
    return settings.status
  }

  async requestNotificationPermission() {
    const settings = await requestNotificationPermissions()
    runInAction(() => {
      this.notificationPermissionStatus = settings.status
    })
    return settings.status
  }

  async setNotificationsEnabled(value: boolean) {
    runInAction(() => {
      this.preferences.notificationsEnabled = value
    })
    await this.persist()
    await this.syncNotificationSettingsToNative()
  }

  async setShowMessageDetail(value: boolean) {
    runInAction(() => {
      this.preferences.showMessageDetail = value
    })
    await this.persist()
    await this.syncNotificationSettingsToNative()
  }

  async openSystemSettings() {
    await Linking.openSettings()
  }
}

export const preferenceStore = new PreferenceStore()
