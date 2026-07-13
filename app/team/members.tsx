import { router, Stack, useLocalSearchParams } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  InteractionManager,
  Platform,
  Pressable,
  StyleSheet,
  View,
  ViewToken
} from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { useAppTranslation } from '@/hooks/useAppTranslation'
import { useNavigationLock } from '@/hooks/useNavigationLock'
import { toast } from '@/src/NEUIKit/common/utils/toast'
import { UIKitPage, UIKitSearchBar, UIKitUserAvatar } from '@/src/NEUIKit/rn'
import {
  friendStore,
  getTeamCategory,
  nimStore,
  TEAM_CATEGORY,
  teamStore,
  userStore
} from '@/stores'
import { ensureNetworkAvailable } from '@/utils/network'
import { V2NIMConst, V2NIMTeamMember, V2NIMTeamMemberRole } from '@/utils/nim-sdk'

const NO_TEAM_PERMISSION_ERROR_CODE = 109306
const RESOURCE_NOT_EXIST_ERROR_CODE = 191006
const TEAM_MEMBER_LIST_ROW_HEIGHT = 64
const TEAM_MEMBER_LIST_INITIAL_RENDER_COUNT = 56
const TEAM_MEMBER_LIST_BATCH_RENDER_COUNT = 96
const TEAM_MEMBER_LIST_WINDOW_SIZE = 31
const TEAM_MEMBER_LIST_BATCH_PERIOD_MS = 0
const TEAM_MEMBER_VISIBLE_PROFILE_DEBOUNCE_MS = 120

type TeamMemberSearchEntry = {
  member: V2NIMTeamMember
  nameSearchText: string
  accountIdSearchText: string
  orderIndex: number
}

function getRemoveMemberErrorMessage(error: unknown, t: ReturnType<typeof useAppTranslation>['t']) {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? (error as { code?: unknown }).code
      : undefined

  if (code === NO_TEAM_PERMISSION_ERROR_CODE) {
    return t('commonPermissionDenied')
  }

  return error instanceof Error ? error.message : t('commonRetryLater')
}

function getErrorCode(error: unknown) {
  return typeof error === 'object' && error !== null && 'code' in error
    ? (error as { code?: unknown }).code
    : undefined
}

function isMemberAlreadyGoneError(error: unknown) {
  const code = getErrorCode(error)
  const nimErrorCode = V2NIMConst.V2NIMErrorCode || {}
  const alreadyGoneCodes = [
    nimErrorCode.V2NIM_ERROR_CODE_TEAM_MEMBER_NOT_EXIST,
    nimErrorCode.V2NIM_ERROR_CODE_RESOURCE_NOT_EXIST,
    RESOURCE_NOT_EXIST_ERROR_CODE
  ].filter((item) => item !== undefined)

  if (alreadyGoneCodes.includes(code)) {
    return true
  }

  const message = error instanceof Error ? error.message : String(error || '')
  return /成员.*不存在|资源不存在|not\s+found|not\s+exist|not\s+in\s+team/i.test(message)
}

function getTeamMemberListDisplayName(member: V2NIMTeamMember, teamId: string) {
  return getTeamMemberListDisplayNameFromCache(member, teamId, true)
}

function getTeamMemberListDisplayNameFromCache(
  member: V2NIMTeamMember,
  teamId: string,
  includeUserProfile: boolean
) {
  const friendAlias = friendStore.friends.get(member.accountId)?.alias?.trim()

  if (friendAlias) {
    return friendAlias
  }

  const teamNick = member.teamNick?.trim()

  if (teamNick) {
    return teamNick
  }

  if (!includeUserProfile) {
    return member.accountId
  }

  const localUser = userStore.users.get(member.accountId)
  const selfProfile =
    userStore.selfProfile?.accountId === member.accountId ? userStore.selfProfile : null
  const friendProfile = friendStore.friends.get(member.accountId)?.userProfile

  return localUser?.name || selfProfile?.name || friendProfile?.name || member.accountId
}

