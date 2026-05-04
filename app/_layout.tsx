import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { router, Stack, usePathname } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import * as SystemUI from 'expo-system-ui'
import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { ActivityIndicator, AppState, Platform, StyleSheet, View } from 'react-native'

import { useColorScheme } from '@/hooks/useColorScheme'
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
import type { V2NIMKickedOfflineDetail } from '@/utils/nim-sdk'
import { V2NIMLocalConversation, V2NIMMessage } from '@/utils/nim-sdk'
import {
  addNotificationResponseListener,
  configureNotificationHandler,
  getLastNotificationResponse
} from '@/utils/notifications'

export { ErrorBoundary } from 'expo-router'

export const unstable_settings = {
  initialRouteName: 'home'
}

SplashScreen.preventAutoHideAsync()

const RootLayout = observer(() => {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf')
  })

  const pathname = usePathname()
  const isAuthenticated = authStore.isAuthenticated
  const isAuthReady = authStore.isReady
  const loginStatus = authStore.loginStatus
  const isPreferenceReady = preferenceStore.isReady
  const { nim, isInitialized } = nimStore
  const systemColorScheme = useColorScheme()
  const resolvedColorScheme = preferenceStore.resolveColorScheme(systemColorScheme)
  const notificationsEnabled = preferenceStore.preferences.notificationsEnabled
  const soundEnabled = preferenceStore.preferences.soundEnabled

  useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync()
    }
  }, [loaded])

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
    if (!isAuthReady || !isAuthenticated || !authStore.pendingConversationId) {
      return
    }

    router.push({
      pathname: '/chat/[id]',
      params: { id: authStore.pendingConversationId }
    })
    authStore.setPendingConversationId(null)
  }, [isAuthReady, isAuthenticated])

  useEffect(() => {
    const backgroundColor = resolvedColorScheme === 'dark' ? '#0F1115' : '#F7F7F8'
    SystemUI.setBackgroundColorAsync(backgroundColor).catch(() => undefined)
  }, [resolvedColorScheme])

  useEffect(() => {
    if (!isPreferenceReady || preferenceStore.notificationPermissionStatus !== 'undetermined') {
      return
    }

    preferenceStore.requestNotificationPermission().catch(() => undefined)
  }, [isPreferenceReady])

  useEffect(() => {
    if (!nim || !isInitialized) {
      return
    }

    const isLoggedIn = () => {
      try {
        return nim.V2NIMLoginService.getLoginStatus() === 1
      } catch {
        return false
      }
    }

    const refreshAppState = async () => {
      if (!isLoggedIn()) {
        return
      }

      imStoreV2Bridge.bindNIM(nim)

      await Promise.allSettled([
        conversationStore.refreshConversations(),
        friendStore.refreshAll(),
        teamStore.refreshJoinedTeams(),
        userStore.refreshSelfProfile()
      ])
    }

    const handleReceiveMessages = (messages: V2NIMMessage[]) => {
      messageStore.addMessages(messages)
      conversationStore.refreshConversations()
    }

    const handleReceiveMessagesModified = (messages: V2NIMMessage[]) => {
      messageStore.addMessages(messages)
    }

    const handleMessageDeletedNotifications = (
      notifications: { messageRefer: { conversationId: string; messageClientId: string } }[]
    ) => {
      notifications.forEach((notification) => {
        messageStore.deleteMessage(
          notification.messageRefer.conversationId,
          notification.messageRefer.messageClientId
        )
      })
    }

    const handleMessageRevokeNotifications = (
      notifications: Parameters<typeof messageStore.applyRevokeNotifications>[0]
    ) => {
      messageStore.applyRevokeNotifications(notifications)
      conversationStore.refreshConversations()
    }

    const handleMessagePinNotification = (
      notification: Parameters<typeof messageStore.applyPinNotification>[0]
    ) => {
      messageStore.applyPinNotification(notification)
    }

    const handleConversationChanged = (conversations: V2NIMLocalConversation[]) => {
      conversations.forEach((conversation) => {
        conversationStore.updateConversation(conversation.conversationId, conversation)
      })
    }

    const handleLoginStatus = (status: number) => {
      authStore.setLoginStatus(status)

      if (status === 1) {
        refreshAppState()
      }

      if (status === 0 && authStore.isAuthenticated) {
        imStoreV2Bridge.destroy()
        authStore.clearPersistedSession()
      }
    }

    const handleKickedOffline = (detail: V2NIMKickedOfflineDetail) => {
      authStore.handleKickedOffline(detail)
    }

    const refreshFriends = () => {
      friendStore.refreshAll()
    }

    const refreshTeams = () => {
      teamStore.refreshJoinedTeams()
    }

    const refreshMuteStatus = () => {
      conversationStore.refreshConversations()
    }

    const handleP2PReadReceipts = (
      readReceipts: Parameters<typeof messageStore.applyP2PReadReceipts>[0]
    ) => {
      messageStore.applyP2PReadReceipts(readReceipts)
    }

    const handleTeamReadReceipts = (
      readReceipts: Parameters<typeof messageStore.applyTeamReadReceipts>[0]
    ) => {
      messageStore.applyTeamReadReceipts(readReceipts)
    }

    nim.V2NIMLoginService.on('onLoginStatus', handleLoginStatus)
    nim.V2NIMLoginService.on('onKickedOffline', handleKickedOffline)
    nim.V2NIMMessageService.on('onReceiveMessages', handleReceiveMessages)
    nim.V2NIMMessageService.on('onReceiveMessagesModified', handleReceiveMessagesModified)
    nim.V2NIMMessageService.on('onMessageRevokeNotifications', handleMessageRevokeNotifications)
    nim.V2NIMMessageService.on('onMessageDeletedNotifications', handleMessageDeletedNotifications)
    nim.V2NIMMessageService.on('onMessagePinNotification', handleMessagePinNotification)
    nim.V2NIMMessageService.on('onReceiveP2PMessageReadReceipts', handleP2PReadReceipts)
    nim.V2NIMMessageService.on('onReceiveTeamMessageReadReceipts', handleTeamReadReceipts)
    nim.V2NIMLocalConversationService.on('onSyncFinished', refreshAppState)
    nim.V2NIMLocalConversationService.on('onConversationChanged', handleConversationChanged)
    nim.V2NIMFriendService.on('onFriendAdded', refreshFriends)
    nim.V2NIMFriendService.on('onFriendDeleted', refreshFriends)
    nim.V2NIMFriendService.on('onFriendAddApplication', refreshFriends)
    nim.V2NIMFriendService.on('onFriendAddRejected', refreshFriends)
    nim.V2NIMFriendService.on('onFriendInfoChanged', refreshFriends)
    nim.V2NIMUserService.on('onUserProfileChanged', userStore.applyUsers)
    nim.V2NIMUserService.on('onBlockListAdded', refreshFriends)
    nim.V2NIMUserService.on('onBlockListRemoved', refreshFriends)
    nim.V2NIMTeamService.on('onSyncFinished', refreshTeams)
    nim.V2NIMTeamService.on('onTeamCreated', refreshTeams)
    nim.V2NIMTeamService.on('onTeamDismissed', refreshTeams)
    nim.V2NIMTeamService.on('onTeamJoined', refreshTeams)
    nim.V2NIMTeamService.on('onTeamLeft', refreshTeams)
    nim.V2NIMTeamService.on('onTeamInfoUpdated', refreshTeams)
    nim.V2NIMTeamService.on('onTeamMemberJoined', refreshTeams)
    nim.V2NIMTeamService.on('onTeamMemberKicked', refreshTeams)
    nim.V2NIMTeamService.on('onTeamMemberLeft', refreshTeams)
    nim.V2NIMSettingService.on('onP2PMessageMuteModeChanged', refreshMuteStatus)
    nim.V2NIMSettingService.on('onTeamMessageMuteModeChanged', refreshMuteStatus)

    if (isLoggedIn()) {
      refreshAppState()
    }

    return () => {
      imStoreV2Bridge.destroy()
      nim.V2NIMLoginService.off('onLoginStatus', handleLoginStatus)
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
      nim.V2NIMLocalConversationService.off('onSyncFinished', refreshAppState)
      nim.V2NIMLocalConversationService.off('onConversationChanged', handleConversationChanged)
      nim.V2NIMFriendService.off('onFriendAdded', refreshFriends)
      nim.V2NIMFriendService.off('onFriendDeleted', refreshFriends)
      nim.V2NIMFriendService.off('onFriendAddApplication', refreshFriends)
      nim.V2NIMFriendService.off('onFriendAddRejected', refreshFriends)
      nim.V2NIMFriendService.off('onFriendInfoChanged', refreshFriends)
      nim.V2NIMUserService.off('onUserProfileChanged', userStore.applyUsers)
      nim.V2NIMUserService.off('onBlockListAdded', refreshFriends)
      nim.V2NIMUserService.off('onBlockListRemoved', refreshFriends)
      nim.V2NIMTeamService.off('onSyncFinished', refreshTeams)
      nim.V2NIMTeamService.off('onTeamCreated', refreshTeams)
      nim.V2NIMTeamService.off('onTeamDismissed', refreshTeams)
      nim.V2NIMTeamService.off('onTeamJoined', refreshTeams)
      nim.V2NIMTeamService.off('onTeamLeft', refreshTeams)
      nim.V2NIMTeamService.off('onTeamInfoUpdated', refreshTeams)
      nim.V2NIMTeamService.off('onTeamMemberJoined', refreshTeams)
      nim.V2NIMTeamService.off('onTeamMemberKicked', refreshTeams)
      nim.V2NIMTeamService.off('onTeamMemberLeft', refreshTeams)
      nim.V2NIMSettingService.off('onP2PMessageMuteModeChanged', refreshMuteStatus)
      nim.V2NIMSettingService.off('onTeamMessageMuteModeChanged', refreshMuteStatus)
    }
  }, [isInitialized, loginStatus, nim])

  useEffect(() => {
    configureNotificationHandler(async () => ({
      shouldPlaySound: AppState.currentState !== 'active' && notificationsEnabled && soundEnabled,
      shouldSetBadge: notificationsEnabled,
      shouldShowBanner: AppState.currentState !== 'active' && notificationsEnabled,
      shouldShowList: AppState.currentState !== 'active' && notificationsEnabled
    }))
  }, [notificationsEnabled, soundEnabled])

  useEffect(() => {
    if (Platform.OS === 'web') {
      return
    }

    const handleResponse = async (
      response: {
        notification?: { request?: { content?: { data?: Record<string, unknown> } } }
      } | null
    ) => {
      const conversationId = response?.notification?.request?.content?.data?.conversationId

      if (typeof conversationId === 'string' && conversationId) {
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

  if (!loaded || !isAuthReady || !isPreferenceReady) {
    return <StartupFallback />
  }

  return <RootLayoutNav colorScheme={resolvedColorScheme} />
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
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="home" />
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="chat/[id]" />
      </Stack>
    </ThemeProvider>
  )
}

const styles = StyleSheet.create({
  startupFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F7F8'
  }
})

export default RootLayout
