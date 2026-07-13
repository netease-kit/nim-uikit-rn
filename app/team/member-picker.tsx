import { router, Stack, useLocalSearchParams } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  ListRenderItemInfo,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { useAppTranslation } from '@/hooks/useAppTranslation'
import { toast } from '@/src/NEUIKit/common/utils/toast'
import {
  UIKitPage,
  UIKitSearchBar,
  UIKitSelectionIndicator,
  UIKitUserAvatar
} from '@/src/NEUIKit/rn'
import { friendStore, nimStore, teamStore, userStore } from '@/stores'
import { ensureNetworkAvailable, NETWORK_UNAVAILABLE_MESSAGE } from '@/utils/network'

type TeamMemberCandidate = {
  accountId: string
  displayName: string
  type: 'friend'
}

type TeamMemberRowProps = {
  item: TeamMemberCandidate
  isSelected: boolean
  isLast: boolean
  onPress: (accountId: string) => void
}

const TEAM_MEMBER_ROW_HEIGHT = 78
const TEAM_MEMBER_INITIAL_RENDER_COUNT = 12
const TEAM_MEMBER_BATCH_RENDER_COUNT = 10
const TEAM_MEMBER_WINDOW_SIZE = 8
const MAX_TEAM_INVITE_SELECTION = 200

const TeamMemberRow = React.memo(
  function TeamMemberRow({ item, isSelected, isLast, onPress }: TeamMemberRowProps) {
    return (
      <Pressable
        style={[styles.row, isLast && styles.rowLast]}
        onPress={() => onPress(item.accountId)}
      >
        <UIKitSelectionIndicator selected={isSelected} />
        <UIKitUserAvatar account={item.accountId} size={42} />
        <View style={styles.meta}>
          <ThemedText numberOfLines={1} ellipsizeMode="tail" style={styles.rowTitle}>
            {item.displayName}
          </ThemedText>
          <ThemedText style={styles.rowSubtitle}>{item.accountId}</ThemedText>
        </View>
      </Pressable>
    )
  },
  (prev, next) =>
    prev.isSelected === next.isSelected &&
    prev.isLast === next.isLast &&
    prev.item.accountId === next.item.accountId &&
    prev.item.displayName === next.item.displayName
)