const TeamMemberSearchBar = React.memo(function TeamMemberSearchBar({
  placeholder,
  onSubmitSearch,
  style
}: {
  placeholder: string
  onSubmitSearch: (keyword: string) => void
  style?: React.ComponentProps<typeof UIKitSearchBar>['style']
}) {
  const [value, setValue] = useState('')

  const handleChangeText = useCallback(
    (nextValue: string) => {
      setValue(nextValue)

      if (!nextValue.trim()) {
        onSubmitSearch('')
      }
    },
    [onSubmitSearch]
  )

  const handleSubmitEditing = useCallback(() => {
    onSubmitSearch(value)
  }, [onSubmitSearch, value])

  return (
    <UIKitSearchBar
      value={value}
      onChangeText={handleChangeText}
      onSubmitEditing={handleSubmitEditing}
      placeholder={placeholder}
      style={style}
    />
  )
})

const TeamMemberRow = observer(function TeamMemberRow({
  item,
  index,
  memberCount,
  teamId,
  isDiscussion,
  canManage,
  currentAccountId,
  myRole,
  loadMembers
}: {
  item: V2NIMTeamMember
  index: number
  memberCount: number
  teamId: string
  isDiscussion: boolean
  canManage: boolean
  currentAccountId?: string
  myRole: V2NIMTeamMemberRole
  loadMembers: () => Promise<void>
}) {
  const { t } = useAppTranslation()
  const { runWithNavigationLock } = useNavigationLock()
  const friend = friendStore.friends.get(item.accountId)
  const teamNick = item.teamNick?.trim()
  const user = teamNick ? undefined : userStore.users.get(item.accountId)
  const name = getTeamMemberListDisplayName(item, teamId)
  const roleBadgeText =
    !isDiscussion && item.memberRole === V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_OWNER
      ? t('teamOwner')
      : !isDiscussion && item.memberRole === V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_MANAGER
        ? t('manager')
        : ''
  const canKick =
    !isDiscussion &&
    canManage &&
    item.accountId !== currentAccountId &&
    item.memberRole !== V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_OWNER &&
    !(
      myRole === V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_MANAGER &&
      item.memberRole === V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_MANAGER
    )

  return (
    <View style={[styles.row, index === memberCount - 1 && styles.rowLast]}>
      <Pressable
        style={styles.memberMeta}
        onPress={() =>
          runWithNavigationLock(() => {
            if (item.accountId === currentAccountId) {
              router.push('/user/my-detail' as never)
              return
            }

            router.push({
              pathname: '/friend/friend-card',
              params: { accountId: item.accountId }
            } as never)
          })
        }
      >
        <UIKitUserAvatar
          account={item.accountId}
          avatar={friend?.userProfile?.avatar || user?.avatar}
          fallbackLabel={name}
          size={42}
        />
        <View style={styles.metaText}>
          <ThemedText numberOfLines={1} ellipsizeMode="tail" style={styles.memberTitle}>
            {name}
          </ThemedText>
        </View>
      </Pressable>
      {roleBadgeText ? (
        <View style={styles.roleBadge}>
          <ThemedText style={styles.roleBadgeText}>{roleBadgeText}</ThemedText>
        </View>
      ) : null}
      {canKick ? (
        <Pressable
          style={styles.kickButton}
          onPress={() =>
            Alert.alert(t('teamMemberRemoveTitle'), t('teamMemberRemoveConfirm'), [
              {
                text: t('removeText'),
                style: 'destructive',
                onPress: async () => {
                  try {
                    try {
                      await ensureNetworkAvailable()
                    } catch {
                      throw new Error(t('commonNetworkUnavailable'))
                    }

                    await teamStore.kickMembers(teamId, [item.accountId])
                  } catch (error) {
                    if (isMemberAlreadyGoneError(error)) {
                      await loadMembers().catch(() => undefined)
                      return
                    }

                    toast.alert(t('removeFailText'), getRemoveMemberErrorMessage(error, t))
                  }
                }
              },
              { text: t('actionCancel'), style: 'cancel' }
            ])
          }
        >
          <ThemedText style={styles.kickButtonText}>{t('removeText')}</ThemedText>
        </Pressable>
      ) : null}
    </View>
  )
})

