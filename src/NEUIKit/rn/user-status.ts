import { makeAutoObservable, runInAction } from 'mobx'
import { useEffect, useRef } from 'react'
import { Platform } from 'react-native'

import { nimStore } from '@/stores'
import { translateCurrentApp } from '@/utils/app-language'
import type { V2NIM } from '@/utils/nim-sdk'
import { V2NIMUserStatusType } from '@/utils/nim-sdk'

type UIKitUserStatus = {
  accountId?: string
  statusType?: number
  clientType?: unknown
  publishTime?: number
  extension?: unknown
  serverExtension?: string
  serverConfig?: string
}

type UIKitSubscribeResultObject = {
  failedAccounts?: unknown[]
  failedAccountIds?: unknown[]
  userStatusList?: UIKitUserStatus[]
  statuses?: UIKitUserStatus[]
  data?:
    | UIKitUserStatus[]
    | {
        userStatusList?: UIKitUserStatus[]
        statuses?: UIKitUserStatus[]
      }
}

type UIKitSubscribeResult = (string | UIKitUserStatus)[] | UIKitSubscribeResultObject | undefined
const USER_STATUS_SUBSCRIBE_CHUNK_SIZE = 50
const ONLINE_STATUS_TYPE = V2NIMUserStatusType?.V2NIM_USER_STATUS_TYPE_LOGIN ?? 1
const USER_STATUS_SUBSCRIBE_DURATION = 3600 * 24 * 7
const USER_STATUS_MAX_DESIRED_ACCOUNT_COUNT = 3000
const USER_STATUS_SUBSCRIBE_DEBOUNCE_MS = 350
const USER_STATUS_SUBSCRIBE_BATCH_INTERVAL_MS = 1000
const USER_STATUS_SUBSCRIBE_CALL_TIMEOUT_MS = 10_000
const USER_STATUS_SUBSCRIBE_IMMEDIATE_SYNC = false
const USER_STATUS_ANDROID_NATIVE_SUBSCRIBE_ENABLED = true
const USER_STATUS_UNSUBSCRIBE_DELAY_MS = 5_000
const USER_STATUS_RATE_LIMIT_COOLDOWN_MS = 30_000
const USER_STATUS_FORCE_RESYNC_INITIAL_DELAY_MS = 10_000
const USER_STATUS_FORCE_RESYNC_RETRY_DELAY_MS = 31_000
const USER_STATUS_FORCE_RESYNC_MAX_ATTEMPTS = 1
const USER_STATUS_DISCONNECTED_RETRY_MS = 5_000
const USER_STATUS_EVENT_NAME = 'onUserStatusChanged'
const USER_STATUS_GLOBAL_FRIEND_SCOPE_ID = 'global-friends'
const USER_STATUS_DEBUG_LOG_ENABLED = false
let hasLoggedSubscriptionFallback = false
let userStatusScopeUpdateSeq = 0
let userStatusSubscribeCallSeq = 0

type UIKitSubscriptionService = {
  on?: (eventName: string, handler: (userStatusList: UIKitUserStatus[]) => void) => void
  off?: (eventName: string, handler: (userStatusList: UIKitUserStatus[]) => void) => void
  getUserStatus?: (accountIds: string[]) => Promise<UIKitUserStatus[] | undefined>
  subscribeUserStatus?: (option: {
    accountIds: string[]
    duration?: number
    immediateSync?: boolean
  }) => Promise<UIKitSubscribeResult>
  unsubscribeUserStatus?: (option: { accountIds?: string[] }) => Promise<UIKitSubscribeResult>
  __im2RNPatchedEmptySubscriptionService?: boolean
}

type UIKitLegacyEventService = {
  subscribeEvent?: (option: {
    type: 1
    accounts: string[]
    subscribeTime?: number
    sync?: boolean
  }) => Promise<UIKitSubscribeResult>
  unSubscribeEvents?: (option: { type: 1; accounts?: string[] }) => Promise<UIKitSubscribeResult>
}

type UIKitPushEvent = {
  account?: string
  accountId?: string
  clientType?: unknown
  ext?: unknown
  time?: number | string
  type?: number | string
  value?: number | string
  serverConfig?: string
  serverExt?: string
  serverExtension?: string
}

type UIKitPushEventSource = {
  on?: (eventName: 'pushEvents', handler: (events: UIKitPushEvent[]) => void) => void
  off?: (eventName: 'pushEvents', handler: (events: UIKitPushEvent[]) => void) => void
  event?: UIKitLegacyEventService
}

class UIKitUserStatusStore {
  stateMap = new Map<string, Map<string, UIKitUserStatus>>()
  version = 0
  private boundServiceSource: UIKitSubscriptionService | null = null
  private boundService: UIKitSubscriptionService | null = null
  private boundPushEventSource: UIKitPushEventSource | null = null
  private subscriptionScopes = new Map<string, string[]>()
  private desiredAccounts = new Set<string>()
  private subscribedAccounts = new Set<string>()
  private attemptedAccounts = new Set<string>()
  private subscribeTimer: ReturnType<typeof setTimeout> | null = null
  private rateLimitRetryTimer: ReturnType<typeof setTimeout> | null = null
  private unsubscribeTimerByAccount = new Map<string, ReturnType<typeof setTimeout>>()
  private forceResyncTimerByAccount = new Map<string, ReturnType<typeof setTimeout>>()
  private forceResyncAttemptsByAccount = new Map<string, number>()
  private accountStatusGeneration = new Map<string, number>()
  private conflictingOfflineResyncAccounts = new Set<string>()
  private subscribeInFlight = false
  private subscribeAgainRequested = false
  private rateLimitedUntil = 0

  constructor() {
    makeAutoObservable(
      this,
      {
        subscriptionScopes: false,
        desiredAccounts: false,
        subscribedAccounts: false,
        attemptedAccounts: false,
        subscribeTimer: false,
        rateLimitRetryTimer: false,
        unsubscribeTimerByAccount: false,
        forceResyncTimerByAccount: false,
        forceResyncAttemptsByAccount: false,
        accountStatusGeneration: false,
        conflictingOfflineResyncAccounts: false,
        subscribeInFlight: false,
        subscribeAgainRequested: false,
        rateLimitedUntil: false
      } as never,
      { autoBind: true }
    )
  }

