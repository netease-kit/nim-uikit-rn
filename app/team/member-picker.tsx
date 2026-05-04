import { router, Stack, useLocalSearchParams } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import {
  UIKitPage,
  UIKitSearchBar,
  UIKitSelectionIndicator,
  UIKitUserAvatar
} from '@/src/NEUIKit/rn'
import { friendStore, teamStore, userStore } from '@/stores'

const TeamMemberPickerScreen = observer(() => {
  const { teamId } = useLocalSearchParams<{ teamId?: string }>()
  const resolvedTeamId = typeof teamId === 'string' ? teamId : ''
  const [keyword, setKeyword] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
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
      Alert.alert('加载失败', error instanceof Error ? error.message : '可邀请成员加载失败')
    } finally {
      setLoading(false)
    }
  }, [resolvedTeamId])

  useEffect(() => {
    loadMembers().catch(() => undefined)
  }, [loadMembers])

  const normalizedKeyword = keyword.trim().toLowerCase()

  const candidates = useMemo(() => {
    const existingMemberIds = new Set(
      teamStore.getMembers(resolvedTeamId).map((item) => item.accountId)
    )

    return friendStore.friendList.filter((friend) => {
      if (existingMemberIds.has(friend.accountId)) {
        return false
      }

      if (!normalizedKeyword) {
        return true
      }

      const displayName =
        friend.alias || friend.userProfile?.name || userStore.getDisplayName(friend.accountId)

      return (
        displayName.toLowerCase().includes(normalizedKeyword) ||
        friend.accountId.toLowerCase().includes(normalizedKeyword)
      )
    })
  }, [normalizedKeyword, resolvedTeamId])

  const toggleSelect = (accountId: string) => {
    setSelectedIds((current) =>
      current.includes(accountId)
        ? current.filter((item) => item !== accountId)
        : [...current, accountId]
    )
  }

  const handleInvite = async () => {
    if (selectedIds.length === 0 || submitting) {
      return
    }

    setSubmitting(true)

    try {
      await teamStore.inviteMembers(resolvedTeamId, selectedIds)
      router.back()
    } catch (error) {
      Alert.alert('邀请失败', error instanceof Error ? error.message : '请稍后重试')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <UIKitPage style={styles.page}>
      <Stack.Screen options={{ title: '创建群组', headerTitleAlign: 'center' }} />

      <View style={styles.content}>
        <UIKitSearchBar
          value={keyword}
          onChangeText={setKeyword}
          placeholder="搜索好友"
          style={styles.searchBar}
        />

        <View style={styles.summaryRow}>
          <ThemedText style={styles.summaryTitle}>已选 {selectedIds.length} 人</ThemedText>
          <ThemedText style={styles.summarySubtitle}>选择后将直接邀请加入群聊</ThemedText>
        </View>

        <FlatList
          data={candidates}
          keyExtractor={(item) => item.accountId}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              {loading ? (
                <ActivityIndicator color="#337EFF" />
              ) : loadFailed ? (
                <>
                  <ThemedText>可邀请成员加载失败</ThemedText>
                  <Pressable
                    style={styles.retryButton}
                    onPress={() => loadMembers().catch(() => undefined)}
                  >
                    <ThemedText style={styles.retryText}>重试</ThemedText>
                  </Pressable>
                </>
              ) : (
                <ThemedText>{normalizedKeyword ? '未找到可邀请好友' : '暂无可邀请好友'}</ThemedText>
              )}
            </View>
          }
          renderItem={({ item, index }) => {
            const displayName =
              item.alias || item.userProfile?.name || userStore.getDisplayName(item.accountId)
            const isSelected = selectedIds.includes(item.accountId)

            return (
              <Pressable
                style={[styles.row, index === candidates.length - 1 && styles.rowLast]}
                onPress={() => toggleSelect(item.accountId)}
              >
                <UIKitSelectionIndicator selected={isSelected} />
                <UIKitUserAvatar
                  account={item.accountId}
                  avatar={item.userProfile?.avatar}
                  size={44}
                />
                <View style={styles.meta}>
                  <ThemedText style={styles.rowTitle}>{displayName}</ThemedText>
                  <ThemedText style={styles.rowSubtitle}>{item.accountId}</ThemedText>
                </View>
              </Pressable>
            )
          }}
        />

        <Pressable
          style={[
            styles.submitButton,
            (selectedIds.length === 0 || submitting) && styles.submitDisabled
          ]}
          onPress={handleInvite}
          disabled={selectedIds.length === 0 || submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <ThemedText style={styles.submitText}>确定</ThemedText>
          )}
        </Pressable>
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
  searchBar: {
    marginBottom: 12
  },
  summaryRow: {
    marginBottom: 12,
    paddingHorizontal: 4
  },
  summaryTitle: {
    color: '#333333',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600'
  },
  summarySubtitle: {
    marginTop: 4,
    color: '#98A1AD',
    fontSize: 13,
    lineHeight: 18
  },
  listContent: {
    flexGrow: 1,
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
    gap: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EEF2F7'
  },
  rowLast: {
    borderBottomWidth: 0
  },
  meta: {
    flex: 1
  },
  rowTitle: {
    color: '#333333',
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '500'
  },
  rowSubtitle: {
    marginTop: 4,
    color: '#98A1AD',
    fontSize: 13,
    lineHeight: 18
  },
  submitButton: {
    marginTop: 16,
    minHeight: 50,
    borderRadius: 25,
    backgroundColor: '#337EFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  submitDisabled: {
    opacity: 0.45
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '600'
  }
})

export default TeamMemberPickerScreen
