import { router, Stack } from 'expo-router'
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
  UIKitIcon,
  UIKitOutlineButton,
  UIKitRowDivider,
  UIKitUserAvatar,
  UIKitWhitePage
} from '@/src/NEUIKit/rn'
import { friendStore, userStore } from '@/stores'

const BlacklistScreen = observer(() => {
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
      Alert.alert('加载失败', error instanceof Error ? error.message : '黑名单加载失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadBlacklist().catch(() => undefined)
  }, [loadBlacklist])

  return (
    <UIKitWhitePage style={styles.container}>
      <Stack.Screen
        options={{
          title: '黑名单',
          headerTitleAlign: 'center',
          headerShown: true,
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push('/friend/add' as never)}>
              <UIKitIcon type="icon-tianjiaanniu" size={28} tintColor="#333333" />
            </TouchableOpacity>
          )
        }}
      />
      <ThemedText style={styles.tipText}>你不会收到列表中任何联系人的消息</ThemedText>
      <FlatList
        data={friendStore.blockList}
        keyExtractor={(item) => item}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            {loading ? (
              <ActivityIndicator color="#337EFF" />
            ) : loadFailed ? (
              <>
                <ThemedText style={styles.emptyBodyText}>黑名单加载失败</ThemedText>
                <TouchableOpacity style={styles.retryButton} onPress={loadBlacklist}>
                  <ThemedText style={styles.retryButtonText}>重试</ThemedText>
                </TouchableOpacity>
              </>
            ) : (
              <UIKitEmptyState title="暂无黑名单成员" />
            )}
          </View>
        }
        renderItem={({ item, index }) => {
          const displayName = userStore.getDisplayName(item, item)

          return (
            <View style={styles.rowWrap}>
              <View style={styles.row}>
                <UIKitUserAvatar account={item} size={54} />
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
                  label="解除"
                  style={styles.button}
                  onPress={() =>
                    Alert.alert('移出黑名单', '确认将该联系人移出黑名单？', [
                      { text: '取消', style: 'cancel' },
                      {
                        text: '确定',
                        style: 'destructive',
                        onPress: async () => {
                          try {
                            await friendStore.removeFromBlockList(item)
                          } catch (error) {
                            Alert.alert(
                              '操作失败',
                              error instanceof Error ? error.message : '请稍后重试'
                            )
                          }
                        }
                      }
                    ])
                  }
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
