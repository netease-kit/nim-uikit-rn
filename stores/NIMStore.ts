import { makeAutoObservable, runInAction } from 'mobx'

import { installNativeCameraCaptureSettingServiceGuard } from '@/utils/native-capture-state'
import { getDisplayErrorMessage } from '@/utils/error-message'
import { setFallbackNetworkAvailableChecker } from '@/utils/network'
import NIM, {
  isIgnorableNIMLog,
  V2NIM,
  V2NIMDataSyncLevel,
  V2NIMLoginStatus
} from '@/utils/nim-sdk'
import { configureNIMOfflinePush } from '@/utils/offline-push'

import { assertAppKeyConfigured, NIMConfig } from '../constants/NIMConfig'
import { preferenceStore } from './PreferenceStore'

function shouldIgnoreNIMLog(args: unknown[]) {
  return isIgnorableNIMLog(args)
}

const nimLogger = {
  debug: (...args: unknown[]) => {
    if (NIMConfig.debugLevel === 'debug' && !shouldIgnoreNIMLog(args)) {
      console.debug(...args)
    }
  },
  log: (...args: unknown[]) => {
    if (
      (NIMConfig.debugLevel === 'debug' || NIMConfig.debugLevel === 'log') &&
      !shouldIgnoreNIMLog(args)
    ) {
      console.log(...args)
    }
  },
  warn: (...args: unknown[]) => {
    if (
      (NIMConfig.debugLevel === 'debug' ||
        NIMConfig.debugLevel === 'log' ||
        NIMConfig.debugLevel === 'warn') &&
      !shouldIgnoreNIMLog(args)
    ) {
      console.warn(...args)
    }
  },
  error: (...args: unknown[]) => {
    if (!shouldIgnoreNIMLog(args)) {
      console.error(...args)
    }
  }
}

class NIMStore {
  nim: V2NIM | null = null
  isInitialized: boolean = false
  initializationError: string | null = null
  loginAccount: string | null = null
  cloudConversationEnabled: boolean = NIMConfig.enableV2CloudConversation
  connectStatus: number | null = null

  private readyPromise: Promise<void>
  private resolveReady!: () => void
  private hasResolvedReady = false

  constructor() {
    this.readyPromise = new Promise<void>((resolve) => {
      this.resolveReady = resolve
    })
    makeAutoObservable(this, {}, { autoBind: true })
    setFallbackNetworkAvailableChecker(() => this.isLoggedIn() && this.isConnected())
    this.initNIM()
  }

  // 初始化NIM实例
  initNIM = async () => {
    const nimRuntime = NIM

    if (!nimRuntime?.getInstance) {
      runInAction(() => {
        this.initializationError = 'NIM runtime is unavailable'
      })
      this.markReady()
      return
    }

    try {
      await preferenceStore.waitUntilReady()
      await this.createNIMInstance(preferenceStore.getCloudConversationEnabled(this.loginAccount))
      this.markReady()
    } catch (error) {
      console.error('NIM实例初始化失败', error)
      runInAction(() => {
        this.initializationError = getDisplayErrorMessage(error, 'NIM init failed')
        this.isInitialized = false
      })
      this.markReady()
    }
  }

  private async createNIMInstance(cloudConversationEnabled: boolean) {
    assertAppKeyConfigured()

    const nimRuntime = NIM

    if (!nimRuntime?.getInstance) {
      throw new Error('NIM runtime is unavailable')
    }

    console.log('[nimStore] createNIMInstance', {
      cloudConversationEnabled
    })

    const nimInstance: V2NIM = nimRuntime.getInstance(
      {
        appkey: NIMConfig.appkey,
        debugLevel: NIMConfig.debugLevel,
        apiVersion: NIMConfig.apiVersion,
        needReconnect: true,
        enableV2CloudConversation: cloudConversationEnabled,
        binaryWebsocket: NIMConfig.binaryWebsocket,
        V2NIMFriendServiceConfig: {
          enableServerV2FriendAddApplication: true
        }
      },
      // 以下为测试环境配置，线上无需配置
      {
        ...NIMConfig.testEnvironment,
        loggerConfig: {
          debugLevel: NIMConfig.debugLevel,
          logFunc: nimLogger
        }
      }
    )

    installNativeCameraCaptureSettingServiceGuard(nimInstance)
    configureNIMOfflinePush(nimInstance)

    runInAction(() => {
      this.nim = nimInstance
      this.isInitialized = true
      this.initializationError = null
      this.cloudConversationEnabled = cloudConversationEnabled
      this.connectStatus = nimInstance.V2NIMLoginService.getConnectStatus?.() ?? null
    })
  }