  bind(
    service: UIKitSubscriptionService | null | undefined,
    pushEventSource: UIKitPushEventSource | null | undefined
  ) {
    const nextServiceSource = service || null
    const nextPushEventSource = pushEventSource || null
    const nextNativeService = getUsableSubscriptionService(service)

    if (
      this.boundServiceSource === nextServiceSource &&
      this.boundPushEventSource === nextPushEventSource
    ) {
      return
    }

    if (
      this.boundPushEventSource === nextPushEventSource &&
      !this.boundService &&
      !nextNativeService
    ) {
      this.boundServiceSource = nextServiceSource
      return
    }

    this.unbind()
    this.boundServiceSource = nextServiceSource

    if (nextNativeService) {
      this.boundService = nextNativeService
      nextNativeService.on?.(USER_STATUS_EVENT_NAME, this.handleUserStatusChanged)
    } else if (!hasLoggedSubscriptionFallback) {
      hasLoggedSubscriptionFallback = true
      logUserStatusDebug('[user-status] use pushEvents fallback', {
        hasService: !!service,
        hasOn: typeof service?.on === 'function',
        hasOff: typeof service?.off === 'function',
        hasSubscribeUserStatus: typeof service?.subscribeUserStatus === 'function',
        isPatchedEmptyService: !!service?.__im2RNPatchedEmptySubscriptionService,
        hasLegacySubscribeEvent: typeof pushEventSource?.event?.subscribeEvent === 'function'
      })
    }

    if (pushEventSource?.on && pushEventSource.off) {
      this.boundPushEventSource = pushEventSource
      pushEventSource.on('pushEvents', this.handlePushEvents)
    }

    logUserStatusDebug('[user-status] subscription listener bound')
  }

  unbind() {
    if (this.boundService?.off) {
      this.boundService.off(USER_STATUS_EVENT_NAME, this.handleUserStatusChanged)
    }

    if (this.boundPushEventSource?.off) {
      this.boundPushEventSource.off('pushEvents', this.handlePushEvents)
    }

    this.boundService = null
    this.boundServiceSource = null
    this.boundPushEventSource = null
  }

  resetSubscriptions() {
    this.subscribedAccounts.clear()
    this.attemptedAccounts.clear()
    this.forceResyncAttemptsByAccount.clear()
    this.clearSubscribeTimer()
    this.clearRateLimitRetryTimer()
    this.clearUnsubscribeTimers()
    this.clearForceResyncTimers()
  }

  resetState() {
    this.unbind()
    this.subscriptionScopes.clear()
    this.desiredAccounts.clear()
    this.subscribedAccounts.clear()
    this.attemptedAccounts.clear()
    this.clearSubscribeTimer()
    this.clearRateLimitRetryTimer()
    this.clearUnsubscribeTimers()
    this.stateMap.clear()
    this.accountStatusGeneration.clear()
    this.version += 1
  }

  getUserStatus(accountId: string) {
    const statusesByTerminal = this.stateMap.get(accountId)

    if (!statusesByTerminal?.size) {
      return undefined
    }

    const statusList = Array.from(statusesByTerminal.values())
    const onlineStatuses = statusList.filter((status) => status.statusType === ONLINE_STATUS_TYPE)

    if (onlineStatuses.length) {
      return onlineStatuses.sort(compareUserStatusesByPublishTimeDesc)[0]
    }

    return statusList.sort(compareUserStatusesByPublishTimeDesc)[0]
  }

  setSubscriptionScope(scopeId: string, accountIds: string[]) {
    const normalizedAccounts = normalizeAccounts(accountIds)
    const currentAccounts = this.subscriptionScopes.get(scopeId) || []

    if (areSameAccounts(currentAccounts, normalizedAccounts)) {
      logUserStatusDebug('[user-status] scope unchanged', {
        scopeId,
        accountCount: normalizedAccounts.length
      })
      return
    }

    userStatusScopeUpdateSeq += 1
    logUserStatusDebug('[user-status] scope update', {
      seq: userStatusScopeUpdateSeq,
      scopeId,
      accountCount: normalizedAccounts.length
    })
    this.subscriptionScopes.set(scopeId, normalizedAccounts)
    this.rebuildDesiredAccounts()
  }

  clearSubscriptionScope(scopeId: string) {
    userStatusScopeUpdateSeq += 1
    logUserStatusDebug('[user-status] scope clear', {
      seq: userStatusScopeUpdateSeq,
      scopeId,
      accountCount: this.subscriptionScopes.get(scopeId)?.length || 0
    })
    this.subscriptionScopes.delete(scopeId)
    this.rebuildDesiredAccounts()
  }

  async subscribe(accountIds: string[]) {
    this.setSubscriptionScope('default', accountIds)
  }

  async ensureAccountsSubscribed(accountIds: string[]) {
    const normalizedAccounts = normalizeAccounts(accountIds)

    if (!normalizedAccounts.length) {
      return
    }

    bindUIKitUserStatusNIM(nimStore.nim)

    if (!this.isSubscriptionReady() || this.isRateLimited()) {
      normalizedAccounts.forEach((accountId) => {
        this.desiredAccounts.add(accountId)
        this.clearUnsubscribeTimer(accountId)
      })
      this.scheduleSubscribeFlush()
      return
    }

    for (const accountId of normalizedAccounts) {
      this.desiredAccounts.add(accountId)
      this.clearUnsubscribeTimer(accountId)

      if (this.subscribedAccounts.has(accountId)) {
        await this.syncCurrentStatuses([accountId])
        continue
      }

      try {
        const subscribeResult = await this.subscribeChunk([accountId])
        const failedSet = new Set(subscribeResult.failedAccounts)

        if (!failedSet.has(accountId)) {
          runInAction(() => {
            this.subscribedAccounts.add(accountId)
          })
        }

        if (subscribeResult.userStatusList.length) {
          this.handleUserStatusChanged(subscribeResult.userStatusList, {
            authoritativeOffline: true
          })
        }

        await this.syncCurrentStatuses([accountId])
      } catch (error) {
        if (isRateLimitError(error)) {
          this.enterRateLimitCooldown(error)
          this.scheduleRateLimitRetry()
          return
        }

        console.warn('[user-status] ensure changed account subscribe failed', {
          accountId,
          code: getErrorCode(error),
          message: getErrorMessage(error)
        })
      }
    }
  }

