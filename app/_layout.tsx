import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { router, Stack, useGlobalSearchParams, usePathname } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import * as SystemUI from 'expo-system-ui'
import { observer } from 'mobx-react-lite'
import { useEffect, useRef } from 'react'
import { ActivityIndicator, AppState, Platform, StyleSheet, View } from 'react-native'

import { useColorScheme } from '@/hooks/useColorScheme'
import { setLanguage as setUIKitLanguage } from '@/src/NEUIKit/common/utils/i18n'
import { NativeToastHost } from '@/src/NEUIKit/common/utils/native-toast-host'
import { ensureUIKitUserProfiles, UIKitHeaderBackButton } from '@/src/NEUIKit/rn'
import {
  bindUIKitUserStatusNIM,
  ensureUIKitUserStatusSubscribed,
  resetUIKitUserStatusState
} from '@/src/NEUIKit/rn/user-status'
import {
  authStore,
  conversationStore,
  friendStore,
  imStoreV2Bridge,
  messageStore,
  nimStore,
  preferenceStore,
  teamStore,
  userStore
} from '@/stores'
import { getSystemLanguage, setActiveAppLanguage } from '@/utils/app-language'
import { isNativeCameraCaptureActive } from '@/utils/native-capture-state'
import { installNativeOfflinePushPlugin } from '@/utils/native-offline-push-plugin'
import type { V2NIMKickedOfflineDetail } from '@/utils/nim-sdk'
import {
  V2NIMDataSyncState,
  V2NIMDataSyncType,
  V2NIMFriend,
  V2NIMLocalConversation,
  V2NIMMessage,
  V2NIMTeamMember
} from '@/utils/nim-sdk'
import {
  addNotificationResponseListener,
  clearPresentedNotifications,
  configureNotificationHandler,
  getLastNotificationResponse,
  syncNotificationChannel
} from '@/utils/notifications'
import { resolveConversationIdFromPushData } from '@/utils/offline-push'
import { getTeamNotificationAccountIds } from '@/utils/teamNotification'

export { ErrorBoundary } from 'expo-router'

export const unstable_settings = {
  initialRouteName: 'home'
}

SplashScreen.preventAutoHideAsync().catch(() => undefined)

installNativeOfflinePushPlugin()

const RECEIVE_MESSAGE_BATCH_DEBOUNCE_MS = 160
const RECEIVE_MESSAGE_BATCH_MAX_WAIT_MS = 500

function getAppUnreadTotal() {
  return imStoreV2Bridge.hasBoundStore
    ? imStoreV2Bridge.messageTabUnreadTotal
    : conversationStore.totalUnread
}

const initialAppLanguage = preferenceStore.resolveLanguage(getSystemLanguage())
setUIKitLanguage(initialAppLanguage)
setActiveAppLanguage(initialAppLanguage)

