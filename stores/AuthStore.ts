import { makeAutoObservable, runInAction } from 'mobx'

import { NIMConfig } from '@/constants/NIMConfig'
import { loginRegisterByCode, requestLoginSmsCode } from '@/services/auth'
import { getConfirmedOfflineMessage } from '@/utils/network'
import type { V2NIMKickedOfflineDetail } from '@/utils/nim-sdk'
import { storage } from '@/utils/storage'

import { conversationStore } from './ConversationStore'
import { friendStore } from './FriendStore'
import { imStoreV2Bridge } from './ImStoreV2Bridge'
import { messageStore } from './MessageStore'
import { nimStore } from './NIMStore'
import { teamStore } from './TeamStore'
import { userStore } from './UserStore'

const MOBILE_REG = /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/
const SMS_REG = /^\d+$/

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message
  }

  if (typeof error === 'object' && error) {
    const candidate = error as Record<string, unknown>
    const message = candidate.errMsg ?? candidate.msg ?? candidate.message
    if (typeof message === 'string' && message.trim()) {
      return message
    }
  }

  return fallback
}

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
  isSessionRestoring = false
  isLoggingIn = false
  isRequestingSms = false
  smsCountdown = 0
  pendingRegistration = false
  pendingConversationId: string | null = null
  loginStatus = 0
  kickedOfflineDetail: V2NIMKickedOfflineDetail | null = null

  private countdownTimer: ReturnType<typeof setInterval> | null = null
  private sessionSwitchPromise: Promise<void> | null = null

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true })
    this.bootstrap()
  }

  get isAuthenticated() {
    return !!this.session
  }

  get hasValidatedSession() {
    return !!this.session && !this.isSessionRestoring && this.loginStatus === 1
  }

  get isKickedOffline() {
    return !!this.kickedOfflineDetail
  }

  validateMobile(mobile: string) {
    return MOBILE_REG.test(mobile.trim())
  }

  validateSmsCode(code: string) {
    const normalizedCode = code.trim()
    return SMS_REG.test(normalizedCode) && normalizedCode.length > 0 && normalizedCode.length <= 6
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
          this.isSessionRestoring = true
          this.kickedOfflineDetail = null
        })

        await this.restoreNimLogin(saved)
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
        this.isSessionRestoring = false
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
    } catch (error) {
      console.warn('[auth] requestSmsCode failed', {
        mobile: normalizedMobile,
        message: getErrorMessage(error, '验证码获取失败'),
        error
      })

      throw error
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
      throw new Error(
        !this.validateMobile(normalizedMobile) ? '请输入正确的手机号' : '请输入正确的验证码'
      )
    }

    runInAction(() => {
      this.isLoggingIn = true
    })

    const loginStartedAt = Date.now()
    console.log('[auth] loginWithSms:start', {
      mobile: normalizedMobile,
      startedAt: loginStartedAt
    })

    try {
      const sessionSwitchStartedAt = Date.now()
      await this.prepareForSessionSwitch()
      console.log('[auth] loginWithSms:prepareForSessionSwitch:done', {
        mobile: normalizedMobile,
        durationMs: Date.now() - sessionSwitchStartedAt
      })

      const authApiStartedAt = Date.now()
      const result = await loginRegisterByCode(normalizedMobile, normalizedCode)
      console.log('[auth] loginWithSms:loginRegisterByCode:done', {
        mobile: normalizedMobile,
        imAccid: result.imAccid,
        durationMs: Date.now() - authApiStartedAt
      })
      try {
        const nimLoginStartedAt = Date.now()
        await nimStore.login(result.imAccid, result.imToken, true)
        console.log('[auth] loginWithSms:nimLogin:done', {
          mobile: normalizedMobile,
          account: result.imAccid,
          durationMs: Date.now() - nimLoginStartedAt
        })
      } catch (error) {
        const offlineMessage = await getConfirmedOfflineMessage()
        const message = offlineMessage ?? getErrorMessage(error, '登录失败')
        console.warn('[auth] nim login failed', {
          account: result.imAccid,
          message,
          error
        })
        throw new Error(message)
      }

      const nextSession: AuthSession = {
        mobile: normalizedMobile,
        account: result.imAccid,
        token: result.imToken,
        accessToken: result.accessToken
      }

      const persistStartedAt = Date.now()
      await storage.setJson(NIMConfig.storageKeys.authSession, nextSession)
      console.log('[auth] loginWithSms:persistSession:done', {
        mobile: normalizedMobile,
        account: result.imAccid,
        durationMs: Date.now() - persistStartedAt
      })

      runInAction(() => {
        this.session = nextSession
        this.loginStatus = 1
        this.isSessionRestoring = false
        this.pendingRegistration = false
        this.kickedOfflineDetail = null
      })

      console.log('[auth] loginWithSms:success', {
        mobile: normalizedMobile,
        account: result.imAccid,
        totalDurationMs: Date.now() - loginStartedAt
      })
    } catch (error) {
      console.warn('[auth] loginWithSms failed', {
        mobile: normalizedMobile,
        message: getErrorMessage(error, '登录失败'),
        totalDurationMs: Date.now() - loginStartedAt,
        error
      })
      throw error
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
    await this.clearPersistedSession(true)
  }

  private async prepareForSessionSwitch() {
    if (this.sessionSwitchPromise) {
      await this.sessionSwitchPromise
      return
    }

    this.sessionSwitchPromise = (async () => {
      const startedAt = Date.now()
      const hasLocalSession = !!this.session
      const hasNIMSession = nimStore.isLoggedIn()

      console.log('[auth] prepareForSessionSwitch:start', {
        hasLocalSession,
        hasNIMSession
      })

      if (!hasLocalSession && !hasNIMSession) {
        console.log('[auth] prepareForSessionSwitch:skip', {
          durationMs: Date.now() - startedAt
        })
        return
      }

      if (hasNIMSession) {
        try {
          const logoutStartedAt = Date.now()
          await nimStore.logout()
          console.log('[auth] prepareForSessionSwitch:logoutPreviousNim:done', {
            durationMs: Date.now() - logoutStartedAt
          })
        } catch (error) {
          console.warn('[auth] logout previous nim session failed during account switch', error)
        }
      }

      const clearStartedAt = Date.now()
      await this.clearPersistedSession(true)
      console.log('[auth] prepareForSessionSwitch:clearPersistedSession:done', {
        durationMs: Date.now() - clearStartedAt
      })
      console.log('[auth] prepareForSessionSwitch:done', {
        durationMs: Date.now() - startedAt
      })
    })()

    try {
      await this.sessionSwitchPromise
    } finally {
      this.sessionSwitchPromise = null
    }
  }

  async clearPersistedSession(resetIMState = false) {
    await storage.remove(NIMConfig.storageKeys.authSession)

    if (resetIMState) {
      imStoreV2Bridge.destroy()
    }

    friendStore.resetState()
    conversationStore.resetState()
    messageStore.resetState()
    teamStore.resetState()
    userStore.resetState()

    runInAction(() => {
      this.session = null
      this.loginStatus = 0
      this.isSessionRestoring = false
      this.pendingRegistration = false
      this.pendingConversationId = null
      this.kickedOfflineDetail = null
    })
  }

  async logout() {
    const hadNIMSession = nimStore.isLoggedIn()

    if (hadNIMSession) {
      try {
        await nimStore.logout()
      } catch (error) {
        console.warn('NIM logout failed before local session cleared', error)
      }
    }

    await this.clearPersistedSession(true)
    runInAction(() => {
      this.loginStatus = 0
      this.kickedOfflineDetail = null
    })
  }
}

export const authStore = new AuthStore()