  private rebuildDesiredAccounts() {
    const nextDesiredAccounts = new Set<string>()

    this.subscriptionScopes.forEach((accountIds, scopeId) => {
      if (scopeId === USER_STATUS_GLOBAL_FRIEND_SCOPE_ID) {
        return
      }

      accountIds.forEach((accountId) => nextDesiredAccounts.add(accountId))
    })
    this.subscriptionScopes.forEach((accountIds, scopeId) => {
      if (scopeId !== USER_STATUS_GLOBAL_FRIEND_SCOPE_ID) {
        return
      }

      accountIds.forEach((accountId) => nextDesiredAccounts.add(accountId))
    })

    nextDesiredAccounts.forEach((accountId) => this.clearUnsubscribeTimer(accountId))
    this.desiredAccounts = capDesiredAccounts(nextDesiredAccounts)
    this.attemptedAccounts.forEach((accountId) => {
      if (!this.desiredAccounts.has(accountId)) {
        this.attemptedAccounts.delete(accountId)
      }
    })
    logUserStatusDebug('[user-status] desired accounts rebuilt', {
      desiredCount: this.desiredAccounts.size,
      attemptedCount: this.attemptedAccounts.size,
      subscribedCount: this.subscribedAccounts.size,
      scopeCount: this.subscriptionScopes.size
    })

    Array.from(this.subscribedAccounts).forEach((accountId) => {
      if (!this.desiredAccounts.has(accountId)) {
        this.scheduleUnsubscribe(accountId)
      }
    })

    this.scheduleSubscribeFlush()
  }

  private scheduleSubscribeFlush(delay = USER_STATUS_SUBSCRIBE_DEBOUNCE_MS) {
    this.clearSubscribeTimer()

    const rateLimitDelay = Math.max(this.rateLimitedUntil - Date.now(), 0)
    const nextDelay = Math.max(delay, rateLimitDelay)

    this.subscribeTimer = setTimeout(() => {
      this.subscribeTimer = null
      this.flushDesiredSubscriptions().catch((error: unknown) => {
        console.warn('[user-status] flush visible subscriptions failed', error)
      })
    }, nextDelay)
  }

  private async flushDesiredSubscriptions() {
    if (this.subscribeInFlight) {
      this.subscribeAgainRequested = true
      return
    }

    if (!this.isSubscriptionReady()) {
      this.scheduleDisconnectedRetry()
      return
    }

    if (this.isRateLimited()) {
      this.scheduleRateLimitRetry()
      return
    }

    this.subscribeInFlight = true

    try {
      const normalizedAccounts = Array.from(this.desiredAccounts).filter(
        (accountId) =>
          !this.subscribedAccounts.has(accountId) && !this.attemptedAccounts.has(accountId)
      )
      logUserStatusDebug('[user-status] subscribe flush', {
        pendingCount: normalizedAccounts.length,
        desiredCount: this.desiredAccounts.size,
        attemptedCount: this.attemptedAccounts.size,
        subscribedCount: this.subscribedAccounts.size
      })

      if (!normalizedAccounts.length) {
        return
      }

      if (!isNativeUserStatusSubscribeEnabled()) {
        runInAction(() => {
          normalizedAccounts.forEach((accountId) => {
            this.subscribedAccounts.add(accountId)
          })
        })
        logUserStatusDebug('[user-status] native subscribe skipped', {
          platform: Platform.OS,
          skippedCount: normalizedAccounts.length,
          desiredCount: this.desiredAccounts.size,
          subscribedCount: this.subscribedAccounts.size
        })
        await this.syncCurrentStatuses(normalizedAccounts)
        return
      }

      for (
        let index = 0;
        index < normalizedAccounts.length;
        index += USER_STATUS_SUBSCRIBE_CHUNK_SIZE
      ) {
        if (!this.isSubscriptionReady()) {
          this.scheduleDisconnectedRetry()
          break
        }

        if (this.isRateLimited()) {
          this.scheduleRateLimitRetry()
          break
        }

        const chunk = normalizedAccounts
          .slice(index, index + USER_STATUS_SUBSCRIBE_CHUNK_SIZE)
          .filter((accountId) => this.desiredAccounts.has(accountId))

        if (!chunk.length) {
          continue
        }

        try {
          runInAction(() => {
            chunk.forEach((accountId) => {
              this.attemptedAccounts.add(accountId)
            })
          })
          const subscribeResult = await this.subscribeChunk(chunk)
          const failedAccounts = subscribeResult.failedAccounts
          if (subscribeResult.rateLimited) {
            this.enterRateLimitCooldown(subscribeResult.rateLimitError)
            break
          }
          const failedSet = new Set(failedAccounts)
          const subscribedAccounts = chunk.filter((accountId) => !failedSet.has(accountId))

          runInAction(() => {
            subscribedAccounts.forEach((accountId) => {
              this.subscribedAccounts.add(accountId)
            })
          })

          if (subscribeResult.userStatusList.length) {
            this.handleUserStatusChanged(subscribeResult.userStatusList, {
              authoritativeOffline: true
            })
          }

          logUserStatusDebug('[user-status] visible subscribe result', {
            requested: chunk.length,
            failedCount: failedAccounts.length,
            attemptedTotal: this.attemptedAccounts.size,
            subscribedTotal: this.subscribedAccounts.size,
            immediateStatusCount: subscribeResult.userStatusList.length
          })

          if (USER_STATUS_SUBSCRIBE_IMMEDIATE_SYNC) {
            const statusGenerationBefore = new Map(
              subscribedAccounts.map((accountId) => [
                accountId,
                this.accountStatusGeneration.get(accountId) || 0
              ])
            )
            await this.syncCurrentStatuses(subscribedAccounts)
            this.expireUnconfirmedOnlineStatuses(subscribedAccounts, statusGenerationBefore)
          }
          await delay(USER_STATUS_SUBSCRIBE_BATCH_INTERVAL_MS)
        } catch (error) {
          runInAction(() => {
            chunk.forEach((accountId) => {
              this.attemptedAccounts.delete(accountId)
            })
          })

          if (isSubscriptionTimeoutError(error)) {
            logUserStatusDebug('[user-status] subscribe call timeout, retry later', {
              accountCount: chunk.length,
              code: getErrorCode(error),
              message: getErrorMessage(error)
            })
            this.scheduleSubscribeFlush(USER_STATUS_RATE_LIMIT_COOLDOWN_MS)
            break
          }

          if (isSubscriptionIllegalStateError(error) || !this.isSubscriptionReady()) {
            logUserStatusDebug('[user-status] subscribe paused until connected', {
              accountCount: chunk.length,
              code: getErrorCode(error),
              loginStatus: nimStore.getLoginStatus(),
              connectStatus: nimStore.getConnectStatus()
            })
            this.scheduleDisconnectedRetry()
            break
          }

          if (isRateLimitError(error)) {
            this.enterRateLimitCooldown(error)
            break
          }

          console.warn('[user-status] visible subscribe failed', error)
        }
      }
    } finally {
      this.subscribeInFlight = false

      if (this.subscribeAgainRequested) {
        this.subscribeAgainRequested = false
        this.scheduleSubscribeFlush()
      }
    }
  }

