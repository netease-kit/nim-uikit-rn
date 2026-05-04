import { router, Stack } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React, { useEffect, useState } from 'react'
import { Alert, Pressable, StyleSheet, Switch, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ThemedText } from '@/components/ThemedText'
import { UIKitPage } from '@/src/NEUIKit/rn'
import { authStore } from '@/stores'
import { storage } from '@/utils/storage'

const ENABLE_V2_CLOUD_CONVERSATION_KEY = 'enableV2CloudConversation'
const SWITCH_TO_ENGLISH_KEY = 'switchToEnglishFlag'

const SettingScreen = observer(() => {
  const insets = useSafeAreaInsets()
  const [enableV2CloudConversation, setEnableV2CloudConversation] = useState(false)
  const [switchToEnglishFlag, setSwitchToEnglishFlag] = useState(false)

  useEffect(() => {
    const loadSettings = async () => {
      const storedCloudConversation = await storage.getString(ENABLE_V2_CLOUD_CONVERSATION_KEY)
      const storedLanguage = await storage.getString(SWITCH_TO_ENGLISH_KEY)

      setEnableV2CloudConversation(storedCloudConversation === 'on')
      setSwitchToEnglishFlag(storedLanguage === 'en')
    }

    loadSettings().catch(() => undefined)
  }, [])

  const handleCloudConversationChange = async (value: boolean) => {
    setEnableV2CloudConversation(value)
    await storage.setString(ENABLE_V2_CLOUD_CONVERSATION_KEY, value ? 'on' : 'off')
    Alert.alert('提示', '切换后重新进入页面生效')
  }

  const handleLanguageChange = async (value: boolean) => {
    setSwitchToEnglishFlag(value)
    await storage.setString(SWITCH_TO_ENGLISH_KEY, value ? 'en' : 'zh')
    Alert.alert('提示', '切换后重新进入页面生效')
  }

  const handleLogout = () => {
    Alert.alert('提示', '你确认要退出登录？', [
      { text: '取消', style: 'cancel' },
      {
        text: '确认',
        style: 'destructive',
        onPress: async () => {
          try {
            await authStore.logout()
            router.replace('/home' as never)
          } catch (error) {
            Alert.alert('退出失败', error instanceof Error ? error.message : '请稍后重试')
          }
        }
      }
    ])
  }

  return (
    <UIKitPage
      style={[
        styles.page,
        {
          paddingTop: insets.top,
          paddingBottom: Math.max(insets.bottom, 12)
        }
      ]}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.navBar}>
        <Pressable style={styles.navLeft} onPress={() => router.back()}>
          <ThemedText style={styles.navBackIcon}>‹</ThemedText>
        </Pressable>
        <ThemedText style={styles.navTitle}>设置</ThemedText>
        <View style={styles.navRight} />
      </View>

      <View style={styles.card}>
        <SettingSwitchRow
          label="是否开启云端会话"
          value={enableV2CloudConversation}
          onValueChange={(value) => {
            void handleCloudConversationChange(value)
          }}
        />
        <View style={styles.divider} />
        <SettingSwitchRow
          label="是否切换为英文"
          value={switchToEnglishFlag}
          onValueChange={(value) => {
            void handleLanguageChange(value)
          }}
        />
      </View>

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <ThemedText style={styles.logoutText}>退出登录</ThemedText>
      </Pressable>
    </UIKitPage>
  )
})

function SettingSwitchRow({
  label,
  value,
  onValueChange
}: {
  label: string
  value: boolean
  onValueChange: (value: boolean) => void
}) {
  return (
    <View style={styles.settingRow}>
      <ThemedText style={styles.settingLabel}>{label}</ThemedText>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#D8DEE7', true: '#337EFF' }}
        thumbColor="#FFFFFF"
        ios_backgroundColor="#D8DEE7"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#F5F6F7'
  },
  navBar: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF'
  },
  navLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center'
  },
  navBackIcon: {
    color: '#111111',
    fontSize: 28,
    lineHeight: 28
  },
  navTitle: {
    color: '#111111',
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '600'
  },
  navRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 48,
    height: 48
  },
  card: {
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden'
  },
  settingRow: {
    minHeight: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  settingLabel: {
    color: '#000000',
    fontSize: 16,
    lineHeight: 24
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
    backgroundColor: '#EBEDF0'
  },
  logoutButton: {
    marginHorizontal: 12,
    marginTop: 12,
    minHeight: 48,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoutText: {
    color: '#F56C6C',
    fontSize: 16,
    lineHeight: 24
  }
})

export default SettingScreen