const TeamMembersScreen = observer(() => {
  const { t } = useAppTranslation()
  const { teamId } = useLocalSearchParams<{ teamId?: string }>()
  const resolvedTeamId = typeof teamId === 'string' ? teamId : ''
  const [keyword, setKeyword] = useState('')
  const [searchResult, setSearchResult] = useState<{
    keyword: string
    members: V2NIMTeamMember[]
  }>({ keyword: '', members: [] })
  const [loading, setLoading] = useState(false)
  const [loadFailed, setLoadFailed] = useState(false)
  const visibleProfileAccountIdsRef = useRef<Set<string>>(new Set())
  const pendingProfileAccountIdsRef = useRef<Set<string>>(new Set())
  const profileFetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const profileFetchInteractionRef = useRef<{ cancel?: () => void } | null>(null)
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const allMemberSearchEntriesRef = useRef<TeamMemberSearchEntry[]>([])
  const searchSeqRef = useRef(0)

  const flushVisibleProfileFetch = useCallback(() => {
    if (profileFetchTimerRef.current) {
      clearTimeout(profileFetchTimerRef.current)
      profileFetchTimerRef.current = null
    }

    const accountIds = Array.from(pendingProfileAccountIdsRef.current)
    pendingProfileAccountIdsRef.current.clear()

    if (accountIds.length > 0) {
      profileFetchInteractionRef.current?.cancel?.()
      profileFetchInteractionRef.current = InteractionManager.runAfterInteractions(() => {
        userStore.fetchUsers(accountIds).catch(() => undefined)
      })
    }
  }, [])

  const scheduleVisibleProfileFetch = useCallback(() => {
    if (profileFetchTimerRef.current) {
      return
    }

    profileFetchTimerRef.current = setTimeout(
      flushVisibleProfileFetch,
      TEAM_MEMBER_VISIBLE_PROFILE_DEBOUNCE_MS
    )
  }, [flushVisibleProfileFetch])

  useEffect(() => {
    return () => {
      if (profileFetchTimerRef.current) {
        clearTimeout(profileFetchTimerRef.current)
      }
      profileFetchInteractionRef.current?.cancel?.()
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current)
      }
    }
  }, [])

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
        error instanceof Error ? error.message : t('teamMembersLoadFailed')
      )
    } finally {
      setLoading(false)
    }
  }, [resolvedTeamId, t])

  useEffect(() => {
    loadMembers().catch(() => undefined)
  }, [loadMembers])

  useEffect(() => {
    if (!nimStore.nim || !resolvedTeamId) {
      return
    }

    const hasCurrentTeamMember = (teamMembers: V2NIMTeamMember[]) =>
      teamMembers.some((member) => member.teamId === resolvedTeamId)
    const refreshCurrentTeamMembers = (teamMembers: V2NIMTeamMember[]) => {
      if (hasCurrentTeamMember(teamMembers)) {
        loadMembers().catch(() => undefined)
      }
    }
    const refreshCurrentTeamMembersWithOperator = (
      _operateAccountId: string,
      teamMembers: V2NIMTeamMember[]
    ) => {
      refreshCurrentTeamMembers(teamMembers)
    }
    const refreshCurrentTeamMemberInfo = (teamMembers: V2NIMTeamMember[]) => {
      const currentAccountId = nimStore.getLoginUser()
      const currentMember = teamMembers.find(
        (member) => member.teamId === resolvedTeamId && member.accountId === currentAccountId
      )

      if (teamMembers.some((member) => member.teamId === resolvedTeamId && !currentMember)) {
        loadMembers().catch(() => undefined)
        return
      }

      const existingCurrentMember = teamStore
        .getMembers(resolvedTeamId)
        .find((member) => member.accountId === currentAccountId)

      if (
        currentMember &&
        teamStore.getMyMemberRole(resolvedTeamId) ===
          V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_NORMAL &&
        currentMember.memberRole !== V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_NORMAL
      ) {
        loadMembers().catch(() => undefined)
        return
      }

      if (
        currentMember &&
        existingCurrentMember &&
        currentMember.memberRole === existingCurrentMember.memberRole
      ) {
        loadMembers().catch(() => undefined)
      }
    }

    nimStore.nim.V2NIMTeamService.on('onTeamMemberJoined', refreshCurrentTeamMembers)
    nimStore.nim.V2NIMTeamService.on('onTeamMemberKicked', refreshCurrentTeamMembersWithOperator)
    nimStore.nim.V2NIMTeamService.on('onTeamMemberLeft', refreshCurrentTeamMembers)
    nimStore.nim.V2NIMTeamService.on('onTeamMemberInfoUpdated', refreshCurrentTeamMemberInfo)

    return () => {
      nimStore.nim?.V2NIMTeamService.off('onTeamMemberJoined', refreshCurrentTeamMembers)
      nimStore.nim?.V2NIMTeamService.off(
        'onTeamMemberKicked',
        refreshCurrentTeamMembersWithOperator
      )
      nimStore.nim?.V2NIMTeamService.off('onTeamMemberLeft', refreshCurrentTeamMembers)
      nimStore.nim?.V2NIMTeamService.off('onTeamMemberInfoUpdated', refreshCurrentTeamMemberInfo)
    }
  }, [loadMembers, resolvedTeamId])

  const myRole = teamStore.getMyMemberRole(resolvedTeamId)
  const canManage =
    myRole === V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_OWNER ||
    myRole === V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_MANAGER

  const isDiscussion =
    getTeamCategory(teamStore.getTeam(resolvedTeamId)) === TEAM_CATEGORY.DISCUSSION
  const members = teamStore.getMembers(resolvedTeamId)
  const currentAccountId = userStore.selfProfile?.accountId
  const normalizedKeyword = keyword.trim().toLowerCase()

  const sortedMembers = useMemo(() => {
    return members.slice().sort((left, right) => {
      const leftIsOwner = left.memberRole === V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_OWNER
      const rightIsOwner = right.memberRole === V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_OWNER

      if (leftIsOwner !== rightIsOwner) {
        return leftIsOwner ? -1 : 1
      }

      const leftIsManager = left.memberRole === V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_MANAGER
      const rightIsManager = right.memberRole === V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_MANAGER

      if (leftIsManager !== rightIsManager) {
        return leftIsManager ? -1 : 1
      }

      return left.joinTime - right.joinTime
    })
  }, [members])

  const allMemberSearchEntries: TeamMemberSearchEntry[] = sortedMembers.map(
    (member, orderIndex) => {
      const name = getTeamMemberListDisplayName(member, resolvedTeamId)

      return {
        member,
        nameSearchText: name.toLowerCase(),
        accountIdSearchText: member.accountId.toLowerCase(),
        orderIndex
      }
    }
  )
  const allMemberSearchEntriesKey = allMemberSearchEntries
    .map(
      (entry) => `${entry.member.accountId}:${entry.nameSearchText}:${entry.accountIdSearchText}`
    )
    .join('|')
  allMemberSearchEntriesRef.current = allMemberSearchEntries

  const runSearch = useCallback((nextKeyword: string) => {
    const nextNormalizedKeyword = nextKeyword.trim().toLowerCase()
    const searchEntries = allMemberSearchEntriesRef.current
    const seq = searchSeqRef.current + 1
    searchSeqRef.current = seq

    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current)
      searchTimerRef.current = null
    }

    setKeyword(nextNormalizedKeyword)

    if (!nextNormalizedKeyword) {
      setSearchResult({ keyword: '', members: [] })
      return
    }

    const results: {
      member: V2NIMTeamMember
      searchPoint: number
      orderIndex: number
    }[] = []
    let index = 0
    const chunkSize = 400

    const searchChunk = () => {
      if (searchSeqRef.current !== seq) {
        return
      }

      const endIndex = Math.min(index + chunkSize, searchEntries.length)

      for (; index < endIndex; index += 1) {
        const entry = searchEntries[index]

        if (entry.nameSearchText.includes(nextNormalizedKeyword)) {
          results.push({
            member: entry.member,
            searchPoint: entry.nameSearchText.length,
            orderIndex: entry.orderIndex
          })
          continue
        }

        if (entry.accountIdSearchText.includes(nextNormalizedKeyword)) {
          results.push({
            member: entry.member,
            searchPoint: 100 + entry.accountIdSearchText.length,
            orderIndex: entry.orderIndex
          })
        }
      }

      if (index < searchEntries.length) {
        searchTimerRef.current = setTimeout(searchChunk, 0)
        return
      }

      setSearchResult({
        keyword: nextNormalizedKeyword,
        members: results
          .sort((left, right) => {
            const searchPointDiff = left.searchPoint - right.searchPoint
            return searchPointDiff || left.orderIndex - right.orderIndex
          })
          .map((result) => result.member)
      })
    }

    searchTimerRef.current = setTimeout(searchChunk, 0)
  }, [])

  useEffect(() => {
    if (normalizedKeyword) {
      runSearch(normalizedKeyword)
    }
  }, [allMemberSearchEntriesKey, normalizedKeyword, runSearch])

  const displayMembers = useMemo(() => {
    if (!normalizedKeyword) {
      return sortedMembers
    }

    if (searchResult.keyword === normalizedKeyword) {
      return searchResult.members
    }

    return sortedMembers
  }, [normalizedKeyword, searchResult, sortedMembers])

  const displayMemberCount = displayMembers.length

  const handleViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken<V2NIMTeamMember>[] }) => {
      const accountIds = viewableItems
        .map((viewableItem) => viewableItem.item?.accountId)
        .filter((accountId): accountId is string => !!accountId)
      const pendingAccountIds = accountIds.filter((accountId) => {
        if (visibleProfileAccountIdsRef.current.has(accountId)) {
          return false
        }

        visibleProfileAccountIdsRef.current.add(accountId)
        return true
      })

      if (pendingAccountIds.length > 0) {
        pendingAccountIds.forEach((accountId) => {
          pendingProfileAccountIdsRef.current.add(accountId)
        })
        scheduleVisibleProfileFetch()
      }
    }
  ).current
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 20 }).current

  const renderMemberItem = useCallback(
    ({ item, index }: { item: V2NIMTeamMember; index: number }) => {
      return (
        <TeamMemberRow
          item={item}
          index={index}
          memberCount={displayMemberCount}
          teamId={resolvedTeamId}
          isDiscussion={isDiscussion}
          canManage={canManage}
          currentAccountId={currentAccountId}
          myRole={myRole}
          loadMembers={loadMembers}
        />
      )
    },
    [
      canManage,
      currentAccountId,
      displayMemberCount,
      isDiscussion,
      myRole,
      resolvedTeamId,
      loadMembers
    ]
  )

  return (
    <UIKitPage style={styles.page}>
      <Stack.Screen
        options={{
          title: isDiscussion
            ? t('teamSettingsDiscussionMemberCount')
            : t('teamSettingsMemberCount'),
          headerTitleAlign: 'center'
        }}
      />

      <View style={styles.content}>
        <TeamMemberSearchBar
          onSubmitSearch={runSearch}
          placeholder={t('commonSearch')}
          style={styles.searchBar}
        />

        <View style={styles.listWrap}>
          <FlatList
            data={displayMembers}
            keyExtractor={(item) => item.accountId}
            contentContainerStyle={styles.listContent}
            removeClippedSubviews={Platform.OS !== 'android'}
            initialNumToRender={TEAM_MEMBER_LIST_INITIAL_RENDER_COUNT}
            maxToRenderPerBatch={TEAM_MEMBER_LIST_BATCH_RENDER_COUNT}
            windowSize={TEAM_MEMBER_LIST_WINDOW_SIZE}
            updateCellsBatchingPeriod={TEAM_MEMBER_LIST_BATCH_PERIOD_MS}
            onViewableItemsChanged={handleViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            getItemLayout={(_, index) => ({
              length: TEAM_MEMBER_LIST_ROW_HEIGHT,
              offset: TEAM_MEMBER_LIST_ROW_HEIGHT * index,
              index
            })}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                {loading ? (
                  <ActivityIndicator color="#337EFF" />
                ) : loadFailed ? (
                  <>
                    <ThemedText>{t('teamMembersLoadFailed')}</ThemedText>
                    <Pressable
                      style={styles.retryButton}
                      onPress={() => loadMembers().catch(() => undefined)}
                    >
                      <ThemedText style={styles.retryText}>{t('commonRetry')}</ThemedText>
                    </Pressable>
                  </>
                ) : (
                  <ThemedText>
                    {keyword.trim() ? t('commonNoSearchResults') : t('noTeamMember')}
                  </ThemedText>
                )}
              </View>
            }
            renderItem={renderMemberItem}
            extraData={displayMemberCount}
          />
        </View>
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
    padding: 16,
    position: 'relative'
  },
  searchBar: {
    marginBottom: 12
  },
  listWrap: {
    flex: 1
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
    minHeight: TEAM_MEMBER_LIST_ROW_HEIGHT,
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
    flex: 1,
    minWidth: 0
  },
  memberTitle: {
    color: '#333333',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500'
  },
  roleBadge: {
    minWidth: 40,
    minHeight: 24,
    marginLeft: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D6D8DB',
    backgroundColor: '#F7F7F7',
    alignItems: 'center',
    justifyContent: 'center'
  },
  roleBadgeText: {
    color: '#656A72',
    fontSize: 12,
    lineHeight: 16
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