  private async destroyCurrentInstance() {
    const currentNim = this.nim as (V2NIM & { destroy?: () => Promise<void> }) | null

    if (!currentNim) {
      return
    }

    try {
      if (typeof currentNim.destroy === 'function') {
        await currentNim.destroy()
      }
    } catch (error) {
      console.warn('NIM实例销毁失败，继续尝试重建', error)
    } finally {
      runInAction(() => {
        this.nim = null
        this.isInitialized = false
        this.connectStatus = null
      })
    }
  }

  async ensureConfigured(account?: string | null) {
    const startedAt = Date.now()
    await preferenceStore.waitUntilReady()
    await this.waitUntilReady()

    const nextCloudConversationEnabled = preferenceStore.getCloudConversationEnabled(
      account ?? this.loginAccount
    )

    console.log('[nimStore] ensureConfigured', {
      account: account ?? this.loginAccount,
      currentCloudConversationEnabled: this.cloudConversationEnabled,
      nextCloudConversationEnabled,
      hasInstance: !!this.nim
    })

    if (this.nim && this.cloudConversationEnabled === nextCloudConversationEnabled) {
      console.log('[nimStore] ensureConfigured:reuse', {
        account: account ?? this.loginAccount,
        durationMs: Date.now() - startedAt
      })
      return
    }

    const rebuildStartedAt = Date.now()
    await this.destroyCurrentInstance()
    await this.createNIMInstance(nextCloudConversationEnabled)
    console.log('[nimStore] ensureConfigured:rebuild', {
      account: account ?? this.loginAccount,
      durationMs: Date.now() - rebuildStartedAt,
      totalDurationMs: Date.now() - startedAt
    })
  }

  private markReady() {
    if (this.hasResolvedReady) {
      return
    }

    this.hasResolvedReady = true
    this.resolveReady()
  }

  async waitUntilReady() {
    if (this.isInitialized || this.hasResolvedReady) {
      return
    }

    await this.readyPromise
  }

  getLoginUser() {
    return this.nim?.V2NIMLoginService.getLoginUser() || this.loginAccount || null
  }

  getLoginStatus() {
    return (
      this.nim?.V2NIMLoginService.getLoginStatus?.() ??
      V2NIMLoginStatus?.V2NIM_LOGIN_STATUS_LOGOUT ??
      0
    )
  }

  isLoggedIn() {
    return this.getLoginStatus() === (V2NIMLoginStatus?.V2NIM_LOGIN_STATUS_LOGINED ?? 1)
  }

  getConnectStatus() {
    return this.connectStatus
  }

  isConnected() {
    return this.getConnectStatus() === 1
  }

  setConnectStatus(status: number | null) {
    runInAction(() => {
      this.connectStatus = status
    })
  }

  async waitForSendReady(timeoutMs = 15000) {
    const nim = this.nim

    if (!nim) {
      throw new Error('NIM 未初始化')
    }

    if (this.isLoggedIn() && this.isConnected()) {
      return
    }

    const loggedInStatus = V2NIMLoginStatus?.V2NIM_LOGIN_STATUS_LOGINED ?? 1

    await new Promise<void>((resolve, reject) => {
      let finished = false

      const cleanup = () => {
        nim.V2NIMLoginService.off('onLoginStatus', handleLoginStatus)
        nim.V2NIMLoginService.off('onConnectStatus', handleConnectStatus)
        clearTimeout(timer)
      }

      const finish = () => {
        if (finished || !this.isLoggedIn() || !this.isConnected()) {
          return
        }

        finished = true
        cleanup()
        resolve()
      }

      const handleLoginStatus = (status: number) => {
        if (status === loggedInStatus) {
          finish()
        }
      }

      const handleConnectStatus = (status: number) => {
        if (status === 1) {
          finish()
        }
      }

      const timer = setTimeout(() => {
        if (finished) {
          return
        }

        finished = true
        cleanup()
        reject(new Error('NIM send ready timeout'))
      }, timeoutMs)

      nim.V2NIMLoginService.on('onLoginStatus', handleLoginStatus)
      nim.V2NIMLoginService.on('onConnectStatus', handleConnectStatus)
      finish()
    })
  }

