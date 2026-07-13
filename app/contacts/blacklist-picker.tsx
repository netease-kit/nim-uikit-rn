import { router, Stack } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React, { useMemo, useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { useAppTranslation } from '@/hooks/useAppTranslation'
import { toast } from '@/src/NEUIKit/common/utils/toast'
import {
  UIKitEmptyState,
  UIKitPage,
  UIKitSearchBar,
  UIKitSelectionIndicator,
  UIKitUserAvatar
} from '@/src/NEUIKit/rn'
import { friendStore, nimStore, userStore } from '@/stores'
import { ensureNetworkAvailable, NETWORK_UNAVAILABLE_MESSAGE } from '@/utils/network'

type BlacklistCandidate = {
  accountId: string
  displayName: string
}

const MAX_BLACKLIST_SELECTION = 10
const BLACKLIST_PICKER_ROW_HEIGHT = 78
const BLACKLIST_PICKER_INITIAL_RENDER_COUNT = 12
const BLACKLIST_PICKER_BATCH_RENDER_COUNT = 10
const BLACKLIST_PICKER_WINDOW_SIZE = 8

const BlacklistPickerScreen = observer(() => {
  const { t } = useAppTranslation()
  const [keyword, setKeyword] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  const normalizedKeyword = keyword.trim().toLowerCase()
  const currentAccountId = nimStore.getLoginUser()
  const localFriendList = friendStore.friendList
  const blockList = friendStore.blockList
  const blockedAccountIds = useMemo(() => new Set(blockList), [blockList])

  const candidates = useMemo(() => {
    const eligibleFriends: BlacklistCandidate[] = localFriendList
      .filter((friend) => {
        return friend.accountId !== currentAccountId && !blockedAccountIds.has(friend.accountId)
      })
      .map((friend) => ({
        accountId: friend.accountId,
        displayName:
          friend.alias || friend.userProfile?.name || userStore.getDisplayName(friend.accountId)
      }))

    if (!normalizedKeyword) {
      return eligibleFriends
    }

    return eligibleFriends.filter((friend) =>
      `${friend.displayName} ${friend.accountId}`.toLowerCase().includes(normalizedKeyword)
    )
  }, [blockedAccountIds, currentAccountId, localFriendList, normalizedKeyword])

  const toggleSelect = (accountId: string) => {
    setSelectedIds((current) => {
      if (current.includes(accountId)) {
        return current.filter((item) => item !== accountId)
      }

      if (current.length >= MAX_BLACKLIST_SELECTION) {
        toast.alert(
          t('commonTip'),
          t('commonAtMostSelectContacts', { count: MAX_BLACKLIST_SELECTION })
        )
        return current
      }

      return [...current, accountId]
    })
  }

  const handleConfirm = async () => {
    if (selectedIds.length === 0 || submitting) {
      return
    }

    setSubmitting(true)

    try {
      await ensureNetworkAvailable()
      for (const accountId of selectedIds) {
        await friendStore.addToBlockList(accountId)
      }
      router.back()
    } catch (error) {
      toast.alert(
        t('contactsBlacklistAddFailed'),
        error instanceof Error ? error.message : NETWORK_UNAVAILABLE_MESSAGE
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <UIKitPage style={styles.page}>
      <Stack.Screen options={{ title: t('commonSelect'), headerTitleAlign: 'center' }} />

      <View style={styles.content}>
        <UIKitSearchBar
          value={keyword}
          onChangeText={setKeyword}
          placeholder={t('commonSearchFriendsPlaceholder')}
          style={styles.searchBar}
        />

        <FlatList
          data={candidates}
          keyExtractor={(item) => item.accountId}
          contentContainerStyle={styles.listContent}
          removeClippedSubviews
          initialNumToRender={BLACKLIST_PICKER_INITIAL_RENDER_COUNT}
          maxToRenderPerBatch={BLACKLIST_PICKER_BATCH_RENDER_COUNT}
          windowSize={BLACKLIST_PICKER_WINDOW_SIZE}
          updateCellsBatchingPeriod={16}
          getItemLayout={(_, index) => ({
            length: BLACKLIST_PICKER_ROW_HEIGHT,
            offset: BLACKLIST_PICKER_ROW_HEIGHT * index,
            index
          })}
          ListEmptyComponent={
            normalizedKeyword ? (
              <View style={styles.emptyState}>
                <UIKitEmptyState title={t('commonNoFriends')} />
              </View>
            ) : (
              <UIKitEmptyState title={t('contactsBlacklistPickerEmpty')} />
            )
          }
          renderItem={({ item, index }) => {
            const isSelected = selectedIds.includes(item.accountId)

            return (
              <Pressable
                style={[styles.row, index === candidates.length - 1 && styles.rowLast]}
                onPress={() => toggleSelect(item.accountId)}
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
          }}
        />

        <Pressable
          style={[
            styles.submitButton,
            (selectedIds.length === 0 || submitting) && styles.submitDisabled
          ]}
          onPress={handleConfirm}
          disabled={selectedIds.length === 0 || submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <ThemedText style={styles.submitText}>{t('actionConfirm')}</ThemedText>
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
  listContent: {
    flexGrow: 1,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden'
  },
  emptyState: {
    paddingVertical: 56,
    alignItems: 'center'
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

export default BlacklistPickerScreen
