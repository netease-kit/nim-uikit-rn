import { makeAutoObservable, runInAction } from 'mobx'

import { NIMConfig } from '@/constants/NIMConfig'
import { loginRegisterByCode, requestLoginSmsCode } from '@/services/auth'
import type { V2NIMKickedOfflineDetail } from '@/utils/nim-sdk'
import { storage } from '@/utils/storage'

import { nimStore } from './NIMStore'

const MOBILE_REG = /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/
const SMS_REG = /^\d+$/

export type AuthSession = {
  mobile: string
  account: string
  token: string
  accessToken?: string
}

class AuthStore {
  session: AuthSession | null = null
  isReady = false
  isBootstrapping = false
  isLoggingIn = false
  isRequestingSms = false
  smsCountdown = 0
  pendingRegistration = false
  pendingConversationId: string | null = null
  loginStatus = 0
  kickedOfflineDetail: V2NIMKickedOfflineDetail | null = null

  private countdownTimer: ReturnType<typeof setInterval> | null = null

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true })
    this.bootstrap()
  }

  get isAuthenticated() {
    return !!this.session
  }

  get isKickedOffline() {
    return !!this.kickedOfflineDetail
  }

  validateMobile(mobile: string) {
    return MOBILE_REG.test(mobile.trim())
  }

  validateSmsCode(code: string) {
    return SMS_REG.test(code.trim())
  }

  private startSmsCountdown() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer)
    }

    this.smsCountdown = 60
    this.countdownTimer = setInterval(() => {
      runInAction(() => {
        if (this.smsCountdown <= 1) {
          this.smsCountdown = 0
          if (this.countdownTimer) {
            clearInterval(this.countdownTimer)
            this.countdownTimer = null
          }
          return
        }

        this.smsCountdown -= 1
      })
    }, 1000)
  }

  async bootstrap() {
    runInAction(() => {
      this.isBootstrapping = true
    })

    try {
      const saved = await storage.getJson<AuthSession>(NIMConfig.storageKeys.authSession)

      if (saved?.account && saved?.token) {
        runInAction(() => {
          this.session = saved
          this.kickedOfflineDetail = null
        })

        this.restoreNimLogin(saved)
      }
    } finally {
      runInAction(() => {
        this.isBootstrapping = false
        this.isReady = true
      })
    }
  }

  private async restoreNimLogin(saved: AuthSession) {
    try {
      await nimStore.waitUntilReady()
      await nimStore.login(saved.account, saved.token, false)
      runInAction(() => {
        this.loginStatus = 1
      })
    } catch {
      await this.clearPersistedSession()
    }
  }

  async requestSmsCode(mobile: string) {
    const normalizedMobile = mobile.trim()

    if (!this.validateMobile(normalizedMobile)) {
      throw new Error('请输入正确的手机号')
    }

    if (this.smsCountdown > 0) {
      return { isFirstRegister: this.pendingRegistration }
    }

    runInAction(() => {
      this.isRequestingSms = true
    })

    try {
      const result = await requestLoginSmsCode(normalizedMobile)
      runInAction(() => {
        this.pendingRegistration = !!result.isFirstRegister
        this.startSmsCountdown()
      })
      return result
    } finally {
      runInAction(() => {
        this.isRequestingSms = false
      })
    }
  }

  async loginWithSms(mobile: string, smsCode: string) {
    const normalizedMobile = mobile.trim()
    const normalizedCode = smsCode.trim()

    if (!this.validateMobile(normalizedMobile) || !this.validateSmsCode(normalizedCode)) {
      throw new Error('手机号或验证码错误')
    }

    runInAction(() => {
      this.isLoggingIn = true
    })

    try {
      const result = await loginRegisterByCode(normalizedMobile, normalizedCode)
      await nimStore.login(result.imAccid, result.imToken, true)

      const nextSession: AuthSession = {
        mobile: normalizedMobile,
        account: result.imAccid,
        token: result.imToken,
        accessToken: result.accessToken
      }

      await storage.setJson(NIMConfig.storageKeys.authSession, nextSession)

      runInAction(() => {
        this.session = nextSession
        this.loginStatus = 1
        this.pendingRegistration = false
        this.kickedOfflineDetail = null
      })
    } finally {
      runInAction(() => {
        this.isLoggingIn = false
      })
    }
  }

  setLoginStatus(status: number) {
    runInAction(() => {
      this.loginStatus = status
    })
  }

  setPendingConversationId(conversationId: string | null) {
    runInAction(() => {
      this.pendingConversationId = conversationId
    })
  }

  async handleKickedOffline(detail: V2NIMKickedOfflineDetail) {
    runInAction(() => {
      this.kickedOfflineDetail = detail
    })
    await this.clearPersistedSession()
  }

  async clearPersistedSession() {
    await storage.remove(NIMConfig.storageKeys.authSession)
    runInAction(() => {
      this.session = null
      this.loginStatus = 0
      this.pendingRegistration = false
    })
  }

  async logout() {
    await this.clearPersistedSession()
    runInAction(() => {
      this.loginStatus = 0
      this.kickedOfflineDetail = null
    })

    nimStore.logout().catch((error) => {
      console.warn('NIM logout failed after local session cleared', error)
    })
  }
}

export const authStore = new AuthStore()