  private async syncCurrentStatuses(accountIds: string[]) {
    if (!accountIds.length) {
      return
    }

    if (!this.boundService?.getUserStatus) {
      return
    }

    try {
      const statuses = (await this.boundService.getUserStatus(accountIds)) || []
      const normalizedAccounts = normalizeAccounts(accountIds)
      const statusAccountIds = new Set(
        statuses
          .map((status) => status.accountId)
          .filter((accountId): accountId is string => !!accountId)
      )
      const missingStatusAccountIds = normalizedAccounts.filter(
        (accountId) => !statusAccountIds.has(accountId)
      )

      if (statuses.length) {
        this.handleUserStatusChanged(statuses, {
          authoritativeOffline: true
        })
      }

      logUserStatusDebug('[user-status] native getUserStatus result', {
        requested: accountIds.length,
        missingStatusAccountIds,
        statusCount: statuses.length
      })
    } catch (error) {
      console.warn('[user-status] native getUserStatus failed', error)
    }
  }

  private async subscribeChunk(accountIds: string[]) {
    userStatusSubscribeCallSeq += 1
    const seq = userStatusSubscribeCallSeq
    const serviceType = this.boundService?.subscribeUserStatus
      ? 'subscription-service'
      : 'legacy-event'
    logUserStatusDebug('[user-status] subscribe call', {
      seq,
      serviceType,
      accountCount: accountIds.length,
      immediateSync: USER_STATUS_SUBSCRIBE_IMMEDIATE_SYNC
    })

    if (this.boundService?.subscribeUserStatus) {
      try {
        const parsedResult = parseSubscribeResult(
          await withTimeout(
            this.boundService.subscribeUserStatus({
              accountIds,
              duration: USER_STATUS_SUBSCRIBE_DURATION,
              immediateSync: USER_STATUS_SUBSCRIBE_IMMEDIATE_SYNC
            }),
            USER_STATUS_SUBSCRIBE_CALL_TIMEOUT_MS,
            'subscribeUserStatus'
          )
        )
        logUserStatusDebug('[user-status] subscribe call result', {
          seq,
          serviceType,
          failedCount: parsedResult.failedAccounts.length,
          statusCount: parsedResult.userStatusList.length
        })
        if (parsedResult.failedAccounts.length) {
          console.warn('[user-status] subscribe call failed accounts', {
            seq,
            serviceType,
            failedCount: parsedResult.failedAccounts.length,
            sampleAccounts: parsedResult.failedAccounts.slice(0, 5)
          })
        }
        return parsedResult
      } catch (error) {
        const payload = {
          seq,
          serviceType,
          accountCount: accountIds.length,
          code: getErrorCode(error),
          message: getErrorMessage(error)
        }

        if (isSubscriptionIllegalStateError(error)) {
          logUserStatusDebug('[user-status] subscribe call paused', payload)
        } else {
          console.warn('[user-status] subscribe call error', {
            ...payload,
            error
          })
        }
        throw error
      }
    }

    try {
      const result = await withTimeout(
        this.boundPushEventSource?.event?.subscribeEvent?.({
          type: 1,
          accounts: accountIds,
          subscribeTime: USER_STATUS_SUBSCRIBE_DURATION,
          sync: USER_STATUS_SUBSCRIBE_IMMEDIATE_SYNC
        }),
        USER_STATUS_SUBSCRIBE_CALL_TIMEOUT_MS,
        'subscribeEvent'
      )
      const parsedResult = parseSubscribeResult(result)
      logUserStatusDebug('[user-status] subscribe call result', {
        seq,
        serviceType,
        failedCount: parsedResult.failedAccounts.length,
        statusCount: parsedResult.userStatusList.length
      })
      if (parsedResult.failedAccounts.length) {
        console.warn('[user-status] subscribe call failed accounts', {
          seq,
          serviceType,
          failedCount: parsedResult.failedAccounts.length,
          sampleAccounts: parsedResult.failedAccounts.slice(0, 5)
        })
      }
      return parsedResult
    } catch (error) {
      const payload = {
        seq,
        serviceType,
        accountCount: accountIds.length,
        code: getErrorCode(error),
        message: getErrorMessage(error)
      }

      if (isSubscriptionIllegalStateError(error)) {
        logUserStatusDebug('[user-status] subscribe call paused', payload)
      } else {
        console.warn('[user-status] subscribe call error', {
          ...payload,
          error
        })
      }
      throw error
    }
  }

  private scheduleUnsubscribe(accountId: string) {
    if (!accountId || this.unsubscribeTimerByAccount.has(accountId)) {
      return
    }

    const timer = setTimeout(() => {
      this.unsubscribeTimerByAccount.delete(accountId)

      if (this.desiredAccounts.has(accountId) || !this.subscribedAccounts.has(accountId)) {
        return
      }

      this.unsubscribeChunk([accountId]).catch((error: unknown) => {
        console.warn('[user-status] delayed unsubscribe failed', {
          accountId,
          error
        })
      })
    }, USER_STATUS_UNSUBSCRIBE_DELAY_MS)

    this.unsubscribeTimerByAccount.set(accountId, timer)
  }

  private async unsubscribeChunk(accountIds: string[]) {
    if (!accountIds.length) {
      return
    }

    try {
      if (this.boundService?.unsubscribeUserStatus) {
        const result = await this.boundService.unsubscribeUserStatus({ accountIds })

        runInAction(() => {
          accountIds.forEach((accountId) => this.subscribedAccounts.delete(accountId))
        })

        logUserStatusDebug('[user-status] delayed unsubscribe result', {
          requested: accountIds.length,
          failedCount: parseSubscribeResult(result).failedAccounts.length
        })
        return
      }

      if (this.boundPushEventSource?.event?.unSubscribeEvents) {
        const result = await this.boundPushEventSource.event.unSubscribeEvents({
          type: 1,
          accounts: accountIds
        })

        runInAction(() => {
          accountIds.forEach((accountId) => this.subscribedAccounts.delete(accountId))
        })

        logUserStatusDebug('[user-status] legacy delayed unsubscribe result', {
          requested: accountIds.length,
          failedCount: parseSubscribeResult(result).failedAccounts.length
        })
      }
    } catch (error) {
      console.warn('[user-status] delayed unsubscribe failed', {
        requested: accountIds.length,
        error
      })
    }
  }

