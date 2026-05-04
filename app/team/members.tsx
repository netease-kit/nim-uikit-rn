import { router, Stack, useLocalSearchParams } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { getUIKitAppellation, UIKitPage, UIKitSearchBar, UIKitUserAvatar } from '@/src/NEUIKit/rn'
import { friendStore, teamStore, userStore } from '@/stores'
import { V2NIMTeamMemberRole } from '@/utils/nim-sdk'

const TeamMembersScreen = observer(() => {
  const { teamId } = useLocalSearchParams<{ teamId?: string }>()
  const resolvedTeamId = typeof teamId === 'string' ? teamId : ''
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadFailed, setLoadFailed] = useState(false)

  const loadMembers = useCallback(async () => {
    if (!resolvedTeamId) {
      return
    }

    setLoading(true)
    setLoadFailed(false)

    try {
      await teamStore.loadMembers(resolvedTeamId)
    } catch (error) {
      setLoadFailed(true)
      Alert.alert('加载失败', error instanceof Error ? error.message : '群成员加载失败')
    } finally {
      setLoading(false)
    }
  }, [resolvedTeamId])

  useEffect(() => {
    loadMembers().catch(() => undefined)
  }, [loadMembers])

  const myRole = teamStore.getMyMemberRole(resolvedTeamId)
  const canManage =
    myRole === V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_OWNER ||
    myRole === V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_MANAGER

  const members = teamStore.getMembers(resolvedTeamId)

  const filteredMembers = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase()
    return members
      .slice()
      .sort((left, right) => left.joinTime - right.joinTime)
      .filter((member) => {
        if (!normalizedKeyword) {
          return true
        }

        const name =
          getUIKitAppellation({
            account: member.accountId,
            teamId: resolvedTeamId
          }) || member.accountId

        return (
          name.toLowerCase().includes(normalizedKeyword) ||
          member.accountId.toLowerCase().includes(normalizedKeyword)
        )
      })
  }, [keyword, members, resolvedTeamId])

  return (
    <UIKitPage style={styles.page}>
      <Stack.Screen
        options={{
          title: '群成员',
          headerTitleAlign: 'center',
          headerRight: canManage
            ? () => (
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: '/team/member-picker',
                      params: { teamId: resolvedTeamId }
                    } as never)
                  }
                >
                  <ThemedText style={styles.headerAction}>邀请</ThemedText>
                </Pressable>
              )
            : undefined
        }}
      />

      <View style={styles.content}>
        <UIKitSearchBar
          value={keyword}
          onChangeText={setKeyword}
          placeholder="搜索群成员"
          style={styles.searchBar}
        />

        <FlatList
          data={filteredMembers}
          keyExtractor={(item) => item.accountId}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              {loading ? (
                <ActivityIndicator color="#337EFF" />
              ) : loadFailed ? (
                <>
                  <ThemedText>群成员加载失败</ThemedText>
                  <Pressable
                    style={styles.retryButton}
                    onPress={() => loadMembers().catch(() => undefined)}
                  >
                    <ThemedText style={styles.retryText}>重试</ThemedText>
                  </Pressable>
                </>
              ) : (
                <ThemedText>{keyword.trim() ? '未找到匹配成员' : '暂无群成员'}</ThemedText>
              )}
            </View>
          }
          renderItem={({ item, index }) => {
            const friend = friendStore.friends.get(item.accountId)
            const name =
              getUIKitAppellation({
                account: item.accountId,
                teamId: resolvedTeamId
              }) || item.accountId
            const roleText =
              item.memberRole === V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_OWNER
                ? '群主'
                : item.memberRole === V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_MANAGER
                  ? '管理员'
                  : '成员'
            const canKick =
              canManage &&
              item.accountId !== userStore.selfProfile?.accountId &&
              item.memberRole !== V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_OWNER &&
              !(
                myRole === V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_MANAGER &&
                item.memberRole === V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_MANAGER
              )

            return (
              <View style={[styles.row, index === filteredMembers.length - 1 && styles.rowLast]}>
                <Pressable
                  style={styles.memberMeta}
                  onPress={() =>
                    router.push({
                      pathname: '/friend/friend-card',
                      params: { accountId: item.accountId }
                    } as never)
                  }
                >
                  <UIKitUserAvatar
                    account={item.accountId}
                    avatar={friend?.userProfile?.avatar}
                    size={44}
                  />
                  <View style={styles.metaText}>
                    <ThemedText style={styles.memberTitle}>{name}</ThemedText>
                    <ThemedText style={styles.memberSubtitle}>
                      {item.accountId} · {roleText}
                      {item.chatBanned ? ' · 已禁言' : ''}
                    </ThemedText>
                  </View>
                </Pressable>
                {canKick ? (
                  <Pressable
                    style={styles.kickButton}
                    onPress={() =>
                      Alert.alert('移除成员', `确认将 ${name} 移出群聊？`, [
                        { text: '取消', style: 'cancel' },
                        {
                          text: '确定',
                          style: 'destructive',
                          onPress: async () => {
                            try {
                              await teamStore.kickMembers(resolvedTeamId, [item.accountId])
                            } catch (error) {
                              Alert.alert(
                                '移除失败',
                                error instanceof Error ? error.message : '请稍后重试'
                              )
                            }
                          }
                        }
                      ])
                    }
                  >
                    <ThemedText style={styles.kickButtonText}>移除</ThemedText>
                  </Pressable>
                ) : null}
              </View>
            )
          }}
        />
      </View>
    </UIKitPage>
  )
})

const styles = StyleSheet.create({
  page: {
    flex: 1
  },
  content: {
    flex: 1,
    padding: 16
  },
  headerAction: {
    color: '#337EFF',
    fontWeight: '700'
  },
  searchBar: {
    marginBottom: 12
  },
  listContent: {
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden'
  },
  emptyState: {
    paddingVertical: 56,
    alignItems: 'center',
    gap: 12
  },
  retryButton: {
    minHeight: 40,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: '#337EFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '700'
  },
  row: {
    minHeight: 78,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EEF2F7'
  },
  rowLast: {
    borderBottomWidth: 0
  },
  memberMeta: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14
  },
  metaText: {
    flex: 1
  },
  memberTitle: {
    color: '#333333',
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '500'
  },
  memberSubtitle: {
    marginTop: 4,
    color: '#98A1AD',
    fontSize: 13,
    lineHeight: 18
  },
  kickButton: {
    minWidth: 64,
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: 17,
    backgroundColor: '#FFF1F2',
    alignItems: 'center',
    justifyContent: 'center'
  },
  kickButtonText: {
    color: '#EE6867',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600'
  }
})

export default TeamMembersScreen
