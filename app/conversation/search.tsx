import { router, Stack } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React, { useMemo, useState } from 'react'
import { Alert, FlatList, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { conversationStore, friendStore, nimStore, teamStore, userStore } from '@/stores'

type SearchResult =
  | { key: string; type: 'conversation'; title: string; subtitle: string; conversationId: string }
  | { key: string; type: 'friend'; title: string; subtitle: string; accountId: string }
  | { key: string; type: 'team'; title: string; subtitle: string; teamId: string }

const ConversationSearchScreen = observer(() => {
  const [keyword, setKeyword] = useState('')
  const normalizedKeyword = keyword.trim().toLowerCase()

  const results = useMemo<SearchResult[]>(() => {
    if (!normalizedKeyword) {
      return []
    }

    const conversationMatches = conversationStore.search(keyword).map((item) => ({
      key: `conversation-${item.conversationId}`,
      type: 'conversation' as const,
      title: item.name || item.conversationId,
      subtitle: item.lastMessage?.text || '会话',
      conversationId: item.conversationId
    }))

    const friendMatches = friendStore.friendList
      .filter((item) => {
        const alias = (item.alias || '').toLowerCase()
        const name = (
          item.userProfile?.name || userStore.getDisplayName(item.accountId)
        ).toLowerCase()
        return (
          alias.includes(normalizedKeyword) ||
          name.includes(normalizedKeyword) ||
          item.accountId.toLowerCase().includes(normalizedKeyword)
        )
      })
      .map((item) => ({
        key: `friend-${item.accountId}`,
        type: 'friend' as const,
        title: item.alias || item.userProfile?.name || userStore.getDisplayName(item.accountId),
        subtitle: item.accountId,
        accountId: item.accountId
      }))

    const teamMatches = teamStore.teamList
      .filter((item) => (item.name || item.teamId).toLowerCase().includes(normalizedKeyword))
      .map((item) => ({
        key: `team-${item.teamId}`,
        type: 'team' as const,
        title: item.name || item.teamId,
        subtitle: `群号 ${item.teamId}`,
        teamId: item.teamId
      }))

    return [...conversationMatches, ...friendMatches, ...teamMatches]
  }, [keyword, normalizedKeyword])

  const handlePress = async (item: SearchResult) => {
    if (item.type === 'conversation') {
      router.push({ pathname: '/chat/[id]', params: { id: item.conversationId } })
      return
    }

    if (item.type === 'friend') {
      if (!friendStore.friends.has(item.accountId) && nimStore.getLoginUser() !== item.accountId) {
        Alert.alert('无法打开', '该联系人已失效，请重新选择有效联系人')
        return
      }

      const conversationId = nimStore.nim?.V2NIMConversationIdUtil.p2pConversationId(item.accountId)
      if (!conversationId) {
        return
      }

      try {
        await conversationStore.createConversation(conversationId)
        router.push({ pathname: '/chat/[id]', params: { id: conversationId } })
      } catch (error) {
        Alert.alert('打开失败', error instanceof Error ? error.message : '请稍后重试')
      }
      return
    }

    if (!teamStore.getTeam(item.teamId)) {
      Alert.alert('无法打开', '该群聊已失效，请重新选择有效群聊')
      return
    }

    const conversationId = nimStore.nim?.V2NIMConversationIdUtil.teamConversationId(item.teamId)
    if (!conversationId) {
      Alert.alert('无法打开', '该群聊会话已失效，请重新选择有效群聊')
      return
    }

    try {
      await conversationStore.createConversation(conversationId)
      router.push({ pathname: '/chat/[id]', params: { id: conversationId } })
    } catch (error) {
      Alert.alert('打开失败', error instanceof Error ? error.message : '请稍后重试')
    }
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: '搜索',
          headerTitleAlign: 'center',
          headerShown: true,
          headerRight: () => (
            <TouchableOpacity
              style={styles.headerAction}
              onPress={() => router.push('/conversation/picker' as never)}
            >
              <ThemedText style={styles.headerActionText}>建群</ThemedText>
            </TouchableOpacity>
          )
        }}
      />

      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder="搜索会话 / 好友 / 群组"
          value={keyword}
          onChangeText={setKeyword}
        />
        {!!keyword && (
          <TouchableOpacity style={styles.clearButton} onPress={() => setKeyword('')}>
            <ThemedText style={styles.clearText}>清空</ThemedText>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.key}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <ThemedText>{normalizedKeyword ? '未命中任何结果' : '输入关键词开始搜索'}</ThemedText>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => handlePress(item)}>
            <View style={styles.resultHeader}>
              <ThemedText type="defaultSemiBold">{item.title}</ThemedText>
              <View style={styles.resultTypeBadge}>
                <ThemedText style={styles.resultTypeBadgeText}>
                  {item.type === 'conversation' ? '会话' : item.type === 'friend' ? '好友' : '群聊'}
                </ThemedText>
              </View>
            </View>
            <ThemedText style={styles.subText}>{item.subtitle}</ThemedText>
          </TouchableOpacity>
        )}
      />
    </ThemedView>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  searchRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12
  },
  headerAction: {
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerActionText: {
    color: '#337EFF',
    fontWeight: '700'
  },
  input: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECE8E5',
    paddingHorizontal: 14
  },
  clearButton: {
    minWidth: 72,
    borderRadius: 14,
    backgroundColor: '#F4F4F5',
    alignItems: 'center',
    justifyContent: 'center'
  },
  clearText: {
    color: '#4B5563',
    fontWeight: '700'
  },
  emptyState: {
    paddingTop: 56,
    alignItems: 'center'
  },
  card: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECE8E5',
    marginBottom: 12
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12
  },
  resultTypeBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#FFF2EC'
  },
  resultTypeBadgeText: {
    color: '#337EFF',
    fontSize: 11,
    fontWeight: '700'
  },
  subText: {
    marginTop: 4,
    fontSize: 12,
    color: '#6B7280'
  }
})

export default ConversationSearchScreen