  private handleUserStatusChanged(
    userStatusList: UIKitUserStatus[],
    options?: { authoritativeOffline?: boolean }
  ) {
    const acceptedStatuses: UIKitUserStatus[] = []

    runInAction(() => {
      userStatusList.forEach((userStatus) => {
        if (userStatus.accountId) {
          this.clearForceResyncTimer(userStatus.accountId)
          this.forceResyncAttemptsByAccount.delete(userStatus.accountId)
          const mergeResult = this.mergeUserStatus(userStatus, options)

          if (mergeResult === 'ignored-conflicting-offline') {
            this.scheduleConflictingOfflineResync(userStatus.accountId)
            return
          }

          if (mergeResult === 'accepted') {
            acceptedStatuses.push(userStatus)
            this.accountStatusGeneration.set(
              userStatus.accountId,
              (this.accountStatusGeneration.get(userStatus.accountId) || 0) + 1
            )
          }
        }
      })
      if (acceptedStatuses.length) {
        this.version += 1
      }
    })

    if (acceptedStatuses.length) {
      logUserStatusDebug('[user-status] status changed', {
        count: userStatusList.length,
        acceptedCount: acceptedStatuses.length
      })
    }
  }

  private handlePushEvents(events: UIKitPushEvent[]) {
    const onlineStatusEvents: UIKitUserStatus[] = []

    events.forEach((event) => {
      const eventType = Number(event.type)
      const statusType = Number(event.value)
      const accountId = event.account || event.accountId

      if (!accountId || eventType !== 1 || !Number.isFinite(statusType)) {
        return
      }

      onlineStatusEvents.push({
        accountId,
        statusType,
        clientType: parseClientType(event.clientType),
        publishTime: typeof event.time === 'undefined' ? undefined : Number(event.time),
        extension: event.ext,
        serverConfig: event.serverConfig,
        serverExtension: event.serverExtension || event.serverExt
      })
    })

    if (!onlineStatusEvents.length) {
      return
    }

    this.handleUserStatusChanged(onlineStatusEvents)
  }

  private mergeUserStatus(
    userStatus: UIKitUserStatus,
    options?: { authoritativeOffline?: boolean }
  ) {
    if (!userStatus.accountId) {
      return 'ignored'
    }

    const onlineClientTypes = parseOnlineClientTypesFromServerConfig(
      userStatus.serverConfig || userStatus.serverExtension || userStatus.extension
    )

    if (onlineClientTypes && userStatus.statusType === ONLINE_STATUS_TYPE) {
      const nextStatusesByTerminal = new Map<string, UIKitUserStatus>()

      onlineClientTypes.forEach((clientType) => {
        const onlineStatus = {
          ...userStatus,
          clientType,
          statusType: ONLINE_STATUS_TYPE
        }

        nextStatusesByTerminal.set(buildUserStatusKey(onlineStatus), onlineStatus)
      })

      if (!onlineClientTypes.length) {
        nextStatusesByTerminal.set(buildUserStatusKey(userStatus), userStatus)
      }

      this.stateMap.set(userStatus.accountId, nextStatusesByTerminal)
      return 'accepted'
    }

    const statusKey = buildUserStatusKey(userStatus)
    const nextStatusesByTerminal =
      this.stateMap.get(userStatus.accountId) || new Map<string, UIKitUserStatus>()
    const hasKnownClientType = typeof parseClientType(userStatus.clientType) === 'number'

    if (onlineClientTypes) {
      nextStatusesByTerminal.clear()

      const offlineClientType = parseClientType(userStatus.clientType)
      const remainingOnlineClientTypes = onlineClientTypes.filter(
        (clientType) => clientType !== offlineClientType
      )

      remainingOnlineClientTypes.forEach((clientType) => {
        const onlineStatus = {
          ...userStatus,
          clientType,
          statusType: ONLINE_STATUS_TYPE
        }

        nextStatusesByTerminal.set(buildUserStatusKey(onlineStatus), onlineStatus)
      })

      if (!remainingOnlineClientTypes.length) {
        nextStatusesByTerminal.set(statusKey, userStatus)
      }

      this.stateMap.set(userStatus.accountId, nextStatusesByTerminal)
      return 'accepted'
    }

    if (
      userStatus.statusType !== ONLINE_STATUS_TYPE &&
      !hasKnownClientType &&
      Array.from(nextStatusesByTerminal.values()).some(
        (status) => status.statusType === ONLINE_STATUS_TYPE
      ) &&
      !options?.authoritativeOffline
    ) {
      return 'ignored-conflicting-offline'
    }

    nextStatusesByTerminal.set(statusKey, userStatus)

    if (userStatus.statusType !== ONLINE_STATUS_TYPE) {
      const hasAnyOnlineStatus = Array.from(nextStatusesByTerminal.values()).some(
        (status) => status.statusType === ONLINE_STATUS_TYPE
      )

      if (!hasAnyOnlineStatus) {
        const latestOfflineStatus = Array.from(nextStatusesByTerminal.values()).sort(
          compareUserStatusesByPublishTimeDesc
        )[0]

        nextStatusesByTerminal.clear()
        nextStatusesByTerminal.set(statusKey, latestOfflineStatus)
      }
    }

    this.stateMap.set(userStatus.accountId, nextStatusesByTerminal)
    return 'accepted'
  }

  private isAccountOnline(accountId: string) {
    return this.getUserStatus(accountId)?.statusType === ONLINE_STATUS_TYPE
  }

