import { Stack } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { Pressable, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { useAppTranslation } from '@/hooks/useAppTranslation'
import { toast } from '@/src/NEUIKit/common/utils/toast'
import { UIKitPage, UIKitRowDivider, UIKitSectionLabel, UIKitSwitchRow } from '@/src/NEUIKit/rn'
import { preferenceStore } from '@/stores'

const NotificationSettingsScreen = observer(() => {
  const { preferences } = preferenceStore
  const { t } = useAppTranslation()
  const notificationsEnabled = preferences.notificationsEnabled

  const updateSetting = async (action: () => Promise<unknown>) => {
    try {
      await action()
    } catch (error) {
      toast.alert(
        t('settingsUpdateFailed'),
        error instanceof Error ? error.message : t('commonRetryLater')
      )
    }
  }

  return (
    <UIKitPage style={styles.page}>
      <Stack.Screen options={{ title: t('notificationTitle'), headerTitleAlign: 'center' }} />

      <View style={styles.card}>
        <UIKitSwitchRow
          label={t('notificationNewMessage')}
          value={notificationsEnabled}
          onValueChange={(value) => {
            void updateSetting(() => preferenceStore.setNotificationsEnabled(value))
          }}
        />
      </View>

      <UIKitSectionLabel label={t('notificationMethods')} style={styles.sectionLabel} />
      <View style={styles.card}>
        <NotificationSwitchRow
          label={t('notificationRing')}
          value={preferences.soundEnabled}
          disabled={!notificationsEnabled}
          onValueChange={(value) => {
            void updateSetting(() => preferenceStore.updatePreference('soundEnabled', value))
          }}
        />
        <UIKitRowDivider />
        <NotificationSwitchRow
          label={t('notificationVibrate')}
          value={preferences.vibrationEnabled}
          disabled={!notificationsEnabled}
          onValueChange={(value) => {
            void updateSetting(() => preferenceStore.updatePreference('vibrationEnabled', value))
          }}
        />
      </View>

      <UIKitSectionLabel label={t('notificationPushSettings')} style={styles.sectionLabel} />
      <View style={styles.card}>
        <NotificationSwitchRow
          label={t('notificationShowDetail')}
          value={preferences.showMessageDetail}
          disabled={!notificationsEnabled}
          onValueChange={(value) => {
            void updateSetting(() => preferenceStore.setShowMessageDetail(value))
          }}
        />
      </View>

      <View style={styles.permissionCard}>
        <ThemedText style={styles.permissionText}>
          {t('notificationPermissionPrefix')}
          {permissionLabelMap(preferenceStore.notificationPermissionStatus, t)}
        </ThemedText>
        <View style={styles.permissionActions}>
          <Pressable
            style={styles.permissionButton}
            onPress={async () => {
              try {
                await preferenceStore.requestNotificationPermission()
              } catch (error) {
                toast.alert(
                  t('requestFailed'),
                  error instanceof Error ? error.message : t('commonRetryLater')
                )
              }
            }}
          >
            <ThemedText style={styles.permissionButtonText}>
              {t('notificationRequestAuth')}
            </ThemedText>
          </Pressable>
          <Pressable
            style={styles.permissionButton}
            onPress={async () => {
              try {
                await preferenceStore.openSystemSettings()
              } catch (error) {
                toast.alert(
                  t('openFailed'),
                  error instanceof Error ? error.message : t('commonRetryLater')
                )
              }
            }}
          >
            <ThemedText style={styles.permissionButtonText}>
              {t('notificationOpenSystemSettings')}
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </UIKitPage>
  )
})

function NotificationSwitchRow({
  label,
  value,
  disabled,
  onValueChange
}: {
  label: string
  value: boolean
  disabled: boolean
  onValueChange: (value: boolean) => void
}) {
  return (
    <View style={disabled && styles.rowDisabled}>
      <UIKitSwitchRow
        label={label}
        value={value}
        onValueChange={(next) => !disabled && onValueChange(next)}
      />
    </View>
  )
}

function permissionLabelMap(status: string, t: ReturnType<typeof useAppTranslation>['t']) {
  switch (status) {
    case 'granted':
      return t('notificationPermissionGranted')
    case 'denied':
      return t('notificationPermissionDenied')
    case 'unavailable':
      return t('notificationPermissionUnavailable')
    default:
      return t('notificationPermissionUndetermined')
  }
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16
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
  rowDisabled: {
    opacity: 0.45
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