const RootLayout = observer(() => {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf')
  })

  const pathname = usePathname()
  const globalSearchParams = useGlobalSearchParams<{
    conversationId?: string
    sessionId?: string
    sessionType?: string
  }>()
  const pendingConversationId = authStore.pendingConversationId
  const hasValidatedSession = authStore.hasValidatedSession
  const isAuthenticated = authStore.isAuthenticated
  const totalUnread = getAppUnreadTotal()
  const isAuthReady = authStore.isReady
  const isPreferenceReady = preferenceStore.isReady
  const { nim, isInitialized } = nimStore
  const cloudConversationEnabled = nimStore.cloudConversationEnabled
  const hasBoundImStore = imStoreV2Bridge.hasBoundStore
  const cloudDisplayTotalUnread = imStoreV2Bridge.displayTotalUnread
  const cloudHasMoreConversations = imStoreV2Bridge.hasMoreConversations
  const cloudTotalUnread = imStoreV2Bridge.totalUnread
  const systemColorScheme = useColorScheme()
  const resolvedColorScheme = preferenceStore.resolveColorScheme(systemColorScheme)
  const notificationsEnabled = preferenceStore.preferences.notificationsEnabled
  const soundEnabled = preferenceStore.preferences.soundEnabled
  const vibrationEnabled = preferenceStore.preferences.vibrationEnabled
  const resolvedLanguage = preferenceStore.resolveLanguage(getSystemLanguage())
  const friendRefreshRetryTimersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const loginRefreshTriggeredRef = useRef(false)
  const pinRefreshInFlightRef = useRef(false)
  const pendingReceivedMessagesRef = useRef<V2NIMMessage[]>([])
  const receiveMessageFlushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const receiveMessageMaxWaitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  useEffect(() => {
    if (!loaded || !isAuthReady || !isPreferenceReady) {
      return
    }

    SplashScreen.hideAsync().catch(() => undefined)
  }, [isAuthReady, isPreferenceReady, loaded])

  useEffect(() => {
    if (!loaded || !isAuthReady || !isPreferenceReady) {
      return
    }

    if (isAuthenticated) {
      if (pathname === '/login' || pathname === '/home') {
        router.replace('/' as never)
      }
      return
    }

    if (pathname !== '/home' && pathname !== '/login') {
      router.replace('/home' as never)
    }
  }, [isAuthenticated, isAuthReady, isPreferenceReady, loaded, pathname])

  useEffect(() => {
    if (!isAuthReady || !hasValidatedSession || !pendingConversationId) {
      return
    }

    router.push({
      pathname: '/chat/[id]',
      params: { id: pendingConversationId }
    })
    authStore.setPendingConversationId(null)
  }, [hasValidatedSession, isAuthReady, pendingConversationId])

  useEffect(() => {
    const canHandlePushNavigation =
      pathname === '/' || pathname === '/home' || pathname === '/login' || pathname === '/(tabs)'

    if (!canHandlePushNavigation) {
      return
    }

    const conversationId = resolveConversationIdFromPushData(
      {
        conversationId: globalSearchParams.conversationId,
        sessionId: globalSearchParams.sessionId,
        sessionType: globalSearchParams.sessionType
      },
      nim
    )

    if (!conversationId) {
      return
    }

    if (hasValidatedSession) {
      router.push({ pathname: '/chat/[id]', params: { id: conversationId } })
    } else {
      authStore.setPendingConversationId(conversationId)
    }
  }, [
    hasValidatedSession,
    globalSearchParams.conversationId,
    globalSearchParams.sessionId,
    globalSearchParams.sessionType,
    nim,
    pathname
  ])

  useEffect(() => {
    const backgroundColor = resolvedColorScheme === 'dark' ? '#0F1115' : '#F7F7F8'
    SystemUI.setBackgroundColorAsync(backgroundColor).catch(() => undefined)
  }, [resolvedColorScheme])

  useEffect(() => {
    setUIKitLanguage(resolvedLanguage)
    setActiveAppLanguage(resolvedLanguage)
  }, [resolvedLanguage])

  useEffect(() => {
    if (!isPreferenceReady || preferenceStore.notificationPermissionStatus !== 'undetermined') {
      return
    }

    preferenceStore.requestNotificationPermission().catch(() => undefined)
  }, [isPreferenceReady])

  useEffect(() => {
    if (!nim || !isInitialized) {
      imStoreV2Bridge.destroy()
      return
    }

    const boundNIM = imStoreV2Bridge.bindNIM(
      nim,
      {
        conversationLimit: 20
      },
      cloudConversationEnabled
    )
    bindUIKitUserStatusNIM(boundNIM ? nim : null)
  }, [cloudConversationEnabled, hasBoundImStore, isInitialized, nim])

  useEffect(() => {
    if (!isInitialized || !cloudConversationEnabled || !imStoreV2Bridge.hasBoundStore) {
      return
    }

    imStoreV2Bridge.reconcileCloudUnreadState().catch(() => undefined)
  }, [
    cloudConversationEnabled,
    cloudDisplayTotalUnread,
    cloudHasMoreConversations,
    cloudTotalUnread,
    hasBoundImStore,
    isInitialized
  ])

  useEffect(() => {
    if (isAuthenticated) {
      return
    }

    resetUIKitUserStatusState()
  }, [isAuthenticated])

  useEffect(() => {
    if (!nim || !isInitialized) {
      return
    }

    const getExpectedSessionAccount = () => authStore.session?.account || nimStore.loginAccount

    const isBoundToActiveSession = () => {
      const sessionAccount = getExpectedSessionAccount()

      if (!sessionAccount) {
        return false
      }

      const nimAccount = nimStore.getLoginUser()

      return nimAccount === sessionAccount
    }

    const isLoggedIn = () => {
      try {
        return nim.V2NIMLoginService.getLoginStatus() === 1
      } catch {
        return false
      }
    }

    const refreshAppState = async () => {
      if (!isLoggedIn() || !isBoundToActiveSession()) {
        return
      }

      await Promise.allSettled([
        imStoreV2Bridge.refreshCurrentConversationSource(),
        friendStore.refreshAll(),
        teamStore.refreshJoinedTeams(),
        userStore.refreshSelfProfile()
      ])
    }

    const refreshPinnedState = async () => {
      if (!isLoggedIn() || !isBoundToActiveSession() || pinRefreshInFlightRef.current) {
        return
      }

      const trackedConversationIds = messageStore.getTrackedPinnedConversationIds()
      const targetConversationIds = Array.from(
        new Set([messageStore.activeConversationId, ...trackedConversationIds].filter(Boolean))
      )

      if (targetConversationIds.length === 0) {
        return
      }

      pinRefreshInFlightRef.current = true
      try {
        await messageStore.refreshPinnedMessages(targetConversationIds)
      } finally {
        pinRefreshInFlightRef.current = false
      }
    }

    const flushReceivedMessages = async () => {
      if (receiveMessageFlushTimerRef.current) {
        clearTimeout(receiveMessageFlushTimerRef.current)
        receiveMessageFlushTimerRef.current = null
      }
      if (receiveMessageMaxWaitTimerRef.current) {
        clearTimeout(receiveMessageMaxWaitTimerRef.current)
        receiveMessageMaxWaitTimerRef.current = null
      }

      if (!isBoundToActiveSession()) {
        pendingReceivedMessagesRef.current = []
        return
      }

      const messages = pendingReceivedMessagesRef.current
      pendingReceivedMessagesRef.current = []

      if (messages.length === 0) {
        return
      }

      const notificationAccountIds = messages.flatMap((message) =>
        getTeamNotificationAccountIds(message)
      )
      if (notificationAccountIds.length > 0) {
        ensureUIKitUserProfiles(notificationAccountIds).catch(() => [])
      }

      const activeConversationId = messageStore.activeConversationId
      conversationStore.restoreConversationsForReceivedMessages(messages)
      messageStore.addMessages(messages)
      conversationStore.handleConversationWithMentions(messages, activeConversationId)
      if (activeConversationId) {
        messageStore
          .sendReadReceiptsForReceivedMessages(activeConversationId, messages)
          .catch(() => undefined)
      }
      if (imStoreV2Bridge.hasBoundStore) {
        imStoreV2Bridge.refreshCurrentConversationSource().catch(() => undefined)
      }
    }

    const scheduleReceivedMessagesFlush = () => {
      if (receiveMessageFlushTimerRef.current) {
        clearTimeout(receiveMessageFlushTimerRef.current)
      }

      receiveMessageFlushTimerRef.current = setTimeout(
        flushReceivedMessages,
        RECEIVE_MESSAGE_BATCH_DEBOUNCE_MS
      )

      if (!receiveMessageMaxWaitTimerRef.current) {
        receiveMessageMaxWaitTimerRef.current = setTimeout(
          flushReceivedMessages,
          RECEIVE_MESSAGE_BATCH_MAX_WAIT_MS
        )
      }
    }

    const handleReceiveMessages = (messages: V2NIMMessage[]) => {
      if (!isBoundToActiveSession()) {
        return
      }

      pendingReceivedMessagesRef.current.push(...messages)
      scheduleReceivedMessagesFlush()
    }

    const handleReceiveMessagesModified = (messages: V2NIMMessage[]) => {
      if (!isBoundToActiveSession()) {
        return
      }

      messageStore.addMessages(messages)
    }

    const handleMessageDeletedNotifications = (
      notifications: {
        messageRefer: { conversationId: string; messageClientId?: string; messageServerId?: string }
      }[]
    ) => {
      if (!isBoundToActiveSession()) {
        return
      }

      messageStore.deleteMessagesLocally(
        notifications.map((notification) => notification.messageRefer)
      )
      conversationStore.removeMentionMessageRefs(
        notifications.map((notification) => notification.messageRefer)
      )
    }

    const handleMessageRevokeNotifications = (
      notifications: Parameters<typeof messageStore.applyRevokeNotifications>[0]
    ) => {
      if (!isBoundToActiveSession()) {
        return
      }

      messageStore.applyRevokeNotifications(notifications)
      conversationStore.removeMentionMessageRefs(
        notifications.map((notification) => notification.messageRefer)
      )
      conversationStore.refreshConversations()
    }

    const handleMessagePinNotification = (
      notification: Parameters<typeof messageStore.applyPinNotification>[0]
    ) => {
      if (!isBoundToActiveSession()) {
        return
      }

      messageStore.applyPinNotification(notification)
    }

    const handleConversationChanged = (conversations: V2NIMLocalConversation[]) => {
      if (!isBoundToActiveSession()) {
        return
      }

      conversations.forEach((conversation) => {
        conversationStore.updateConversation(conversation.conversationId, conversation)
      })
    }

    const handleLoginStatus = (status: number) => {
      if (!getExpectedSessionAccount()) {
        return
      }

      authStore.setLoginStatus(status)

      if (status === 1) {
        loginRefreshTriggeredRef.current = false
        refreshPinnedState().catch(() => undefined)
      }
    }

    const handleConnectStatus = (status: number) => {
      if (!isBoundToActiveSession()) {
        return
      }

      nimStore.setConnectStatus(status)

      if (status === 1) {
        refreshPinnedState().catch(() => undefined)
      }
    }

    const handleDataSync = (type: number, state: number) => {
      if (!isBoundToActiveSession()) {
        return
      }

      const mainSyncType = V2NIMDataSyncType?.V2NIM_DATA_SYNC_TYPE_MAIN ?? 1
      const completedState = V2NIMDataSyncState?.V2NIM_DATA_SYNC_STATE_COMPLETED ?? 3

      if (type !== mainSyncType || state !== completedState) {
        return
      }

      if (loginRefreshTriggeredRef.current) {
        return
      }

      loginRefreshTriggeredRef.current = true
      friendStore.markApplicationSyncPending()
      refreshAppState()
      scheduleFriendRefreshRetry()
    }

    const handleKickedOffline = (detail: V2NIMKickedOfflineDetail) => {
      if (!isBoundToActiveSession()) {
        return
      }

      authStore.handleKickedOffline(detail)
    }

    const refreshFriends = () => {
      if (!isBoundToActiveSession()) {
        return
      }

      friendStore.refreshAll().catch(() => undefined)
    }

    const ensureFriendConversationVisible = (accountId: string) => {
      const conversationId = accountId
        ? nim.V2NIMConversationIdUtil.p2pConversationId(accountId)
        : ''

      if (!conversationId) {
        return
      }

      conversationStore.createConversation(conversationId).catch((error) => {
        console.warn('[layout] ensure friend local conversation failed', {
          accountId,
          conversationId,
          error
        })
      })
      imStoreV2Bridge.ensureCloudConversation(conversationId).catch((error) => {
        console.warn('[layout] ensure friend cloud conversation failed', {
          accountId,
          conversationId,
          error
        })
      })
    }

    const handleFriendAdded = (friend: V2NIMFriend) => {
      if (!isBoundToActiveSession()) {
        return
      }

      imStoreV2Bridge.applyFriendAdded(friend)
      friendStore.applyFriendChanged(friend)
      ensureFriendConversationVisible(friend.accountId)
      ensureUIKitUserStatusSubscribed(friend.accountId).catch(() => undefined)
    }

    const handleFriendDeleted = (accountId: string) => {
      if (!isBoundToActiveSession()) {
        return
      }

      imStoreV2Bridge.applyFriendDeleted(accountId)
      friendStore.applyFriendDeleted(accountId)
    }

    const handleFriendInfoChanged = (friend: V2NIMFriend) => {
      if (!isBoundToActiveSession()) {
        return
      }

      imStoreV2Bridge.applyFriendInfoChanged(friend)
      friendStore.applyFriendChanged(friend)
      ensureUIKitUserStatusSubscribed(friend.accountId).catch(() => undefined)
    }

    const clearFriendRefreshRetryTimers = () => {
      friendRefreshRetryTimersRef.current.forEach((timer) => clearTimeout(timer))
      friendRefreshRetryTimersRef.current = []
    }

    const scheduleFriendRefreshRetry = () => {
      clearFriendRefreshRetryTimers()

      for (const delay of [1500, 5000]) {
        const timer = setTimeout(() => {
          if (!isLoggedIn()) {
            return
          }

          if (friendStore.displayUnreadApplicationCount > 0) {
            return
          }

          friendStore.refreshApplications().catch(() => undefined)
        }, delay)

        friendRefreshRetryTimersRef.current.push(timer)
      }
    }

    const handleFriendAddApplication = (
      application: Parameters<typeof nim.V2NIMFriendService.on>[1] extends never
        ? never
        : Parameters<typeof friendStore.applyApplication>[0]
    ) => {
      if (!isBoundToActiveSession()) {
        return
      }

      friendStore.applyApplication(application)
      friendStore.refreshApplications().catch(() => undefined)
    }

    const handleFriendAddRejected = (
      rejection: Parameters<typeof friendStore.applyApplication>[0]
    ) => {
      if (!isBoundToActiveSession()) {
        return
      }

      friendStore.applyApplication(rejection)
      friendStore.refreshApplications().catch(() => undefined)
    }

    const syncTeamsAndPrune = async () => {
      await teamStore.refreshJoinedTeams()
      imStoreV2Bridge.pruneInvalidTeamConversations()
      conversationStore.pruneInvalidTeamConversations()
    }

    const refreshTeams = () => {
      if (!isBoundToActiveSession()) {
        return
      }

      syncTeamsAndPrune().catch(() => undefined)
    }

    const refreshTeamsAndConversations = () => {
      if (!isBoundToActiveSession()) {
        return
      }

      syncTeamsAndPrune()
        .then(() => imStoreV2Bridge.refreshCurrentConversationSource())
        .catch(() => undefined)
    }

    const restoreRejoinedTeamConversation = (teamId?: string) => {
      if (!teamId) {
        return
      }

      conversationStore.restoreTeamConversationByTeamId(teamId)
    }

    const handleTeamJoined = (team?: { teamId?: string }) => {
      if (!isBoundToActiveSession()) {
        return
      }

      restoreRejoinedTeamConversation(team?.teamId)
      refreshTeamsAndConversations()
    }

    const removeTeamConversationFromEvent = (team?: { teamId?: string }) => {
      if (!team?.teamId) {
        return
      }

      conversationStore.removeTeamConversationByTeamId(team.teamId)
    }

    const handleTeamDismissed = (team?: { teamId?: string }) => {
      if (!isBoundToActiveSession()) {
        return
      }

      removeTeamConversationFromEvent(team)
      syncTeamsAndPrune()
        .then(() => conversationStore.refreshConversations())
        .catch(() => undefined)
    }

    const handleTeamLeft = (team?: { teamId?: string }) => {
      if (!isBoundToActiveSession()) {
        return
      }

      removeTeamConversationFromEvent(team)
      syncTeamsAndPrune()
        .then(() => conversationStore.refreshConversations())
        .catch(() => undefined)
    }

    const handleTeamMemberKicked = (_operateAccountId: string, teamMembers: V2NIMTeamMember[]) => {
      if (!isBoundToActiveSession()) {
        return
      }

      const currentAccountId = nimStore.getLoginUser()
      const kickedSelfMember = teamMembers.find((member) => member.accountId === currentAccountId)

      if (kickedSelfMember?.teamId) {
        conversationStore.removeTeamConversationByTeamId(kickedSelfMember.teamId)
      }

      syncTeamsAndPrune()
        .then(() => conversationStore.refreshConversations())
        .catch(() => undefined)
    }

    const handleTeamMemberJoined = (teamMembers: V2NIMTeamMember[]) => {
      if (!isBoundToActiveSession()) {
        return
      }

      const currentAccountId = nimStore.getLoginUser()
      const joinedSelfMember = teamMembers.find((member) => member.accountId === currentAccountId)

      if (joinedSelfMember?.teamId) {
        restoreRejoinedTeamConversation(joinedSelfMember.teamId)
        refreshTeamsAndConversations()
        return
      }

      refreshTeams()
    }

    const refreshMuteStatus = () => {
      if (!isBoundToActiveSession()) {
        return
      }

      imStoreV2Bridge.refreshCurrentConversationSource().catch(() => undefined)
    }

    const handleP2PReadReceipts = (
      readReceipts: Parameters<typeof messageStore.applyP2PReadReceipts>[0]
    ) => {
      if (!isBoundToActiveSession()) {
        return
      }

      messageStore.applyP2PReadReceipts(readReceipts)
    }

    const handleTeamReadReceipts = (
      readReceipts: Parameters<typeof messageStore.applyTeamReadReceipts>[0]
    ) => {
      if (!isBoundToActiveSession()) {
        return
      }

      messageStore.applyTeamReadReceipts(readReceipts)
    }

    const handleConversationSyncFinished = () => {
      if (!isBoundToActiveSession()) {
        return
      }

      if (loginRefreshTriggeredRef.current) {
        return
      }

      loginRefreshTriggeredRef.current = true
      friendStore.markApplicationSyncPending()
      refreshAppState()
      scheduleFriendRefreshRetry()
    }
    const handleTeamMemberInfoUpdated = (teamMembers: unknown) => {
      if (Array.isArray(teamMembers)) {
        teamStore.applyTeamMembers(teamMembers)
      }
    }

    nim.V2NIMLoginService.on('onLoginStatus', handleLoginStatus)
    nim.V2NIMLoginService.on('onConnectStatus', handleConnectStatus)
    nim.V2NIMLoginService.on('onDataSync', handleDataSync)
    nim.V2NIMLoginService.on('onKickedOffline', handleKickedOffline)
    nim.V2NIMMessageService.on('onReceiveMessages', handleReceiveMessages)
    nim.V2NIMMessageService.on('onReceiveMessagesModified', handleReceiveMessagesModified)
    nim.V2NIMMessageService.on('onMessageRevokeNotifications', handleMessageRevokeNotifications)
    nim.V2NIMMessageService.on('onMessageDeletedNotifications', handleMessageDeletedNotifications)
    nim.V2NIMMessageService.on('onMessagePinNotification', handleMessagePinNotification)
    nim.V2NIMMessageService.on('onReceiveP2PMessageReadReceipts', handleP2PReadReceipts)
    nim.V2NIMMessageService.on('onReceiveTeamMessageReadReceipts', handleTeamReadReceipts)
    nim.V2NIMLocalConversationService.on('onSyncFinished', handleConversationSyncFinished)
    nim.V2NIMLocalConversationService.on('onConversationChanged', handleConversationChanged)
    nim.V2NIMFriendService.on('onFriendAdded', handleFriendAdded)
    nim.V2NIMFriendService.on('onFriendDeleted', handleFriendDeleted)
    nim.V2NIMFriendService.on('onFriendAddApplication', handleFriendAddApplication)
    nim.V2NIMFriendService.on('onFriendAddRejected', handleFriendAddRejected)
    nim.V2NIMFriendService.on('onFriendInfoChanged', handleFriendInfoChanged)
    nim.V2NIMUserService.on('onUserProfileChanged', userStore.applyUsers)
    nim.V2NIMUserService.on('onBlockListAdded', refreshFriends)
    nim.V2NIMUserService.on('onBlockListRemoved', refreshFriends)
    nim.V2NIMTeamService.on('onSyncFinished', refreshTeams)
    nim.V2NIMTeamService.on('onTeamCreated', refreshTeamsAndConversations)
    nim.V2NIMTeamService.on('onTeamDismissed', handleTeamDismissed)
    nim.V2NIMTeamService.on('onTeamJoined', handleTeamJoined)
    nim.V2NIMTeamService.on('onTeamLeft', handleTeamLeft)
    nim.V2NIMTeamService.on('onTeamInfoUpdated', refreshTeamsAndConversations)
    nim.V2NIMTeamService.on('onTeamMemberJoined', handleTeamMemberJoined)
    nim.V2NIMTeamService.on('onTeamMemberKicked', handleTeamMemberKicked)
    nim.V2NIMTeamService.on('onTeamMemberLeft', refreshTeams)
    nim.V2NIMTeamService.on('onTeamMemberInfoUpdated', handleTeamMemberInfoUpdated)
    nim.V2NIMSettingService.on('onP2PMessageMuteModeChanged', refreshMuteStatus)
    nim.V2NIMSettingService.on('onTeamMessageMuteModeChanged', refreshMuteStatus)

    if (isLoggedIn()) {
      nimStore.setConnectStatus(nim.V2NIMLoginService.getConnectStatus?.() ?? null)

      if (!loginRefreshTriggeredRef.current) {
        loginRefreshTriggeredRef.current = true
        friendStore.markApplicationSyncPending()
        refreshAppState()
        scheduleFriendRefreshRetry()
      }
    }

    return () => {
      if (receiveMessageFlushTimerRef.current) {
        clearTimeout(receiveMessageFlushTimerRef.current)
        receiveMessageFlushTimerRef.current = null
      }
      if (receiveMessageMaxWaitTimerRef.current) {
        clearTimeout(receiveMessageMaxWaitTimerRef.current)
        receiveMessageMaxWaitTimerRef.current = null
      }
      pendingReceivedMessagesRef.current = []
      nimStore.setConnectStatus(null)
      clearFriendRefreshRetryTimers()
      nim.V2NIMLoginService.off('onLoginStatus', handleLoginStatus)
      nim.V2NIMLoginService.off('onConnectStatus', handleConnectStatus)
      nim.V2NIMLoginService.off('onDataSync', handleDataSync)
      nim.V2NIMLoginService.off('onKickedOffline', handleKickedOffline)
      nim.V2NIMMessageService.off('onReceiveMessages', handleReceiveMessages)
      nim.V2NIMMessageService.off('onReceiveMessagesModified', handleReceiveMessagesModified)
      nim.V2NIMMessageService.off('onMessageRevokeNotifications', handleMessageRevokeNotifications)
      nim.V2NIMMessageService.off(
        'onMessageDeletedNotifications',
        handleMessageDeletedNotifications
      )
      nim.V2NIMMessageService.off('onMessagePinNotification', handleMessagePinNotification)
      nim.V2NIMMessageService.off('onReceiveP2PMessageReadReceipts', handleP2PReadReceipts)
      nim.V2NIMMessageService.off('onReceiveTeamMessageReadReceipts', handleTeamReadReceipts)
      nim.V2NIMLocalConversationService.off('onSyncFinished', handleConversationSyncFinished)
      nim.V2NIMLocalConversationService.off('onConversationChanged', handleConversationChanged)
      nim.V2NIMFriendService.off('onFriendAdded', handleFriendAdded)
      nim.V2NIMFriendService.off('onFriendDeleted', handleFriendDeleted)
      nim.V2NIMFriendService.off('onFriendAddApplication', handleFriendAddApplication)
      nim.V2NIMFriendService.off('onFriendAddRejected', handleFriendAddRejected)
      nim.V2NIMFriendService.off('onFriendInfoChanged', handleFriendInfoChanged)
      nim.V2NIMUserService.off('onUserProfileChanged', userStore.applyUsers)
      nim.V2NIMUserService.off('onBlockListAdded', refreshFriends)
      nim.V2NIMUserService.off('onBlockListRemoved', refreshFriends)
      nim.V2NIMTeamService.off('onSyncFinished', refreshTeams)
      nim.V2NIMTeamService.off('onTeamCreated', refreshTeamsAndConversations)
      nim.V2NIMTeamService.off('onTeamDismissed', handleTeamDismissed)
      nim.V2NIMTeamService.off('onTeamJoined', handleTeamJoined)
      nim.V2NIMTeamService.off('onTeamLeft', handleTeamLeft)
      nim.V2NIMTeamService.off('onTeamInfoUpdated', refreshTeamsAndConversations)
      nim.V2NIMTeamService.off('onTeamMemberJoined', handleTeamMemberJoined)
      nim.V2NIMTeamService.off('onTeamMemberKicked', handleTeamMemberKicked)
      nim.V2NIMTeamService.off('onTeamMemberLeft', refreshTeams)
      nim.V2NIMTeamService.off('onTeamMemberInfoUpdated', handleTeamMemberInfoUpdated)
      nim.V2NIMSettingService.off('onP2PMessageMuteModeChanged', refreshMuteStatus)
      nim.V2NIMSettingService.off('onTeamMessageMuteModeChanged', refreshMuteStatus)
    }
  }, [isInitialized, nim])

  useEffect(() => {
    configureNotificationHandler(async () => ({
      shouldPlaySound: AppState.currentState !== 'active' && notificationsEnabled && soundEnabled,
      shouldSetBadge: notificationsEnabled,
      shouldShowBanner: AppState.currentState !== 'active' && notificationsEnabled,
      shouldShowList: AppState.currentState !== 'active' && notificationsEnabled
    }))
  }, [notificationsEnabled, soundEnabled])

  useEffect(() => {
    syncNotificationChannel({
      enabled: notificationsEnabled,
      soundEnabled,
      vibrationEnabled
    }).catch(() => undefined)
  }, [notificationsEnabled, soundEnabled, vibrationEnabled])

  useEffect(() => {
    if (!nim || !isInitialized || Platform.OS === 'web') {
      return
    }

    const cameraCaptureForegroundRestoreTimers: ReturnType<typeof setTimeout>[] = []

    const restoreForegroundForCameraCapture = () => {
      if (!isNativeCameraCaptureActive()) {
        return
      }

      if (!nimStore.isLoggedIn()) {
        return
      }

      nim.V2NIMSettingService.setAppBackground(false, totalUnread).catch(() => undefined)
    }

    const syncBackgroundState = (state: string) => {
      const isBackground = state !== 'active'

      if (isBackground && isNativeCameraCaptureActive()) {
        restoreForegroundForCameraCapture()
        for (const delayMs of [500, 1500]) {
          cameraCaptureForegroundRestoreTimers.push(
            setTimeout(() => {
              restoreForegroundForCameraCapture()
            }, delayMs)
          )
        }
        return
      }

      if (nimStore.isLoggedIn()) {
        nim.V2NIMSettingService.setAppBackground(isBackground, totalUnread).catch(() => undefined)
      }

      if (!isBackground && nimStore.isLoggedIn()) {
        if (friendStore.displayUnreadApplicationCount === 0) {
          friendStore.markApplicationSyncPending()
          friendStore.refreshApplications().catch(() => undefined)
        }

        messageStore
          .refreshPinnedMessages([
            messageStore.activeConversationId,
            ...messageStore.getTrackedPinnedConversationIds()
          ])
          .catch(() => undefined)
      }
    }

    syncBackgroundState(AppState.currentState)
    const subscription = AppState.addEventListener('change', syncBackgroundState)

    return () => {
      for (const timer of cameraCaptureForegroundRestoreTimers) {
        clearTimeout(timer)
      }
      subscription.remove()
    }
  }, [isInitialized, nim, totalUnread])

  useEffect(() => {
    if (Platform.OS === 'web') {
      return
    }

    const handleResponse = async (
      response: {
        notification?: { request?: { content?: { data?: Record<string, unknown> } } }
      } | null
    ) => {
      const conversationId = resolveConversationIdFromPushData(
        response?.notification?.request?.content?.data,
        nimStore.nim
      )

      if (conversationId) {
        clearPresentedNotifications().catch(() => undefined)

        if (authStore.isAuthenticated) {
          router.push({ pathname: '/chat/[id]', params: { id: conversationId } })
        } else {
          authStore.setPendingConversationId(conversationId)
        }
      }
    }

    getLastNotificationResponse().then(handleResponse)
    const subscription = addNotificationResponseListener(handleResponse)

    return () => {
      subscription.remove?.()
    }
  }, [])

  const isAppReady = loaded && isAuthReady && isPreferenceReady

  if (!isAppReady) {
    return (
      <View style={styles.appContainer}>
        <StartupFallback />
      </View>
    )
  }

  return (
    <View style={styles.appContainer}>
      <StatusBar style="dark" backgroundColor="#FFFFFF" />
      <RootLayoutNav colorScheme={resolvedColorScheme} />
      <NativeToastHost />
    </View>
  )
})

function StartupFallback() {
  return (
    <View style={styles.startupFallback}>
      <ActivityIndicator color="#337EFF" />
    </View>
  )
}

function RootLayoutNav({ colorScheme }: { colorScheme: 'light' | 'dark' }) {
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: true,
          headerBackButtonDisplayMode: 'minimal',
          headerTintColor: '#111827',
          headerLeft: ({ canGoBack }) =>
            canGoBack ? <UIKitHeaderBackButton onPress={() => router.back()} /> : undefined
        }}
      >
        <Stack.Screen name="home" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="chat/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="chat/read-detail" />
      </Stack>
    </ThemeProvider>
  )
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1
  },
  startupFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F7F8'
  }
})

export default RootLayout