  private expireUnconfirmedOnlineStatuses(
    accountIds: string[],
    statusGenerationBefore: Map<string, number>
  ) {
    const expiredAccounts: string[] = []

    runInAction(() => {
      accountIds.forEach((accountId) => {
        if (!this.subscribedAccounts.has(accountId) || !this.isAccountOnline(accountId)) {
          return
        }

        const previousGeneration = statusGenerationBefore.get(accountId) || 0
        const currentGeneration = this.accountStatusGeneration.get(accountId) || 0

        if (currentGeneration !== previousGeneration) {
          return
        }

        this.stateMap.delete(accountId)
        this.accountStatusGeneration.set(accountId, currentGeneration + 1)
        expiredAccounts.push(accountId)
      })

      if (expiredAccounts.length) {
        this.version += 1
      }
    })

    if (expiredAccounts.length) {
      logUserStatusDebug('[user-status] expired unconfirmed online status', {
        accountIds: expiredAccounts
      })
    }
  }

  private scheduleUnknownStatusForceResync(accountIds: string[]) {
    if (!this.boundService?.getUserStatus) {
      return
    }

    const unknownAccountIds = normalizeAccounts(accountIds).filter((accountId) => {
      return this.subscribedAccounts.has(accountId) && !this.stateMap.has(accountId)
    })

    unknownAccountIds.forEach((accountId) => {
      if (this.forceResyncTimerByAccount.has(accountId)) {
        return
      }

      const attempt = (this.forceResyncAttemptsByAccount.get(accountId) || 0) + 1

      if (attempt > USER_STATUS_FORCE_RESYNC_MAX_ATTEMPTS) {
        return
      }

      this.forceResyncAttemptsByAccount.set(accountId, attempt)

      const timer = setTimeout(() => {
        this.forceResyncTimerByAccount.delete(accountId)

        if (!this.subscribedAccounts.has(accountId) || this.stateMap.has(accountId)) {
          return
        }

        this.forceResyncUnknownAccount(accountId).catch((error: unknown) => {
          console.warn('[user-status] force resync unknown account failed', {
            accountId,
            error
          })
        })
      }, getForceResyncDelay(attempt))

      this.forceResyncTimerByAccount.set(accountId, timer)
    })
  }

  private async forceResyncUnknownAccount(accountId: string) {
    if (
      !this.subscribedAccounts.has(accountId) ||
      this.stateMap.has(accountId) ||
      this.isRateLimited()
    ) {
      return
    }

    const subscribeResult = await this.subscribeChunk([accountId])

    if (subscribeResult.userStatusList.length) {
      this.handleUserStatusChanged(subscribeResult.userStatusList)
    }

    await this.syncCurrentStatuses([accountId])

    logUserStatusDebug('[user-status] force resync unknown account', {
      accountId,
      failedAccounts: subscribeResult.failedAccounts,
      immediateStatusCount: subscribeResult.userStatusList.length,
      hasStatus: this.stateMap.has(accountId)
    })

    if (!this.stateMap.has(accountId)) {
      this.scheduleUnknownStatusForceResync([accountId])
    }
  }

  private scheduleConflictingOfflineResync(accountId: string) {
    if (!accountId || this.conflictingOfflineResyncAccounts.has(accountId)) {
      return
    }

    this.conflictingOfflineResyncAccounts.add(accountId)

    setTimeout(() => {
      this.resyncConflictingOfflineAccount(accountId).catch((error: unknown) => {
        console.warn('[user-status] conflicting offline resync failed', {
          accountId,
          error
        })
      })
    }, 0)
  }

  private async resyncConflictingOfflineAccount(accountId: string) {
    try {
      if (
        !this.subscribedAccounts.has(accountId) ||
        this.isRateLimited() ||
        !this.boundService?.getUserStatus
      ) {
        return
      }

      const statusGenerationBefore = new Map([
        [accountId, this.accountStatusGeneration.get(accountId) || 0]
      ])

      const subscribeResult = await this.subscribeChunk([accountId])

      if (subscribeResult.userStatusList.length) {
        this.handleUserStatusChanged(subscribeResult.userStatusList, {
          authoritativeOffline: true
        })
      }

      await this.syncCurrentStatuses([accountId])
      this.expireUnconfirmedOnlineStatuses([accountId], statusGenerationBefore)

      logUserStatusDebug('[user-status] conflicting offline resync done', {
        accountId,
        failedAccounts: subscribeResult.failedAccounts,
        immediateStatusCount: subscribeResult.userStatusList.length,
        hasStatus: this.stateMap.has(accountId)
      })
    } finally {
      this.conflictingOfflineResyncAccounts.delete(accountId)
    }
  }

  private clearForceResyncTimer(accountId: string) {
    const timer = this.forceResyncTimerByAccount.get(accountId)

    if (!timer) {
      return
    }

    clearTimeout(timer)
    this.forceResyncTimerByAccount.delete(accountId)
  }

  private clearForceResyncTimers() {
    this.forceResyncTimerByAccount.forEach((timer) => clearTimeout(timer))
    this.forceResyncTimerByAccount.clear()
  }

  private clearSubscribeTimer() {
    if (!this.subscribeTimer) {
      return
    }

    clearTimeout(this.subscribeTimer)
    this.subscribeTimer = null
  }

  private clearRateLimitRetryTimer() {
    if (!this.rateLimitRetryTimer) {
      return
    }

    clearTimeout(this.rateLimitRetryTimer)
    this.rateLimitRetryTimer = null
  }

  private clearUnsubscribeTimer(accountId: string) {
    const timer = this.unsubscribeTimerByAccount.get(accountId)

    if (!timer) {
      return
    }

    clearTimeout(timer)
    this.unsubscribeTimerByAccount.delete(accountId)
  }

  private clearUnsubscribeTimers() {
    this.unsubscribeTimerByAccount.forEach((timer) => clearTimeout(timer))
    this.unsubscribeTimerByAccount.clear()
  }

  private isRateLimited() {
    return Date.now() < this.rateLimitedUntil
  }

  private isSubscriptionReady() {
    return !!this.boundPushEventSource && nimStore.isLoggedIn() && nimStore.isConnected()
  }

  private scheduleDisconnectedRetry() {
    this.scheduleSubscribeFlush(USER_STATUS_DISCONNECTED_RETRY_MS)
  }

  private enterRateLimitCooldown(error: unknown) {
    this.rateLimitedUntil = Date.now() + USER_STATUS_RATE_LIMIT_COOLDOWN_MS
    console.warn('[user-status] subscribe rate limited, cooldown started', {
      cooldownMs: USER_STATUS_RATE_LIMIT_COOLDOWN_MS,
      code: getErrorCode(error)
    })
  }

