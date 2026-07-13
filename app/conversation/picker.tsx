import { Image } from 'expo-image'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import {
  FlatList,
  ListRenderItemInfo,
  Pressable,
  ScrollView,
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
import {
  conversationStore,
  friendStore,
  nimStore,
  TEAM_CATEGORY,
  teamStore,
  userStore
} from '@/stores'
import { ensureNetworkAvailable, getNetworkUnavailableMessage } from '@/utils/network'

const EMPTY_FRIEND_IMAGE = require('@/src/NEUIKit/static/empty.png')
const MAX_TEAM_MEMBERS = 200

type PickerCandidate = {
  accountId: string
  displayName: string
  searchText: string
  avatar?: string
  type: 'friend'
}

type PickerRowProps = {
  item: PickerCandidate
  isSelected: boolean
  isLast: boolean
  onPress: (accountId: string) => void
}

const PICKER_ROW_HEIGHT = 68
const PICKER_INITIAL_RENDER_COUNT = 12
const PICKER_BATCH_RENDER_COUNT = 10
const PICKER_WINDOW_SIZE = 8

const PickerRow = React.memo(
  function PickerRow({ item, isSelected, isLast, onPress }: PickerRowProps) {
    return (
      <Pressable
        style={[styles.row, isLast && styles.rowLast]}
        onPress={() => onPress(item.accountId)}
      >
        <UIKitSelectionIndicator selected={isSelected} />
        <UIKitUserAvatar account={item.accountId} avatar={item.avatar} size={42} />
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
    prev.item.displayName === next.item.displayName &&
    prev.item.avatar === next.item.avatar
)

const ConversationPickerScreen = observer(() => {
  const { t } = useAppTranslation()
  const { seedAccountId, mode } = useLocalSearchParams<{
    seedAccountId?: string
    mode?: 'discussion' | 'group'
  }>()
  const resolvedSeedAccountId = typeof seedAccountId === 'string' ? seedAccountId : ''
  const resolvedMode =
    mode === TEAM_CATEGORY.DISCUSSION
      ? TEAM_CATEGORY.DISCUSSION
      : mode === TEAM_CATEGORY.GROUP
        ? TEAM_CATEGORY.GROUP
        : resolvedSeedAccountId
          ? TEAM_CATEGORY.DISCUSSION
          : TEAM_CATEGORY.GROUP
  const [keyword, setKeyword] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const createRequestLockRef = useRef(false)

  const normalizedKeyword = keyword.trim().toLowerCase()
  const currentAccountId = nimStore.getLoginUser()
  const friendSections = friendStore.friendSections

  const allCandidates = useMemo(() => {
    const friendCandidates: PickerCandidate[] = friendSections
      .flatMap((section) => section.data)
      .filter((friend) => {
        return friend.accountId !== currentAccountId && friend.accountId !== resolvedSeedAccountId
      })
      .map((friend) => ({
        accountId: friend.accountId,
        displayName: friend.appellation,
        searchText: `${friend.appellation} ${friend.accountId}`.toLowerCase(),
        avatar: friend.avatar,
        type: 'friend'
      }))

    return friendCandidates.filter(
      (item, index, list) =>
        list.findIndex((candidate) => candidate.accountId === item.accountId) === index
    )
  }, [currentAccountId, friendSections, resolvedSeedAccountId])
  const candidateMap = useMemo(
    () => new Map(allCandidates.map((item) => [item.accountId, item] as const)),
    [allCandidates]
  )

  const candidates = useMemo(() => {
    if (!normalizedKeyword) {
      return allCandidates
    }

    return allCandidates.filter((item) => item.searchText.includes(normalizedKeyword))
  }, [allCandidates, normalizedKeyword])

  const selectedCandidates = useMemo(() => {
    return selectedIds
      .map((accountId) => {
        const candidate = candidateMap.get(accountId)

        if (candidate) {
          return candidate
        }

        return {
          accountId,
          displayName: userStore.getDisplayName(accountId),
          searchText: accountId.toLowerCase(),
          avatar: undefined,
          type: 'friend' as const
        }
      })
      .filter(Boolean)
  }, [candidateMap, selectedIds])

  const inviteeIds = useMemo(() => {
    return Array.from(new Set([...selectedIds, resolvedSeedAccountId].filter(Boolean)))
  }, [resolvedSeedAccountId, selectedIds])

  const toggleSelect = useCallback(
    (accountId: string) => {
      setSelectedIds((current) => {
        if (current.includes(accountId)) {
          return current.filter((item) => item !== accountId)
        }

        if (current.length >= MAX_TEAM_MEMBERS) {
          toast.alert(t('commonTip'), t('commonAtMostSelectContacts', { count: MAX_TEAM_MEMBERS }))
          return current
        }

        return [...current, accountId]
      })
    },
    [t]
  )

  const pickerTitle = resolvedSeedAccountId
    ? t('chooseText')
    : resolvedMode === TEAM_CATEGORY.DISCUSSION
      ? t('conversationPickerCreateDiscussionTitle')
      : t('conversationPickerCreateAdvancedTitle')
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
      return t('commonGroupChat')
    }

    return joinedName.slice(0, 30)
  }

  const handleCreateTeam = async () => {
    if (inviteeIds.length === 0) {
      toast.alert(t('commonTip'), t('commonSelectContactsFirst'))
      return
    }

    if (!nimStore.nim || submitting || createRequestLockRef.current) {
      return
    }

    createRequestLockRef.current = true
    setSubmitting(true)

    try {
      await ensureNetworkAvailable()

      const team = await teamStore.createTeam(createTeamName(), inviteeIds, {
        category: resolvedMode
      })

      if (!team) {
        return
      }

      const conversationId = nimStore.nim.V2NIMConversationIdUtil.teamConversationId(team.teamId)
      await conversationStore.createConversation(conversationId)
      router.replace({ pathname: '/chat/[id]', params: { id: conversationId } })
    } catch (error) {
      toast.alert(
        t('commonCreateFailed'),
        error instanceof Error ? error.message : getNetworkUnavailableMessage()
      )
    } finally {
      createRequestLockRef.current = false
      setSubmitting(false)
    }
  }

  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds])

  const renderCandidateItem = useCallback(
    ({ item, index }: ListRenderItemInfo<PickerCandidate>) => (
      <PickerRow
        item={item}
        isSelected={selectedIdSet.has(item.accountId)}
        isLast={index === candidates.length - 1}
        onPress={toggleSelect}
      />
    ),
    [candidates.length, selectedIdSet, toggleSelect]
  )

  return (
    <UIKitPage style={styles.page}>
      <Stack.Screen
        options={{
          title: pickerTitle,
          headerTitleAlign: 'center',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ThemedText style={styles.cancelText}>{t('conversationPickerCancel')}</ThemedText>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              disabled={selectedIds.length === 0 || submitting}
              onPress={() => {
                handleCreateTeam().catch(() => undefined)
              }}
            >
              <ThemedText
                style={[
                  styles.confirmText,
                  (selectedIds.length === 0 || submitting) && styles.confirmTextDisabled
                ]}
              >
                {t('actionConfirm')}
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
          <ThemedText style={styles.summarySubtitle}>
            {t('commonSelectUpToCount', { count: MAX_TEAM_MEMBERS })}
          </ThemedText>
        </View>

        {selectedCandidates.length > 0 ? (
          <View style={styles.selectedPanel}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.selectedContent}
            >
              {selectedCandidates.map((item) => (
                <Pressable
                  key={item.accountId}
                  style={styles.selectedItem}
                  onPress={() => toggleSelect(item.accountId)}
                >
                  <View style={styles.selectedAvatarWrap}>
                    <UIKitUserAvatar account={item.accountId} avatar={item.avatar} size={42} />
                    <View style={styles.selectedRemoveBadge}>
                      <ThemedText style={styles.selectedRemoveText}>×</ThemedText>
                    </View>
                  </View>
                  <ThemedText numberOfLines={1} ellipsizeMode="tail" style={styles.selectedName}>
                    {item.displayName}
                  </ThemedText>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        ) : null}

        <FlatList
          data={candidates}
          keyExtractor={(item) => item.accountId}
          contentContainerStyle={styles.listContent}
          removeClippedSubviews
          initialNumToRender={PICKER_INITIAL_RENDER_COUNT}
          maxToRenderPerBatch={PICKER_BATCH_RENDER_COUNT}
          windowSize={PICKER_WINDOW_SIZE}
          updateCellsBatchingPeriod={16}
          getItemLayout={(_, index) => ({
            length: PICKER_ROW_HEIGHT,
            offset: PICKER_ROW_HEIGHT * index,
            index
          })}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              {normalizedKeyword ? (
                <ThemedText>{t('commonNoMatchingFriends')}</ThemedText>
              ) : (
                <>
                  <Image
                    source={EMPTY_FRIEND_IMAGE}
                    style={styles.emptyImage}
                    contentFit="contain"
                  />
                  <ThemedText style={styles.emptyTitle}>{t('commonNoFriends')}</ThemedText>
                </>
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
  cancelText: {
    color: '#6E7580',
    fontSize: 17,
    lineHeight: 24
  },
  confirmText: {
    color: '#337EFF',
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '600'
  },
  confirmTextDisabled: {
    color: '#B5BCC7'
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
  selectedPanel: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    marginBottom: 12
  },
  selectedContent: {
    gap: 8,
    paddingRight: 4
  },
  selectedItem: {
    width: 64,
    alignItems: 'center'
  },
  selectedAvatarWrap: {
    position: 'relative'
  },
  selectedRemoveBadge: {
    position: 'absolute',
    top: 0,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center'
  },
  selectedRemoveText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 14,
    fontWeight: '700'
  },
  selectedName: {
    marginTop: 6,
    width: '100%',
    fontSize: 12,
    lineHeight: 16,
    color: '#4B5563',
    textAlign: 'center'
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 56,
    gap: 12
  },
  emptyImage: {
    width: 160,
    height: 120,
    marginBottom: 12
  },
  emptyTitle: {
    color: '#333333',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600'
  },
  listContent: {
    flexGrow: 1,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 68,
    paddingHorizontal: 18,
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
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500'
  },
  rowSubtitle: {
    marginTop: 2,
    color: '#98A1AD',
    fontSize: 12,
    lineHeight: 16
  },
  subText: {
    marginTop: 4,
    fontSize: 12,
    color: '#6B7280'
  }
})

export default ConversationPickerScreen
