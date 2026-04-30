import { Stack } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import {
  UIKitEmptyState,
  UIKitOutlineButton,
  UIKitRowDivider,
  UIKitUserAvatar,
  UIKitWhitePage
} from '@/src/NEUIKit/rn'
import { friendStore, nimStore, userStore } from '@/stores'
import { V2NIMFriendAddApplicationStatus } from '@/utils/nim-sdk'

const ValidListScreen = observer(() => {
  const [loading, setLoading] = useState(false)
  const [loadFailed, setLoadFailed] = useState(false)

  const loadApplications = useCallback(async () => {
    setLoading(true)
    setLoadFailed(false)

    try {
      await friendStore.refreshAll()
      await friendStore.markApplicationsRead()
      await userStore.fetchUsers(
        friendStore.applications.flatMap((item) => [
          item.applicantAccountId,
          item.recipientAccountId
        ])
      )
    } catch (error) {
      setLoadFailed(true)
      Alert.alert('加载失败', error instanceof Error ? error.message : '验证消息加载失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadApplications().catch(() => undefined)
  }, [loadApplications])
  const currentAccountId = nimStore.getLoginUser()

  return (
    <UIKitWhitePage style={styles.container}>
      <Stack.Screen
        options={{
          title: '验证消息',
          headerTitleAlign: 'center',
          headerShown: true,
          headerRight: () => (
            <TouchableOpacity
              onPress={() =>
                Alert.alert('清空验证消息', '确认清空当前验证消息记录？', [
                  { text: '取消', style: 'cancel' },
                  {
                    text: '确定',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        await friendStore.clearApplications()
                      } catch (error) {
                        Alert.alert(
                          '清空失败',
                          error instanceof Error ? error.message : '请稍后重试'
                        )
                      }
                    }
                  }
                ])
              }
            >
              <ThemedText style={styles.headerActionText}>清空</ThemedText>
            </TouchableOpacity>
          )
        }}
      />
      <FlatList
        data={friendStore.applications}
        keyExtractor={(item) => `${item.applicantAccountId}-${item.timestamp}`}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            {loading ? (
              <ActivityIndicator color="#337EFF" />
            ) : loadFailed ? (
              <>
                <ThemedText style={styles.emptyBodyText}>验证消息加载失败</ThemedText>
                <TouchableOpacity style={styles.retryButton} onPress={loadApplications}>
                  <ThemedText style={styles.retryButtonText}>重试</ThemedText>
                </TouchableOpacity>
              </>
            ) : (
              <UIKitEmptyState title="暂无验证消息" />
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
              ? `${displayName} 同意了你的好友请求`
              : item.status ===
                    V2NIMFriendAddApplicationStatus.V2NIM_FRIEND_ADD_APPLICATION_STATUS_REJECTED &&
                  isApplicant
                ? `${displayName} 拒绝了你的好友请求`
                : item.postscript || `${displayName} 好友申请`
          const isPendingInbound =
            item.status ===
              V2NIMFriendAddApplicationStatus.V2NIM_FRIEND_ADD_APPLICATION_STATUS_INIT &&
            !isApplicant

          return (
            <View style={styles.rowWrap}>
              <View style={styles.row}>
                <UIKitUserAvatar account={displayAccountId} size={54} />
                <View style={styles.rowBody}>
                  <ThemedText numberOfLines={1} style={styles.rowText}>
                    {primaryText}
                  </ThemedText>
                  {displayAccountId !== displayName ? (
                    <ThemedText numberOfLines={1} style={styles.rowSubText}>
                      {displayAccountId}
                    </ThemedText>
                  ) : null}
                </View>
                {isPendingInbound ? (
                  <View style={styles.actions}>
                    <UIKitOutlineButton
                      label="拒绝"
                      tintColor="#D0D4DB"
                      style={styles.actionButton}
                      onPress={async () => {
                        try {
                          await friendStore.reject(item)
                        } catch (error) {
                          Alert.alert(
                            '拒绝失败',
                            error instanceof Error ? error.message : '请稍后重试'
                          )
                        }
                      }}
                    />
                    <UIKitOutlineButton
                      label="同意"
                      style={styles.actionButton}
                      onPress={async () => {
                        try {
                          await friendStore.accept(item)
                        } catch (error) {
                          Alert.alert(
                            '同意失败',
                            error instanceof Error ? error.message : '请稍后重试'
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
              {index < friendStore.applications.length - 1 ? <UIKitRowDivider /> : null}
            </View>
          )
        }}
        contentContainerStyle={
          friendStore.applications.length === 0 ? styles.emptyContent : undefined
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
    minHeight: 90,
    paddingHorizontal: 20,
    gap: 14
  },
  rowBody: {
    flex: 1,
    justifyContent: 'center'
  },
  rowText: {
    color: '#333333',
    fontSize: 17,
    lineHeight: 24
  },
  rowSubText: {
    marginTop: 2,
    color: '#A6AFBB',
    fontSize: 14,
    lineHeight: 20
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginLeft: 8
  },
  actionButton: {
    minWidth: 84
  },
  statusWrap: {
    minWidth: 88,
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