  private scheduleRateLimitRetry() {
    this.clearRateLimitRetryTimer()

    const delay = Math.max(this.rateLimitedUntil - Date.now(), USER_STATUS_SUBSCRIBE_DEBOUNCE_MS)

    this.rateLimitRetryTimer = setTimeout(() => {
      this.rateLimitRetryTimer = null
      this.scheduleSubscribeFlush(0)
    }, delay)
  }
}

const userStatusStore = new UIKitUserStatusStore()
let nextUserStatusSubscriptionScopeId = 0

function getUsableSubscriptionService(service: UIKitSubscriptionService | null | undefined) {
  if (
    service &&
    (typeof service.getUserStatus === 'function' ||
      (typeof service.on === 'function' &&
        typeof service.off === 'function' &&
        typeof service.subscribeUserStatus === 'function'))
  ) {
    return service
  }

  return null
}

function isNativeUserStatusSubscribeEnabled() {
  return Platform.OS !== 'android' || USER_STATUS_ANDROID_NATIVE_SUBSCRIBE_ENABLED
}

function normalizeAccounts(accountIds: string[]) {
  return Array.from(new Set(accountIds.map((accountId) => accountId.trim()).filter(Boolean)))
}

function areSameAccounts(left: string[], right: string[]) {
  if (left.length !== right.length) {
    return false
  }

  return left.every((accountId, index) => accountId === right[index])
}

function capDesiredAccounts(accountIds: Set<string>) {
  if (accountIds.size <= USER_STATUS_MAX_DESIRED_ACCOUNT_COUNT) {
    return accountIds
  }

  const cappedAccounts = new Set(
    Array.from(accountIds).slice(0, USER_STATUS_MAX_DESIRED_ACCOUNT_COUNT)
  )
  console.warn('[user-status] desired accounts capped', {
    desiredCount: accountIds.size,
    cappedCount: cappedAccounts.size
  })

  return cappedAccounts
}

function buildUserStatusKey(userStatus: UIKitUserStatus) {
  const accountId = userStatus.accountId || ''
  const clientType = parseClientType(userStatus.clientType) ?? -1

  return `${accountId}:${clientType}`
}

function compareUserStatusesByPublishTimeDesc(left: UIKitUserStatus, right: UIKitUserStatus) {
  return (right.publishTime || 0) - (left.publishTime || 0)
}

function getForceResyncDelay(attempt: number) {
  return attempt <= 1
    ? USER_STATUS_FORCE_RESYNC_INITIAL_DELAY_MS
    : USER_STATUS_FORCE_RESYNC_RETRY_DELAY_MS
}

function isUIKitUserStatus(value: unknown): value is UIKitUserStatus {
  if (!value || typeof value !== 'object') {
    return false
  }

  const status = value as UIKitUserStatus

  return !!status.accountId && typeof status.statusType === 'number'
}

function normalizeUserStatuses(value: unknown): UIKitUserStatus[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter(isUIKitUserStatus)
}

function parseFailedAccounts(value: unknown) {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((item) => {
      if (typeof item === 'string') {
        return item
      }

      if (!item || typeof item !== 'object') {
        return ''
      }

      const failedItem = item as {
        accountId?: unknown
        account?: unknown
        accid?: unknown
        to?: unknown
      }
      const accountId =
        failedItem.accountId || failedItem.account || failedItem.accid || failedItem.to || ''

      return typeof accountId === 'string' ? accountId : ''
    })
    .filter(Boolean)
}

function parseSubscribeResult(result: UIKitSubscribeResult) {
  if (Array.isArray(result)) {
    const userStatusList = normalizeUserStatuses(result)

    return {
      failedAccounts: userStatusList.length ? [] : parseFailedAccounts(result),
      userStatusList,
      rateLimited: containsRateLimitError(result),
      rateLimitError: findRateLimitError(result)
    }
  }

  if (!result || typeof result !== 'object') {
    return {
      failedAccounts: [],
      userStatusList: [],
      rateLimited: false,
      rateLimitError: undefined
    }
  }

  const objectResult = result as UIKitSubscribeResultObject
  const data = objectResult.data
  const nestedData = data && !Array.isArray(data) ? data : undefined

  return {
    failedAccounts: parseFailedAccounts(
      objectResult.failedAccounts || objectResult.failedAccountIds
    ),
    rateLimited: containsRateLimitError([
      objectResult,
      objectResult.failedAccounts,
      objectResult.failedAccountIds
    ]),
    rateLimitError: findRateLimitError([
      objectResult,
      objectResult.failedAccounts,
      objectResult.failedAccountIds
    ]),
    userStatusList: [
      ...normalizeUserStatuses(objectResult.userStatusList),
      ...normalizeUserStatuses(objectResult.statuses),
      ...normalizeUserStatuses(Array.isArray(data) ? data : undefined),
      ...normalizeUserStatuses(nestedData?.userStatusList),
      ...normalizeUserStatuses(nestedData?.statuses)
    ]
  }
}

function logUserStatusDebug(message: string, payload?: unknown) {
  if (!USER_STATUS_DEBUG_LOG_ENABLED) {
    return
  }

  if (typeof payload === 'undefined') {
    console.log(message)
    return
  }

  console.log(message, payload)
}

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })
}

function withTimeout<T>(promise: Promise<T> | undefined, timeoutMs: number, label: string) {
  if (!promise) {
    return Promise.resolve(undefined as T)
  }

  let timer: ReturnType<typeof setTimeout> | null = null

  const timeoutPromise = new Promise<T>((_, reject) => {
    timer = setTimeout(() => {
      const error = new Error(`${label} timeout after ${timeoutMs}ms`)
      ;(error as Error & { code?: string }).code = 'TIMEOUT'
      reject(error)
    }, timeoutMs)
  })

  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timer) {
      clearTimeout(timer)
    }
  })
}

function getErrorCode(error: unknown) {
  if (!error || typeof error !== 'object') {
    return undefined
  }

  const candidate = error as { code?: unknown; errCode?: unknown; errorCode?: unknown }

  return candidate.code ?? candidate.errCode ?? candidate.errorCode
}

function getErrorMessage(error: unknown) {
  if (!error || typeof error !== 'object') {
    return typeof error === 'string' ? error : ''
  }

  const candidate = error as { message?: unknown; detail?: unknown }
  const message = candidate.message || candidate.detail || ''

  return typeof message === 'string' ? message : ''
}

