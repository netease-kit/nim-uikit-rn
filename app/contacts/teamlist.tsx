import { router, Stack } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { useAppTranslation } from '@/hooks/useAppTranslation'
import { useNavigationLock } from '@/hooks/useNavigationLock'
import { toast } from '@/src/NEUIKit/common/utils/toast'
import { UIKitEmptyState, UIKitRowDivider, UIKitUserAvatar, UIKitWhitePage } from '@/src/NEUIKit/rn'
import { conversationStore, nimStore, teamStore } from '@/stores'

const TEAM_LIST_ROW_HEIGHT = 78
const TEAM_LIST_INITIAL_RENDER_COUNT = 10
const TEAM_LIST_BATCH_RENDER_COUNT = 8
const TEAM_LIST_WINDOW_SIZE = 8

const TeamListScreen = observer(() => {
  const { t } = useAppTranslation()
  const [loading, setLoading] = useState(false)
  const [loadFailed, setLoadFailed] = useState(false)
  const { runWithNavigationLock, isNavigationLocked } = useNavigationLock()

  const loadTeams = useCallback(async () => {
    setLoading(true)
    setLoadFailed(false)

    try {
      await teamStore.refreshJoinedTeams()
    } catch (error) {
      setLoadFailed(true)
      toast.alert(
        t('commonLoadingFailed'),
        error instanceof Error ? error.message : t('contactsTeamListLoadFailed')
      )
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    loadTeams().catch(() => undefined)
  }, [loadTeams])

  return (
    <UIKitWhitePage style={styles.container}>
      <Stack.Screen
        options={{
          title: t('contactsTeamListTitle'),
          headerTitleAlign: 'center',
          headerShown: true
        }}
      />
      <FlatList
        data={teamStore.teamList}
        keyExtractor={(item) => item.teamId}
        removeClippedSubviews
        initialNumToRender={TEAM_LIST_INITIAL_RENDER_COUNT}
        maxToRenderPerBatch={TEAM_LIST_BATCH_RENDER_COUNT}
        windowSize={TEAM_LIST_WINDOW_SIZE}
        updateCellsBatchingPeriod={16}
        getItemLayout={(_, index) => ({
          length: TEAM_LIST_ROW_HEIGHT,
          offset: TEAM_LIST_ROW_HEIGHT * index,
          index
        })}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            {loading ? (
              <ActivityIndicator color="#337EFF" />
            ) : loadFailed ? (
              <>
                <ThemedText style={styles.emptyBodyText}>
                  {t('contactsTeamListLoadFailed')}
                </ThemedText>
                <Pressable style={styles.retryButton} onPress={loadTeams}>
                  <ThemedText style={styles.retryButtonText}>{t('commonRetry')}</ThemedText>
                </Pressable>
              </>
            ) : (
              <UIKitEmptyState title={t('contactsTeamListEmpty')} />
            )}
          </View>
        }
        renderItem={({ item, index }) => (
          <View style={styles.rowWrap}>
            <Pressable
              style={styles.row}
              disabled={isNavigationLocked()}
              onPress={async () => {
                const conversationId = nimStore.nim?.V2NIMConversationIdUtil.teamConversationId(
                  item.teamId
                )

                if (!conversationId) {
                  toast.alert(t('commonOpenFailed'), t('contactsTeamListInvalidConversation'))
                  return
                }

                try {
                  await conversationStore.createConversation(conversationId)
                  runWithNavigationLock(() => {
                    router.push({ pathname: '/chat/[id]', params: { id: conversationId } })
                  })
                } catch (error) {
                  toast.alert(
                    t('commonOpenFailed'),
                    error instanceof Error ? error.message : t('commonRetryLater')
                  )
                }
              }}
            >
              <UIKitUserAvatar
                account={item.teamId || item.name || t('commonGroupChat')}
                avatar={item.avatar}
                size={42}
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
    minHeight: 78,
    paddingHorizontal: 20,
    gap: 12
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
