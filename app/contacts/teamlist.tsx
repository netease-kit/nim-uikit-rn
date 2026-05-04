import { router, Stack } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { UIKitEmptyState, UIKitRowDivider, UIKitUserAvatar, UIKitWhitePage } from '@/src/NEUIKit/rn'
import { conversationStore, nimStore, teamStore } from '@/stores'

const TeamListScreen = observer(() => {
  const [loading, setLoading] = useState(false)
  const [loadFailed, setLoadFailed] = useState(false)

  const loadTeams = useCallback(async () => {
    setLoading(true)
    setLoadFailed(false)

    try {
      await teamStore.refreshJoinedTeams()
    } catch (error) {
      setLoadFailed(true)
      Alert.alert('加载失败', error instanceof Error ? error.message : '群聊列表加载失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTeams().catch(() => undefined)
  }, [loadTeams])

  return (
    <UIKitWhitePage style={styles.container}>
      <Stack.Screen
        options={{ title: '我的群聊', headerTitleAlign: 'center', headerShown: true }}
      />
      <FlatList
        data={teamStore.teamList}
        keyExtractor={(item) => item.teamId}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            {loading ? (
              <ActivityIndicator color="#337EFF" />
            ) : loadFailed ? (
              <>
                <ThemedText style={styles.emptyBodyText}>群聊列表加载失败</ThemedText>
                <Pressable style={styles.retryButton} onPress={loadTeams}>
                  <ThemedText style={styles.retryButtonText}>重试</ThemedText>
                </Pressable>
              </>
            ) : (
              <UIKitEmptyState title="暂无群聊" />
            )}
          </View>
        }
        renderItem={({ item, index }) => (
          <View style={styles.rowWrap}>
            <Pressable
              style={styles.row}
              onPress={async () => {
                const conversationId = nimStore.nim?.V2NIMConversationIdUtil.teamConversationId(
                  item.teamId
                )

                if (!conversationId) {
                  Alert.alert('打开失败', '当前群聊会话不可用')
                  return
                }

                try {
                  await conversationStore.createConversation(conversationId)
                  router.push({ pathname: '/chat/[id]', params: { id: conversationId } })
                } catch (error) {
                  Alert.alert('打开失败', error instanceof Error ? error.message : '请稍后重试')
                }
              }}
            >
              <UIKitUserAvatar
                account={item.teamId || item.name || '群聊'}
                avatar={item.avatar}
                size={64}
              />
              <View style={styles.rowBody}>
                <ThemedText numberOfLines={1} style={styles.nameText}>
                  {item.name || item.teamId}
                </ThemedText>
              </View>
            </Pressable>
            {index < teamStore.teamList.length - 1 ? <UIKitRowDivider /> : null}
          </View>
        )}
        contentContainerStyle={teamStore.teamList.length === 0 ? styles.emptyContent : undefined}
      />
    </UIKitWhitePage>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1
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
    minHeight: 92,
    paddingHorizontal: 20,
    gap: 18
  },
  rowBody: {
    flex: 1
  },
  nameText: {
    color: '#333333',
    fontSize: 17,
    lineHeight: 24
  }
})

export default TeamListScreen