function isRateLimitError(error: unknown) {
  return String(getErrorCode(error) || '').trim() === '416'
}

function isSubscriptionIllegalStateError(error: unknown) {
  const message = getErrorMessage(error).toLowerCase()
  const code = String(getErrorCode(error) || '')
    .trim()
    .toLowerCase()

  return code === 'illegal state' || message.includes('illegal state')
}

function isSubscriptionTimeoutError(error: unknown) {
  return (
    String(getErrorCode(error) || '')
      .trim()
      .toUpperCase() === 'TIMEOUT'
  )
}

function containsRateLimitError(value: unknown, depth = 0): boolean {
  return !!findRateLimitError(value, depth)
}

function findRateLimitError(value: unknown, depth = 0): unknown {
  if (!value || depth > 3) {
    return undefined
  }

  if (isRateLimitError(value)) {
    return value
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findRateLimitError(item, depth + 1)

      if (found) {
        return found
      }
    }

    return undefined
  }

  if (typeof value !== 'object') {
    return undefined
  }

  const objectValue = value as Record<string, unknown>

  for (const key of [
    'error',
    'err',
    'cause',
    'data',
    'detail',
    'failedAccounts',
    'failedAccountIds'
  ]) {
    const found = findRateLimitError(objectValue[key], depth + 1)

    if (found) {
      return found
    }
  }

  return undefined
}

const CLIENT_TYPE_NAME_MAP: Record<string, number> = {
  android: 1,
  v2nim_login_client_type_android: 1,
  ios: 2,
  v2nim_login_client_type_ios: 2,
  pc: 4,
  v2nim_login_client_type_pc: 4,
  windowsphone: 8,
  wp: 8,
  v2nim_login_client_type_wp: 8,
  web: 16,
  v2nim_login_client_type_web: 16,
  server: 32,
  restful: 32,
  v2nim_login_client_type_restful: 32,
  mac: 64,
  macos: 64,
  mac_os: 64,
  v2nim_login_client_type_mac_os: 64,
  harmonyos: 65,
  harmony_os: 65,
  v2nim_login_client_type_harmony_os: 65
}

function parseClientType(value: unknown) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined
  }

  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10)

    if (Number.isFinite(parsed)) {
      return parsed
    }

    const normalized = value.trim().replace(/[\s-]/g, '_').toLowerCase()

    return CLIENT_TYPE_NAME_MAP[normalized]
  }

  if (value && typeof value === 'object') {
    const objectValue = value as { value?: unknown; rawValue?: unknown }
    return parseClientType(objectValue.value ?? objectValue.rawValue)
  }

  return undefined
}

function parseOnlineClientTypesFromServerConfig(serverConfig?: unknown) {
  if (!serverConfig) {
    return undefined
  }

  try {
    const parsed =
      typeof serverConfig === 'string'
        ? (JSON.parse(serverConfig) as { online?: unknown })
        : (serverConfig as { online?: unknown })

    if (!Array.isArray(parsed.online)) {
      return undefined
    }

    return parsed.online
      .map((item) => parseClientType(item))
      .filter((item): item is number => typeof item === 'number')
  } catch (error) {
    console.warn('[user-status] parse serverConfig failed', { serverConfig, error })
    return undefined
  }
}

export function bindUIKitUserStatusNIM(nim: V2NIM | null | undefined) {
  userStatusStore.bind(
    nim?.V2NIMSubscriptionService as UIKitSubscriptionService,
    nim as UIKitPushEventSource
  )
}

export function resetUIKitUserStatusState() {
  userStatusStore.resetState()
}

export function useUIKitUserStatusSubscription(accountIds: string[]) {
  const scopeIdRef = useRef<string>('')
  const normalizedKey = normalizeAccounts(accountIds).join(',')
  const isConnected = nimStore.connectStatus === 1

  if (!scopeIdRef.current) {
    nextUserStatusSubscriptionScopeId += 1
    scopeIdRef.current = `scope-${nextUserStatusSubscriptionScopeId}`
  }

  useEffect(() => {
    const normalizedAccounts = normalizedKey ? normalizedKey.split(',') : []
    const scopeId = scopeIdRef.current

    if (!scopeId) {
      return
    }

    if (!isConnected) {
      userStatusStore.clearSubscriptionScope(scopeId)
      return
    }

    bindUIKitUserStatusNIM(nimStore.nim)
    if (normalizedAccounts.length) {
      userStatusStore.setSubscriptionScope(scopeId, normalizedAccounts)
    } else {
      userStatusStore.clearSubscriptionScope(scopeId)
    }

    return () => {
      userStatusStore.clearSubscriptionScope(scopeId)
    }
  }, [isConnected, normalizedKey])

  return userStatusStore.version
}

export function setUIKitUserStatusSubscriptionScope(scopeId: string, accountIds: string[]) {
  if (!scopeId) {
    return
  }

  if (nimStore.connectStatus !== 1) {
    userStatusStore.clearSubscriptionScope(scopeId)
    return
  }

  bindUIKitUserStatusNIM(nimStore.nim)
  const normalizedAccounts = normalizeAccounts(accountIds)

  if (normalizedAccounts.length) {
    userStatusStore.setSubscriptionScope(scopeId, normalizedAccounts)
  } else {
    userStatusStore.clearSubscriptionScope(scopeId)
  }
}

export function clearUIKitUserStatusSubscriptionScope(scopeId: string) {
  if (!scopeId) {
    return
  }

  userStatusStore.clearSubscriptionScope(scopeId)
}

export function ensureUIKitUserStatusSubscribed(accountIds: string[] | string) {
  const normalizedAccounts = Array.isArray(accountIds) ? accountIds : [accountIds]

  return userStatusStore.ensureAccountsSubscribed(normalizedAccounts)
}

export function getUIKitUserStatus(accountId: string): UIKitUserStatus | undefined {
  return userStatusStore.getUserStatus(accountId)
}

export function getUIKitUserStatusVersion() {
  return userStatusStore.version
}

export function isUIKitUserOnline(accountId: string) {
  return getUIKitUserStatus(accountId)?.statusType === ONLINE_STATUS_TYPE
}

export function getUIKitOnlineStatusText(accountId: string) {
  const userStatus = getUIKitUserStatus(accountId)

  return userStatus?.statusType === ONLINE_STATUS_TYPE
    ? translateCurrentApp('commonOnline')
    : translateCurrentApp('commonOffline')
}
