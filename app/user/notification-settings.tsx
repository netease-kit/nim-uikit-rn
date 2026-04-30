import { Stack } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { Alert, Pressable, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { UIKitPage, UIKitRowDivider, UIKitSectionLabel, UIKitSwitchRow } from '@/src/NEUIKit/rn'
import { preferenceStore } from '@/stores'

const NotificationSettingsScreen = observer(() => {
  const { preferences } = preferenceStore

  const updateSetting = async (action: () => Promise<unknown>) => {
    try {
      await action()
    } catch (error) {
      Alert.alert('设置失败', error instanceof Error ? error.message : '请稍后重试')
    }
  }

  return (
    <UIKitPage style={styles.page}>
      <Stack.Screen options={{ title: '消息提醒', headerTitleAlign: 'center' }} />

      <View style={styles.card}>
        <UIKitSwitchRow
          label="新消息通知"
          value={preferences.notificationsEnabled}
          onValueChange={(value) => {
            void updateSetting(() => preferenceStore.setNotificationsEnabled(value))
          }}
        />
      </View>

      <UIKitSectionLabel label="消息提醒方式" style={styles.sectionLabel} />
      <View style={styles.card}>
        <UIKitSwitchRow
          label="响铃模式"
          value={preferences.soundEnabled}
          onValueChange={(value) => {
            void updateSetting(() => preferenceStore.updatePreference('soundEnabled', value))
          }}
        />
        <UIKitRowDivider />
        <UIKitSwitchRow
          label="震动模式"
          value={preferences.vibrationEnabled}
          onValueChange={(value) => {
            void updateSetting(() => preferenceStore.updatePreference('vibrationEnabled', value))
          }}
        />
      </View>

      <UIKitSectionLabel label="推送设置" style={styles.sectionLabel} />
      <View style={styles.card}>
        <UIKitSwitchRow
          label="PC/Web同步接收推送"
          value={preferences.syncPushEnabled}
          onValueChange={(value) => {
            void updateSetting(() => preferenceStore.updatePreference('syncPushEnabled', value))
          }}
        />
        <UIKitRowDivider />
        <UIKitSwitchRow
          label="通知栏显示消息详情"
          value={preferences.showMessageDetail}
          onValueChange={(value) => {
            void updateSetting(() => preferenceStore.updatePreference('showMessageDetail', value))
          }}
        />
      </View>

      <View style={styles.permissionCard}>
        <ThemedText style={styles.permissionText}>
          系统通知权限：
          {permissionLabelMap[preferenceStore.notificationPermissionStatus] || '未确定'}
        </ThemedText>
        <View style={styles.permissionActions}>
          <Pressable
            style={styles.permissionButton}
            onPress={async () => {
              try {
                await preferenceStore.requestNotificationPermission()
              } catch (error) {
                Alert.alert('请求失败', error instanceof Error ? error.message : '请稍后重试')
              }
            }}
          >
            <ThemedText style={styles.permissionButtonText}>请求授权</ThemedText>
          </Pressable>
          <Pressable
            style={styles.permissionButton}
            onPress={async () => {
              try {
                await preferenceStore.openSystemSettings()
              } catch (error) {
                Alert.alert('打开失败', error instanceof Error ? error.message : '请稍后重试')
              }
            }}
          >
            <ThemedText style={styles.permissionButtonText}>系统设置</ThemedText>
          </Pressable>
        </View>
      </View>
    </UIKitPage>
  )
})

const permissionLabelMap: Record<string, string> = {
  granted: '已允许',
  denied: '已拒绝',
  undetermined: '未确定'
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    padding: 16
  },
  sectionLabel: {
    marginTop: 18,
    marginLeft: 2
  },
  card: {
    marginTop: 8,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden'
  },
  permissionCard: {
    marginTop: 18,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    padding: 20
  },
  permissionText: {
    color: '#7E8794',
    fontSize: 14,
    lineHeight: 20
  },
  permissionActions: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 10
  },
  permissionButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 21,
    backgroundColor: '#F4F6FA',
    alignItems: 'center',
    justifyContent: 'center'
  },
  permissionButtonText: {
    color: '#337EFF',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600'
  }
})

export default NotificationSettingsScreen