  async login(account: string, token: string, forceMode: boolean) {
    const loginStartedAt = Date.now()
    await preferenceStore.applyCloudConversationPreferenceForAccount(account)
    const ensureConfiguredStartedAt = Date.now()
    await this.ensureConfigured(account)
    console.log('[nimStore] login:ensureConfigured:done', {
      account,
      durationMs: Date.now() - ensureConfiguredStartedAt
    })

    const nim = this.nim

    if (!nim) {
      throw new Error('NIM 未初始化')
    }

    console.log('[nimStore] login start', {
      account,
      forceMode,
      cloudConversationEnabled: this.cloudConversationEnabled
    })

    runInAction(() => {
      this.loginAccount = account
    })

    try {
      const loggedInStatus = V2NIMLoginStatus?.V2NIM_LOGIN_STATUS_LOGINED ?? 1
      const waitForLoggedInStatus = new Promise<void>((resolve) => {
        if (nim.V2NIMLoginService.getLoginStatus?.() === loggedInStatus) {
          resolve()
          return
        }

        const handleLoginStatus = (status: number) => {
          if (status !== loggedInStatus) {
            return
          }

          nim.V2NIMLoginService.off('onLoginStatus', handleLoginStatus)
          resolve()
        }

        nim.V2NIMLoginService.on('onLoginStatus', handleLoginStatus)
      })
      const sdkLoginStartedAt = Date.now()
      const sdkLoginPromise = nim.V2NIMLoginService.login(account, token, {
        retryCount: 3,
        timeout: 60000,
        forceMode,
        syncLevel: V2NIMDataSyncLevel?.V2NIM_DATA_SYNC_TYPE_LEVEL_BASIC,
        authType: 0
      })

      sdkLoginPromise
        .then(() => {
          console.log('[nimStore] login:sdkLogin:done', {
            account,
            durationMs: Date.now() - sdkLoginStartedAt
          })
        })
        .catch((error) => {
          runInAction(() => {
            this.loginAccount = null
          })
          console.warn('[nimStore] login:sdkLogin:failed', {
            account,
            durationMs: Date.now() - sdkLoginStartedAt,
            error
          })
        })

      const loginGateStartedAt = Date.now()
      await Promise.race([
        sdkLoginPromise.then(() => 'sdk-login-resolved'),
        waitForLoggedInStatus.then(() => 'login-status-logined')
      ])
      console.log('[nimStore] login:gate:done', {
        account,
        durationMs: Date.now() - loginGateStartedAt
      })
    } catch (error) {
      runInAction(() => {
        this.loginAccount = null
      })
      throw error
    }

    console.log('[nimStore] login success', {
      account,
      forceMode,
      cloudConversationEnabled: this.cloudConversationEnabled,
      totalDurationMs: Date.now() - loginStartedAt
    })

    const notificationSyncStartedAt = Date.now()
    void preferenceStore
      .hydrateNotificationSettingsFromNative()
      .catch(() => undefined)
      .then(() => preferenceStore.syncNotificationSettingsToNative().catch(() => undefined))
      .then(() => {
        console.log('[nimStore] login:syncNotificationSettings:done', {
          account,
          durationMs: Date.now() - notificationSyncStartedAt
        })
      })
  }

  async logout() {
    try {
      await this.nim?.V2NIMLoginService.logout()
    } finally {
      runInAction(() => {
        this.loginAccount = null
        this.connectStatus = null
      })
    }
  }
}

export const nimStore = new NIMStore()
