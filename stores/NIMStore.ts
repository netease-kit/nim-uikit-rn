import { makeAutoObservable, runInAction } from 'mobx'

import NIM, { V2NIM, V2NIMLoginStatus } from '@/utils/nim-sdk'

import {
  hasConfiguredNIMAppKey,
  NIM_APP_KEY_REQUIRED_MESSAGE,
  NIMConfig
} from '../constants/NIMConfig'

class NIMStore {
  nim: V2NIM | null = null
  isInitialized: boolean = false
  initializationError: string | null = null
  loginAccount: string | null = null

  private readyPromise: Promise<void>
  private resolveReady!: () => void
  private hasResolvedReady = false

  constructor() {
    this.readyPromise = new Promise<void>((resolve) => {
      this.resolveReady = resolve
    })
    makeAutoObservable(this, {}, { autoBind: true })
    this.initNIM()
  }

  // 初始化NIM实例
  initNIM = async () => {
    if (!NIM?.getInstance) {
      runInAction(() => {
        this.initializationError = 'NIM runtime is unavailable'
      })
      this.markReady()
      return
    }

    if (!hasConfiguredNIMAppKey()) {
      runInAction(() => {
        this.initializationError = NIM_APP_KEY_REQUIRED_MESSAGE
      })
      this.markReady()
      return
    }

    try {
      const nimInstance: V2NIM = NIM.getInstance(
        {
          appkey: NIMConfig.appkey,
          debugLevel: NIMConfig.debugLevel,
          apiVersion: NIMConfig.apiVersion,
          enableV2CloudConversation: NIMConfig.enableV2CloudConversation,
          binaryWebsocket: NIMConfig.binaryWebsocket
        },
        // 以下为测试环境配置，线上无需配置
        NIMConfig.testEnvironment
      )

      runInAction(() => {
        this.nim = nimInstance
        this.isInitialized = true
        this.initializationError = null
      })
      this.markReady()
    } catch (error) {
      console.error('NIM实例初始化失败', error)
      runInAction(() => {
        this.initializationError = error instanceof Error ? error.message : 'NIM init failed'
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

  async login(account: string, token: string, forceMode: boolean) {
    await this.waitUntilReady()

    if (!this.nim) {
      throw new Error(this.initializationError || 'NIM 未初始化')
    }

    await this.nim.V2NIMLoginService.login(account, token, {
      retryCount: 3,
      timeout: 60000,
      forceMode,
      authType: 0
    })

    runInAction(() => {
      this.loginAccount = account
    })
  }

  async logout() {
    runInAction(() => {
      this.loginAccount = null
    })
    await this.nim?.V2NIMLoginService.logout()
  }
}

export const nimStore = new NIMStore()
