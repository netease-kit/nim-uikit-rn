import { router, Stack, useLocalSearchParams } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React, { useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { UIKitIcon } from '@/src/NEUIKit/rn'
import { conversationStore, friendStore, nimStore, teamStore, userStore } from '@/stores'

const MAX_TEAM_MEMBERS = 200

const ConversationPickerScreen = observer(() => {
  const { seedAccountId } = useLocalSearchParams<{ seedAccountId?: string }>()
  const resolvedSeedAccountId = typeof seedAccountId === 'string' ? seedAccountId : ''
  const [keyword, setKeyword] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  const normalizedKeyword = keyword.trim().toLowerCase()
  const currentAccountId = nimStore.getLoginUser()

  const candidates = useMemo(() => {
    return friendStore.friendList.filter((friend) => {
      if (
        friend.accountId === currentAccountId ||
        friend.accountId === resolvedSeedAccountId ||
        friendStore.blockList.includes(friend.accountId)
      ) {
        return false
      }

      if (!normalizedKeyword) {
        return true
      }

      const displayName = (
        friend.alias ||
        friend.userProfile?.name ||
        userStore.getDisplayName(friend.accountId)
      ).toLowerCase()

      return (
        displayName.includes(normalizedKeyword) ||
        friend.accountId.toLowerCase().includes(normalizedKeyword)
      )
    })
  }, [currentAccountId, normalizedKeyword, resolvedSeedAccountId])

  const inviteeIds = useMemo(() => {
    return Array.from(new Set([...selectedIds, resolvedSeedAccountId].filter(Boolean)))
  }, [resolvedSeedAccountId, selectedIds])

  const toggleSelect = (accountId: string) => {
    setSelectedIds((current) => {
      if (current.includes(accountId)) {
        return current.filter((item) => item !== accountId)
      }

      if (current.length >= MAX_TEAM_MEMBERS) {
        Alert.alert('操作失败', `最多可选 ${MAX_TEAM_MEMBERS} 人`)
        return current
      }

      return [...current, accountId]
    })
  }

  const createTeamName = () => {
    const names = [
      currentAccountId ? userStore.getDisplayName(currentAccountId) : '',
      ...inviteeIds
        .map((accountId) => {
          const friend = friendStore.friends.get(accountId)
          return friend?.alias || friend?.userProfile?.name || userStore.getDisplayName(accountId)
        })
        .filter(Boolean)
    ].filter(Boolean)

    const joinedName = names.join('、')

    if (!joinedName) {
      return '群聊'
    }

    return joinedName.length > 30 ? `${joinedName.slice(0, 30)}...` : joinedName
  }

  const handleCreateTeam = async () => {
    if (inviteeIds.length === 0 || !nimStore.nim || submitting) {
      return
    }

    setSubmitting(true)

    try {
      const team = await teamStore.createTeam(createTeamName(), inviteeIds)

      if (!team) {
        return
      }

      const conversationId = nimStore.nim.V2NIMConversationIdUtil.teamConversationId(team.teamId)
      await conversationStore.createConversation(conversationId)
      router.replace({ pathname: '/chat/[id]', params: { id: conversationId } })
    } catch (error) {
      Alert.alert('创建失败', error instanceof Error ? error.message : '请稍后重试')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: '选择', headerTitleAlign: 'center' }} />

      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder="搜索好友"
          value={keyword}
          onChangeText={setKeyword}
        />
        {!!keyword && (
          <TouchableOpacity style={styles.clearButton} onPress={() => setKeyword('')}>
            <ThemedText style={styles.clearText}>清空</ThemedText>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.summaryRow}>
        <ThemedText type="defaultSemiBold">已选 {selectedIds.length} 人</ThemedText>
        <ThemedText style={styles.summaryMeta}>最多可选 {MAX_TEAM_MEMBERS} 人</ThemedText>
      </View>

      {resolvedSeedAccountId ? (
        <View style={styles.seedCard}>
          <ThemedText style={styles.seedLabel}>当前单聊成员将自动加入</ThemedText>
          <ThemedText type="defaultSemiBold">
            {userStore.getDisplayName(resolvedSeedAccountId)}
          </ThemedText>
          <ThemedText style={styles.subText}>{resolvedSeedAccountId}</ThemedText>
        </View>
      ) : null}

      <FlatList
        data={candidates}
        keyExtractor={(item) => item.accountId}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <ThemedText>{normalizedKeyword ? '未找到匹配好友' : '暂无可选好友'}</ThemedText>
          </View>
        }
        renderItem={({ item }) => {
          const isSelected = selectedIds.includes(item.accountId)
          const displayName =
            item.alias || item.userProfile?.name || userStore.getDisplayName(item.accountId)

          return (
            <Pressable style={styles.row} onPress={() => toggleSelect(item.accountId)}>
              <View style={[styles.avatar, isSelected && styles.avatarSelected]}>
                <ThemedText style={styles.avatarText}>
                  {displayName.slice(0, 1).toUpperCase()}
                </ThemedText>
              </View>
              <View style={styles.meta}>
                <ThemedText type="defaultSemiBold">{displayName}</ThemedText>
                <ThemedText style={styles.subText}>{item.accountId}</ThemedText>
              </View>
              <View style={[styles.checkCircle, isSelected && styles.checkCircleSelected]}>
                {isSelected ? <UIKitIcon type="icon-yidu" size={16} /> : null}
              </View>
            </Pressable>
          )
        }}
      />

      <TouchableOpacity
        style={[
          styles.submitButton,
          (inviteeIds.length === 0 || submitting) && styles.submitDisabled
        ]}
        onPress={handleCreateTeam}
        disabled={inviteeIds.length === 0 || submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <ThemedText style={styles.submitText}>确定</ThemedText>
        )}
      </TouchableOpacity>
    </ThemedView>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12
  },
  searchRow: {
    flexDirection: 'row',
    gap: 10
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
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  summaryMeta: {
    fontSize: 12,
    color: '#6B7280'
  },
  seedCard: {
    borderRadius: 18,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#F4D8CE',
    padding: 14
  },
  seedLabel: {
    marginBottom: 6,
    fontSize: 12,
    color: '#9A3412'
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 48
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECE8E5',
    padding: 14,
    marginBottom: 12
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#337EFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarSelected: {
    backgroundColor: '#A61F24'
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700'
  },
  meta: {
    flex: 1
  },
  subText: {
    marginTop: 4,
    fontSize: 12,
    color: '#6B7280'
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkCircleSelected: {
    backgroundColor: '#337EFF',
    borderColor: '#337EFF'
  },
  submitButton: {
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: '#337EFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  submitDisabled: {
    opacity: 0.5
  },
  submitText: {
    color: '#FFFFFF',
    fontWeight: '700'
  }
})

export default ConversationPickerScreen
