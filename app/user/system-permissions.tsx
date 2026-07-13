import * as Linking from 'expo-linking'
import { Stack, useFocusEffect } from 'expo-router'
import React, { useCallback, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { useAppTranslation } from '@/hooks/useAppTranslation'
import { toast } from '@/src/NEUIKit/common/utils/toast'
import { UIKitPage, UIKitRowDivider } from '@/src/NEUIKit/rn'
import {
  getSystemPermissionStates,
  requestSystemPermission,
  SystemPermissionKind,
  SystemPermissionState,
  SystemPermissionStatus
} from '@/utils/permissions'

const PERMISSION_ORDER: SystemPermissionKind[] = ['notification', 'camera', 'album', 'microphone']

const SystemPermissionsScreen = () => {
  const { t } = useAppTranslation()
  const [states, setStates] = useState<Record<SystemPermissionKind, SystemPermissionState | null>>({
    notification: null,
    camera: null,
    album: null,
    microphone: null
  })
  const [loading, setLoading] = useState(true)
  const [requestingKind, setRequestingKind] = useState<SystemPermissionKind | null>(null)

  const loadStates = useCallback(async () => {
    setLoading(true)

    try {
      const nextStates = await getSystemPermissionStates()
      setStates(
        nextStates.reduce(
          (result, item) => ({
            ...result,
            [item.kind]: item
          }),
          {
            notification: null,
            camera: null,
            album: null,
            microphone: null
          } as Record<SystemPermissionKind, SystemPermissionState | null>
        )
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      loadStates().catch(() => undefined)
    }, [loadStates])
  )

  const requestPermission = async (kind: SystemPermissionKind) => {
    setRequestingKind(kind)

    try {
      const nextState = await requestSystemPermission(kind)
      setStates((current) => ({
        ...current,
        [kind]: nextState
      }))
    } catch (error) {
      toast.alert(
        t('permissionRequestFailed'),
        error instanceof Error ? error.message : t('commonRetryLater')
      )
    } finally {
      setRequestingKind(null)
    }
  }

  const openSettings = async () => {
    try {
      await Linking.openSettings()
    } catch (error) {
      toast.alert(
        t('permissionOpenSettingsFailed'),
        error instanceof Error ? error.message : t('commonRetryLater')
      )
    }
  }

  return (
    <UIKitPage style={styles.page}>
      <Stack.Screen options={{ title: t('permissionsTitle'), headerTitleAlign: 'center' }} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          {PERMISSION_ORDER.map((kind, index) => {
            const state = states[kind]

            return (
              <View key={kind}>
                <View style={styles.row}>
                  <View style={styles.rowText}>
                    <ThemedText style={styles.label}>{getPermissionLabel(kind, t)}</ThemedText>
                    <ThemedText style={styles.status}>
                      {state ? getStatusLabel(state.status, t) : t('permissionStatusUnavailable')}
                    </ThemedText>
                  </View>
                  <View style={styles.actions}>
                    {state?.canRequest ? (
                      <Pressable
                        style={styles.actionButton}
                        disabled={requestingKind === kind}
                        onPress={() => requestPermission(kind)}
                      >
                        {requestingKind === kind ? (
                          <ActivityIndicator color="#337EFF" size="small" />
                        ) : (
                          <ThemedText style={styles.actionText}>
                            {t('permissionRequest')}
                          </ThemedText>
                        )}
                      </Pressable>
                    ) : null}
                    {state?.canOpenSettings || !state?.canRequest ? (
                      <Pressable style={styles.actionButton} onPress={openSettings}>
                        <ThemedText style={styles.actionText}>
                          {t('permissionOpenSettings')}
                        </ThemedText>
                      </Pressable>
                    ) : null}
                  </View>
                </View>
                {index < PERMISSION_ORDER.length - 1 ? <UIKitRowDivider /> : null}
              </View>
            )
          })}
        </View>

        <Pressable style={styles.refreshButton} onPress={loadStates}>
          <ThemedText style={styles.refreshText}>{t('permissionRefresh')}</ThemedText>
        </Pressable>

        {loading ? (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator color="#337EFF" />
          </View>
        ) : null}
      </ScrollView>
    </UIKitPage>
  )
}

function getPermissionLabel(
  kind: SystemPermissionKind,
  t: ReturnType<typeof useAppTranslation>['t']
) {
  switch (kind) {
    case 'notification':
      return t('permissionNotification')
    case 'camera':
      return t('permissionCamera')
    case 'album':
      return t('permissionAlbum')
    case 'microphone':
      return t('permissionMicrophone')
  }
}

function getStatusLabel(
  status: SystemPermissionStatus,
  t: ReturnType<typeof useAppTranslation>['t']
) {
  switch (status) {
    case 'granted':
      return t('permissionStatusGranted')
    case 'denied':
      return t('permissionStatusDenied')
    case 'undetermined':
      return t('permissionStatusUndetermined')
    case 'limited':
      return t('permissionStatusLimited')
    case 'unavailable':
      return t('permissionStatusUnavailable')
  }
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#F5F6F7'
  },
  content: {
    padding: 16
  },
  card: {
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden'
  },
  row: {
    minHeight: 72,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12
  },
  rowText: {
    flex: 1
  },
  label: {
    color: '#222222',
    fontSize: 16,
    lineHeight: 22
  },
  status: {
    marginTop: 4,
    color: '#8A94A6',
    fontSize: 13,
    lineHeight: 18
  },
  actions: {
    flexDirection: 'row',
    gap: 8
  },
  actionButton: {
    minWidth: 74,
    minHeight: 34,
    borderRadius: 17,
    backgroundColor: '#F2F6FF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12
  },
  actionText: {
    color: '#337EFF',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600'
  },
  refreshButton: {
    marginTop: 16,
    minHeight: 46,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  refreshText: {
    color: '#337EFF',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600'
  },
  loadingOverlay: {
    marginTop: 18,
    alignItems: 'center'
  }
})

export default SystemPermissionsScreen
