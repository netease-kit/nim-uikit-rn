import { router, Stack } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { useAppTranslation } from '@/hooks/useAppTranslation'
import { useNavigationLock } from '@/hooks/useNavigationLock'
import { toast } from '@/src/NEUIKit/common/utils/toast'
import {
  resolveUIKitProfileRoute,
  UIKitEmptyState,
  UIKitOutlineButton,
  UIKitRowDivider,
  UIKitUserAvatar,
  UIKitWhitePage
} from '@/src/NEUIKit/rn'
import { friendStore, nimStore, userStore } from '@/stores'
import { getDisplayErrorMessage } from '@/utils/error-message'
import { V2NIMFriendAddApplicationStatus } from '@/utils/nim-sdk'

const VALID_LIST_ROW_HEIGHT = 72
const VALID_LIST_INITIAL_RENDER_COUNT = 10
const VALID_LIST_BATCH_RENDER_COUNT = 8
const VALID_LIST_WINDOW_SIZE = 8

function getErrorMessage(error: unknown, fallback: string) {
  return getDisplayErrorMessage(error, fallback)
}

const ValidListScreen = observer(() => {
  const { t } = useAppTranslation()
  const { runWithNavigationLock } = useNavigationLock()
  const [loading, setLoading] = useState(false)
  const [loadFailed, setLoadFailed] = useState(false)

  const loadApplications = useCallback(async () => {
    setLoading(true)
    setLoadFailed(false)

    try {
      await friendStore.refreshAll()
      await userStore.fetchUsers(
        friendStore.applications.flatMap((item) => [
          item.applicantAccountId,
          item.recipientAccountId
        ])
      )
    } catch (error) {
      setLoadFailed(true)
      toast.alert(
        t('commonLoadingFailed'),
        getErrorMessage(error, t('contactsValidListLoadFailed'))
      )
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    loadApplications().catch(() => undefined)
  }, [loadApplications])

  useEffect(() => {
    friendStore.markApplicationsRead().catch(() => undefined)
  }, [])
  const currentAccountId = nimStore.getLoginUser()
  const deduplicatedApplications = friendStore.deduplicatedApplications

  const openProfile = useCallback(
    (accountId: string) => {
      if (!accountId) {
        return
      }

      if (accountId === currentAccountId) {
        runWithNavigationLock(() => {
          router.push('/user/my-detail' as never)
        })
        return
      }

      resolveUIKitProfileRoute(accountId).then((pathname) => {
        runWithNavigationLock(() => {
          router.push({
            pathname,
            params: { accountId }
          } as never)
        })
      })
    },
    [currentAccountId, runWithNavigationLock]
  )

  return (
    <UIKitWhitePage style={styles.container}>
      <Stack.Screen
        options={{
          title: t('contactsValidListTitle'),
          headerTitleAlign: 'center',
          headerShown: true,
          headerRight: () => (
            <TouchableOpacity
              onPress={async () => {
                try {
                  await friendStore.clearApplications()
                  toast.success(t('contactsValidListClearSuccess'))
                } catch (error) {
                  toast.alert(
                    t('contactsValidListClearFailed'),
                    getErrorMessage(error, t('commonRetryLater'))
                  )
                }
              }}
            >
              <ThemedText style={styles.headerActionText}>{t('commonClear')}</ThemedText>
            </TouchableOpacity>
          )
        }}
      />
      <FlatList
        data={deduplicatedApplications}
        keyExtractor={(item) => `${item.applicantAccountId}-${item.timestamp}`}
        removeClippedSubviews
        initialNumToRender={VALID_LIST_INITIAL_RENDER_COUNT}
        maxToRenderPerBatch={VALID_LIST_BATCH_RENDER_COUNT}
        windowSize={VALID_LIST_WINDOW_SIZE}
        updateCellsBatchingPeriod={16}
        getItemLayout={(_, index) => ({
          length: VALID_LIST_ROW_HEIGHT,
          offset: VALID_LIST_ROW_HEIGHT * index,
          index
        })}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            {loading ? (
              <ActivityIndicator color="#337EFF" />
            ) : loadFailed ? (
              <>
                <ThemedText style={styles.emptyBodyText}>
                  {t('contactsValidListLoadFailed')}
                </ThemedText>
                <TouchableOpacity style={styles.retryButton} onPress={loadApplications}>
                  <ThemedText style={styles.retryButtonText}>{t('commonRetry')}</ThemedText>
                </TouchableOpacity>
              </>
            ) : (
              <UIKitEmptyState title={t('contactsValidListEmpty')} />
            )}
          </View>
        }
        renderItem={({ item, index }) => {
          const isApplicant = item.applicantAccountId === currentAccountId
          const displayAccountId = isApplicant ? item.recipientAccountId : item.applicantAccountId
          const displayName = userStore.getDisplayName(displayAccountId, displayAccountId)
          const primaryText =
            item.status ===
              V2NIMFriendAddApplicationStatus.V2NIM_FRIEND_ADD_APPLICATION_STATUS_AGREED &&
            isApplicant
              ? t('contactsValidListAgreedYourRequest', { name: displayName })
              : item.status ===
                    V2NIMFriendAddApplicationStatus.V2NIM_FRIEND_ADD_APPLICATION_STATUS_REJECTED &&
                  isApplicant
                ? t('contactsValidListRejectedYourRequest', { name: displayName })
                : displayName
          const secondaryText =
            item.status ===
              V2NIMFriendAddApplicationStatus.V2NIM_FRIEND_ADD_APPLICATION_STATUS_AGREED &&
            isApplicant
              ? t('contactsValidListFriendRequestAction')
              : item.status ===
                    V2NIMFriendAddApplicationStatus.V2NIM_FRIEND_ADD_APPLICATION_STATUS_REJECTED &&
                  isApplicant
                ? item.postscript || displayAccountId
                : t('contactsValidListFriendRequestAction')
          const isPendingInbound =
            item.status ===
              V2NIMFriendAddApplicationStatus.V2NIM_FRIEND_ADD_APPLICATION_STATUS_INIT &&
            !isApplicant

          return (
            <View style={styles.rowWrap}>
              <View style={styles.row}>
                <TouchableOpacity
                  activeOpacity={0.75}
                  accessibilityRole="button"
                  accessibilityLabel={displayName}
                  style={styles.profileArea}
                  onPress={() => openProfile(displayAccountId)}
                >
                  <UIKitUserAvatar account={displayAccountId} size={42} />
                  <View style={styles.rowBody}>
                    <ThemedText numberOfLines={1} style={styles.rowText}>
                      {primaryText}
                    </ThemedText>
                    <ThemedText numberOfLines={1} style={styles.rowSubText}>
                      {secondaryText}
                    </ThemedText>
                  </View>
                </TouchableOpacity>
                {isPendingInbound ? (
                  <View style={styles.actions}>
                    <UIKitOutlineButton
                      label={t('commonReject')}
                      tintColor="#D0D4DB"
                      style={styles.actionButton}
                      textStyle={styles.actionButtonText}
                      onPress={async () => {
                        try {
                          await friendStore.reject(item)
                        } catch (error) {
                          toast.alert(
                            t('contactsValidListRejectFailed'),
                            getErrorMessage(error, t('commonRetryLater'))
                          )
                        }
                      }}
                    />
                    <UIKitOutlineButton
                      label={t('commonAgree')}
                      style={styles.actionButton}
                      textStyle={styles.actionButtonText}
                      onPress={async () => {
                        try {
                          await friendStore.accept(item)
                        } catch (error) {
                          toast.alert(
                            t('contactsValidListAcceptFailed'),
                            getErrorMessage(error, t('commonRetryLater'))
                          )
                        }
                      }}
                    />
                  </View>
                ) : (
                  <View style={styles.statusWrap}>
                    <ThemedText style={styles.statusIcon}>
                      {item.status ===
                      V2NIMFriendAddApplicationStatus.V2NIM_FRIEND_ADD_APPLICATION_STATUS_REJECTED
                        ? 'x'
                        : '✓'}
                    </ThemedText>
                    <ThemedText style={styles.statusText}>
                      {friendStore.getApplicationStatusLabel(item.status)}
                    </ThemedText>
                  </View>
                )}
              </View>
              {index < deduplicatedApplications.length - 1 ? <UIKitRowDivider /> : null}
            </View>
          )
        }}
        contentContainerStyle={
          deduplicatedApplications.length === 0 ? styles.emptyContent : undefined
        }
      />
    </UIKitWhitePage>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  headerActionText: {
    color: '#337EFF',
    fontSize: 17,
    fontWeight: '400'
  },
  emptyState: {
    flex: 1,
    paddingTop: 72,
    alignItems: 'center',
    gap: 12
  },
  emptyBodyText: {
    color: '#A6AFBB'
  },
  emptyContent: {
    flexGrow: 1
  },
  retryButton: {
    minHeight: 36,
    minWidth: 96,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#FFF1F2'
  },
  retryButtonText: {
    color: '#337EFF',
    fontWeight: '700'
  },
  rowWrap: {
    backgroundColor: '#FFFFFF'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: VALID_LIST_ROW_HEIGHT,
    paddingHorizontal: 20,
    gap: 12
  },
  profileArea: {
    flex: 1,
    minWidth: 0,
    minHeight: VALID_LIST_ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  rowBody: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center'
  },
  rowText: {
    color: '#000000',
    fontSize: 16,
    lineHeight: 22
  },
  rowSubText: {
    marginTop: 4,
    color: '#888888',
    fontSize: 14,
    lineHeight: 20
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    gap: 8
  },
  actionButton: {
    width: 52,
    minWidth: 52,
    height: 30,
    borderRadius: 6,
    paddingHorizontal: 0
  },
  actionButtonText: {
    fontSize: 14,
    lineHeight: 18
  },
  statusWrap: {
    minWidth: 88,
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    marginLeft: 8
  },
  statusIcon: {
    color: '#D6DBE4',
    fontSize: 18,
    lineHeight: 20,
    fontWeight: '700'
  },
  statusText: {
    color: '#C6CDD7',
    fontSize: 17,
    lineHeight: 24
  }
})

export default ValidListScreen