const TeamMemberPickerScreen = observer(() => {
  const { t } = useAppTranslation()
  const { teamId } = useLocalSearchParams<{ teamId?: string }>()
  const resolvedTeamId = typeof teamId === 'string' ? teamId : ''
  const [keyword, setKeyword] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadFailed, setLoadFailed] = useState(false)
  const currentAccountId = nimStore.getLoginUser()
  const team = teamStore.getTeam(resolvedTeamId)
  const memberCount = team?.memberCount || teamStore.getMembers(resolvedTeamId).length
  const memberLimit = team?.memberLimit || 0

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
      toast.alert(
        t('commonLoadingFailed'),
        error instanceof Error ? error.message : t('teamInviteCandidatesLoadFailed')
      )
    } finally {
      setLoading(false)
    }
  }, [resolvedTeamId, t])

  useEffect(() => {
    loadMembers().catch(() => undefined)
  }, [loadMembers])

  const normalizedKeyword = keyword.trim().toLowerCase()
  const localFriendList = friendStore.friendList
  const blockList = friendStore.blockList
  const teamMembers = teamStore.getMembers(resolvedTeamId)
  const blockedAccountIds = useMemo(() => new Set(blockList), [blockList])
  const existingMemberIds = useMemo(
    () => new Set(teamMembers.map((item) => item.accountId)),
    [teamMembers]
  )

  const candidates = useMemo(() => {
    const friendCandidates: TeamMemberCandidate[] = localFriendList
      .filter((friend) => {
        return (
          friend.accountId !== currentAccountId &&
          !existingMemberIds.has(friend.accountId) &&
          !blockedAccountIds.has(friend.accountId)
        )
      })
      .map((friend) => ({
        accountId: friend.accountId,
        displayName:
          friend.alias || friend.userProfile?.name || userStore.getDisplayName(friend.accountId),
        type: 'friend'
      }))

    const mergedCandidates = friendCandidates.filter(
      (item, index, list) =>
        list.findIndex((candidate) => candidate.accountId === item.accountId) === index
    )

    if (!normalizedKeyword) {
      return mergedCandidates
    }

    return mergedCandidates.filter((item) =>
      `${item.displayName} ${item.accountId}`.toLowerCase().includes(normalizedKeyword)
    )
  }, [blockedAccountIds, currentAccountId, existingMemberIds, localFriendList, normalizedKeyword])

  const toggleSelect = useCallback(
    (accountId: string) => {
      setSelectedIds((current) => {
        if (current.includes(accountId)) {
          return current.filter((item) => item !== accountId)
        }

        if (current.length >= MAX_TEAM_INVITE_SELECTION) {
          toast.alert(
            t('commonTip'),
            t('commonAtMostSelectContacts', { count: MAX_TEAM_INVITE_SELECTION })
          )
          return current
        }

        return [...current, accountId]
      })
    },
    [t]
  )

  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds])

  const renderCandidateItem = useCallback(
    ({ item, index }: ListRenderItemInfo<TeamMemberCandidate>) => (
      <TeamMemberRow
        item={item}
        isSelected={selectedIdSet.has(item.accountId)}
        isLast={index === candidates.length - 1}
        onPress={toggleSelect}
      />
    ),
    [candidates.length, selectedIdSet, toggleSelect]
  )

  const handleInvite = async () => {
    if (selectedIds.length === 0 || submitting) {
      return
    }

    if (selectedIds.length > MAX_TEAM_INVITE_SELECTION) {
      toast.alert(
        t('commonTip'),
        t('commonAtMostSelectContacts', { count: MAX_TEAM_INVITE_SELECTION })
      )
      return
    }

    if (memberLimit > 0 && memberCount + selectedIds.length > memberLimit) {
      toast.alert(t('commonTip'), t('sdkErrorTeamMemberLimit'))
      return
    }

    setSubmitting(true)

    try {
      await ensureNetworkAvailable()
      await teamStore.inviteMembers(resolvedTeamId, selectedIds)
      router.back()
    } catch (error) {
      toast.alert(
        t('teamInviteMembersFailed'),
        error instanceof Error ? error.message : NETWORK_UNAVAILABLE_MESSAGE
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <UIKitPage style={styles.page}>
      <Stack.Screen
        options={{
          title: t('commonSelect'),
          headerTitleAlign: 'center',
          headerRight: () => (
            <TouchableOpacity
              disabled={selectedIds.length === 0 || submitting}
              onPress={() => {
                handleInvite().catch(() => undefined)
              }}
            >
              <ThemedText
                style={[
                  styles.headerAction,
                  (selectedIds.length === 0 || submitting) && styles.headerActionDisabled
                ]}
              >
                {t('actionDoneWithCount', { count: selectedIds.length })}
              </ThemedText>
            </TouchableOpacity>
          )
        }}
      />

      <View style={styles.content}>
        <UIKitSearchBar
          value={keyword}
          onChangeText={setKeyword}
          placeholder={t('commonSearchFriendsPlaceholder')}
          style={styles.searchBar}
        />

        <View style={styles.summaryRow}>
          <ThemedText style={styles.summaryTitle}>
            {t('commonSelectedCount', { count: selectedIds.length })}
          </ThemedText>
          <ThemedText style={styles.summarySubtitle}>{t('teamInviteSelectionHint')}</ThemedText>
        </View>

        <FlatList
          data={candidates}
          keyExtractor={(item) => item.accountId}
          contentContainerStyle={styles.listContent}
          removeClippedSubviews
          initialNumToRender={TEAM_MEMBER_INITIAL_RENDER_COUNT}
          maxToRenderPerBatch={TEAM_MEMBER_BATCH_RENDER_COUNT}
          windowSize={TEAM_MEMBER_WINDOW_SIZE}
          updateCellsBatchingPeriod={16}
          getItemLayout={(_, index) => ({
            length: TEAM_MEMBER_ROW_HEIGHT,
            offset: TEAM_MEMBER_ROW_HEIGHT * index,
            index
          })}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              {loading ? (
                <ActivityIndicator color="#337EFF" />
              ) : loadFailed ? (
                <>
                  <ThemedText>{t('teamInviteCandidatesLoadFailed')}</ThemedText>
                  <Pressable
                    style={styles.retryButton}
                    onPress={() => loadMembers().catch(() => undefined)}
                  >
                    <ThemedText style={styles.retryText}>{t('commonRetry')}</ThemedText>
                  </Pressable>
                </>
              ) : (
                <ThemedText>
                  {normalizedKeyword
                    ? t('teamInviteCandidatesNoMatch')
                    : t('teamInviteCandidatesEmpty')}
                </ThemedText>
              )}
            </View>
          }
          renderItem={renderCandidateItem}
          extraData={selectedIds}
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
  searchBar: {
    marginBottom: 12
  },
  headerAction: {
    color: '#337EFF',
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '600'
  },
  headerActionDisabled: {
    color: '#B5BCC7'
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
  }
})

export default TeamMemberPickerScreen
