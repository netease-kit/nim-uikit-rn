import * as Linking from 'expo-linking'
import { makeAutoObservable, runInAction } from 'mobx'

import { NIMConfig } from '@/constants/NIMConfig'
import { getNotificationPermissions, requestNotificationPermissions } from '@/utils/notifications'
import { storage } from '@/utils/storage'

export type PreferenceSnapshot = {
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
}

const DEFAULT_SNAPSHOT: PreferenceSnapshot = {
  notificationsEnabled: true,
  showMessageDetail: true,
  soundEnabled: true,
  vibrationEnabled: true,
  syncPushEnabled: true,
  readReceiptEnabled: true,
  earpieceModeEnabled: false,
  filterNotificationEnabled: false,
  deleteRemarkSyncEnabled: false,
  appearance: 'basic'
}

class PreferenceStore {
  preferences: PreferenceSnapshot = DEFAULT_SNAPSHOT
  notificationPermissionStatus = 'undetermined'
  isReady = false

  constructor() {
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
          this.preferences = {
            ...DEFAULT_SNAPSHOT,
            ...stored,
            appearance: normalizedAppearance
          }
        })
      }

      this.refreshNotificationPermission().catch(() => undefined)
    } finally {
      runInAction(() => {
        this.isReady = true
      })
    }
  }

  private async persist() {
    await storage.setJson(NIMConfig.storageKeys.preferences, this.preferences)
  }

  resolveColorScheme(systemColorScheme?: string | null) {
    if (this.preferences.appearance === 'common') {
      return 'dark'
    }

    return systemColorScheme === 'dark' ? 'light' : 'light'
  }

  async updatePreference<K extends keyof PreferenceSnapshot>(key: K, value: PreferenceSnapshot[K]) {
    runInAction(() => {
      this.preferences[key] = value
    })
    await this.persist()
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
  }

  async openSystemSettings() {
    await Linking.openSettings()
  }
}

export const preferenceStore = new PreferenceStore()
