import { router, Stack } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { useAppTranslation } from '@/hooks/useAppTranslation'
import { useNavigationLock } from '@/hooks/useNavigationLock'
import { toast } from '@/src/NEUIKit/common/utils/toast'
import {
  getUIKitAppellation,
  UIKitEmptyState,
  UIKitIcon,
  UIKitOutlineButton,
  UIKitRowDivider,
  UIKitUserAvatar,
  UIKitWhitePage
} from '@/src/NEUIKit/rn'
import { friendStore, userStore } from '@/stores'
import { ensureNetworkAvailable } from '@/utils/network'

const BLACKLIST_ROW_HEIGHT = 90
const BLACKLIST_INITIAL_RENDER_COUNT = 10
const BLACKLIST_BATCH_RENDER_COUNT = 8
const BLACKLIST_WINDOW_SIZE = 8

const BlacklistScreen = observer(() => {
  const { t } = useAppTranslation()
  const { runWithNavigationLock } = useNavigationLock()
  const [loading, setLoading] = useState(false)
  const [loadFailed, setLoadFailed] = useState(false)

  const loadBlacklist = useCallback(async () => {
    setLoading(true)
    setLoadFailed(false)

    try {
      await friendStore.refreshAll()
      await userStore.fetchUsers(friendStore.blockList)
    } catch (error) {
      setLoadFailed(true)
      toast.alert(
        t('commonLoadingFailed'),
        error instanceof Error ? error.message : t('contactsBlacklistLoadFailed')
      )
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    loadBlacklist().catch(() => undefined)
  }, [loadBlacklist])

  return (
    <UIKitWhitePage style={styles.container}>
      <Stack.Screen
        options={{
          title: t('contactsBlacklistTitle'),
          headerTitleAlign: 'center',
          headerShown: true,
          headerRight: () => (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() =>
                runWithNavigationLock(() => {
                  router.push('/contacts/blacklist-picker' as never)
                })
              }
            >
              <UIKitIcon type="icon-addition" size={22} tintColor="#333333" />
            </TouchableOpacity>
          )
        }}
      />
      <ThemedText style={styles.tipText}>{t('contactsBlacklistTip')}</ThemedText>
      <FlatList
        data={friendStore.blockList}
        keyExtractor={(item) => item}
        removeClippedSubviews
        initialNumToRender={BLACKLIST_INITIAL_RENDER_COUNT}
        maxToRenderPerBatch={BLACKLIST_BATCH_RENDER_COUNT}
        windowSize={BLACKLIST_WINDOW_SIZE}
        updateCellsBatchingPeriod={16}
        getItemLayout={(_, index) => ({
          length: BLACKLIST_ROW_HEIGHT,
          offset: BLACKLIST_ROW_HEIGHT * index,
          index
        })}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            {loading ? (
              <ActivityIndicator color="#337EFF" />
            ) : loadFailed ? (
              <>
                <ThemedText style={styles.emptyBodyText}>
                  {t('contactsBlacklistLoadFailed')}
                </ThemedText>
                <TouchableOpacity style={styles.retryButton} onPress={loadBlacklist}>
                  <ThemedText style={styles.retryButtonText}>{t('commonRetry')}</ThemedText>
                </TouchableOpacity>
              </>
            ) : (
              <UIKitEmptyState title={t('contactsBlacklistEmpty')} />
            )}
          </View>
        }
        renderItem={({ item, index }) => {
          const displayName = getUIKitAppellation({ account: item }) || item

          return (
            <View style={styles.rowWrap}>
              <View style={styles.row}>
                <UIKitUserAvatar account={item} size={42} />
                <View style={styles.meta}>
                  <ThemedText numberOfLines={1} style={styles.nameText}>
                    {displayName}
                  </ThemedText>
                  {displayName !== item ? (
                    <ThemedText numberOfLines={1} style={styles.subText}>
                      {item}
                    </ThemedText>
                  ) : null}
                </View>
                <UIKitOutlineButton
                  label={t('commonRemove')}
                  style={styles.button}
                  onPress={async () => {
                    try {
                      await ensureNetworkAvailable()
                      await friendStore.removeFromBlockList(item)
                    } catch (error) {
                      toast.alert(
                        t('commonActionFailed'),
                        error instanceof Error ? error.message : t('commonNetworkUnavailable')
                      )
                    }
                  }}
                />
              </View>
              {index < friendStore.blockList.length - 1 ? <UIKitRowDivider /> : null}
            </View>
          )
        }}
        contentContainerStyle={friendStore.blockList.length === 0 ? styles.emptyContent : undefined}
      />
    </UIKitWhitePage>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  tipText: {
    color: '#B3BAC5',
    fontSize: 17,
    lineHeight: 24,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 10
  },
  headerButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center'
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
    minHeight: 90,
    paddingHorizontal: 20,
    gap: 14
  },
  meta: {
    flex: 1,
    gap: 2
  },
  subText: {
    color: '#A6AFBB',
    fontSize: 14,
    lineHeight: 20
  },
  nameText: {
    color: '#333333',
    fontSize: 17,
    lineHeight: 24
  },
  button: {
    minWidth: 92
  }
})

export default BlacklistScreen
