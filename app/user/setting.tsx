import { router, Stack } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { Alert, Pressable, StyleSheet, Switch, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ThemedText } from '@/components/ThemedText'
import { useAppTranslation } from '@/hooks/useAppTranslation'
import { useNavigationLock } from '@/hooks/useNavigationLock'
import { toast } from '@/src/NEUIKit/common/utils/toast'
import { UIKitPage } from '@/src/NEUIKit/rn'
import { authStore, preferenceStore } from '@/stores'

const SettingScreen = observer(() => {
  const { preferences } = preferenceStore
  const { t } = useAppTranslation()
  const { runWithNavigationLock } = useNavigationLock()
  const insets = useSafeAreaInsets()

  const handleLogout = () => {
    Alert.alert(t('settingsLogoutTitle'), t('settingsLogoutMessage'), [
      { text: t('actionCancel'), style: 'cancel' },
      {
        text: t('actionConfirm'),
        style: 'destructive',
        onPress: async () => {
          try {
            await authStore.logout()
            router.replace('/home' as never)
          } catch (error) {
            toast.alert(
              t('settingsLogoutFailed'),
              error instanceof Error ? error.message : t('commonRetryLater')
            )
          }
        }
      }
    ])
  }

  return (
    <UIKitPage style={[styles.page, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <Stack.Screen options={{ title: t('settingsTitle'), headerTitleAlign: 'center' }} />

      <View style={styles.card}>
        <SettingSwitchRow
          label={t('settingsCloudConversation')}
          value={preferenceStore.getCloudConversationEnabled()}
          hint={t('settingsCloudConversationHint')}
          onValueChange={(value) => {
            preferenceStore.setCloudConversationEnabled(value).catch((error) => {
              toast.alert(
                t('settingsUpdateFailed'),
                error instanceof Error ? error.message : t('commonRetryLater')
              )
            })
          }}
        />
        <View style={styles.divider} />
        <SettingSwitchRow
          label={t('settingsReadReceipt')}
          value={preferences.readReceiptEnabled}
          onValueChange={(value) => {
            void preferenceStore.updatePreference('readReceiptEnabled', value)
          }}
        />
        <View style={styles.divider} />
        <SettingNavRow
          label={t('settingsLanguage')}
          onPress={() =>
            runWithNavigationLock(() => {
              router.push('/user/language' as never)
            })
          }
        />
      </View>

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <ThemedText style={styles.logoutText}>{t('settingsLogout')}</ThemedText>
      </Pressable>
    </UIKitPage>
  )
})

function SettingSwitchRow({
  label,
  hint,
  value,
  onValueChange
}: {
  label: string
  hint?: string
  value: boolean
  onValueChange: (value: boolean) => void
}) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingTextGroup}>
        <ThemedText style={styles.settingLabel}>{label}</ThemedText>
        {hint ? <ThemedText style={styles.settingHint}>{hint}</ThemedText> : null}
      </View>
      <View style={styles.switchControl}>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#D8DEE7', true: '#337EFF' }}
          thumbColor="#FFFFFF"
          ios_backgroundColor="#D8DEE7"
        />
      </View>
    </View>
  )
}

function SettingNavRow({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.settingRow} onPress={onPress}>
      <ThemedText style={styles.settingLabel}>{label}</ThemedText>
      <ThemedText style={styles.chevron}>›</ThemedText>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#F5F6F7',
    paddingBottom: 12
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
  settingTextGroup: {
    flex: 1,
    paddingRight: 12
  },
  switchControl: {
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center'
  },
  settingLabel: {
    color: '#000000',
    fontSize: 16,
    lineHeight: 24
  },
  settingHint: {
    marginTop: 2,
    color: '#8A94A6',
    fontSize: 12,
    lineHeight: 18
  },
  chevron: {
    color: '#A6AFBB',
    fontSize: 18,
    lineHeight: 18
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
