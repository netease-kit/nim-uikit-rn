import { router, Stack } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { useAppTranslation } from '@/hooks/useAppTranslation'
import { useNavigationLock } from '@/hooks/useNavigationLock'
import { toast } from '@/src/NEUIKit/common/utils/toast'
import { UIKitEmptyState, UIKitRowDivider, UIKitUserAvatar, UIKitWhitePage } from '@/src/NEUIKit/rn'
import { imStoreV2Bridge, userStore } from '@/stores'

type ContactsAIUser = {
  accountId: string
  name?: string
  avatar?: string
}

const AI_USER_ROW_HEIGHT = 78
const AI_USER_INITIAL_RENDER_COUNT = 10
const AI_USER_BATCH_RENDER_COUNT = 8
const AI_USER_WINDOW_SIZE = 8

const AiUsersScreen = observer(() => {
  const { t } = useAppTranslation()
  const [loading, setLoading] = useState(false)
  const [loadFailed, setLoadFailed] = useState(false)
  const aiUsers = imStoreV2Bridge.aiUsers as ContactsAIUser[]
  const { runWithNavigationLock, isNavigationLocked } = useNavigationLock()

  const loadAiUsers = useCallback(async () => {
    setLoading(true)
    setLoadFailed(false)

    try {
      await imStoreV2Bridge.rootStore?.aiUserStore.getAIUserListActive()
    } catch (error) {
      setLoadFailed(true)
      toast.alert(
        t('commonLoadingFailed'),
        error instanceof Error ? error.message : t('contactsAiUsersLoadFailed')
      )
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    loadAiUsers().catch(() => undefined)
  }, [loadAiUsers])

  const openAiCard = (accountId: string) => {
    runWithNavigationLock(() => {
      router.push({ pathname: '/friend/ai-card', params: { accountId } })
    })
  }

  return (
    <UIKitWhitePage style={styles.container}>
      <Stack.Screen
        options={{
          title: t('contactsAiUsersTitle'),
          headerTitleAlign: 'center',
          headerShown: true
        }}
      />
      <FlatList
        data={aiUsers}
        keyExtractor={(item) => item.accountId}
        removeClippedSubviews
        initialNumToRender={AI_USER_INITIAL_RENDER_COUNT}
        maxToRenderPerBatch={AI_USER_BATCH_RENDER_COUNT}
        windowSize={AI_USER_WINDOW_SIZE}
        updateCellsBatchingPeriod={16}
        getItemLayout={(_, index) => ({
          length: AI_USER_ROW_HEIGHT,
          offset: AI_USER_ROW_HEIGHT * index,
          index
        })}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            {loading ? (
              <ActivityIndicator color="#337EFF" />
            ) : loadFailed ? (
              <>
                <ThemedText style={styles.emptyBodyText}>
                  {t('contactsAiUsersLoadFailed')}
                </ThemedText>
                <Pressable style={styles.retryButton} onPress={loadAiUsers}>
                  <ThemedText style={styles.retryButtonText}>{t('commonRetry')}</ThemedText>
                </Pressable>
              </>
            ) : (
              <UIKitEmptyState title={t('contactsAiUsersEmpty')} />
            )}
          </View>
        }
        renderItem={({ item, index }) => {
          const displayName = item.name || userStore.getDisplayName(item.accountId)

          return (
            <View style={styles.rowWrap}>
              <Pressable
                style={styles.row}
                onPress={() => openAiCard(item.accountId)}
                disabled={isNavigationLocked()}
              >
                <UIKitUserAvatar account={item.accountId} avatar={item.avatar} size={42} />
                <View style={styles.rowBody}>
                  <ThemedText numberOfLines={1} style={styles.nameText}>
                    {displayName}
                  </ThemedText>
                  <ThemedText numberOfLines={1} style={styles.accountText}>
                    {item.accountId}
                  </ThemedText>
                </View>
              </Pressable>
              {index < aiUsers.length - 1 ? <UIKitRowDivider /> : null}
            </View>
          )
        }}
        contentContainerStyle={aiUsers.length === 0 ? styles.emptyContent : undefined}
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
    backgroundColor: '#F2F6FF'
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
  },
  accountText: {
    marginTop: 2,
    color: '#A6AFBB',
    fontSize: 13,
    lineHeight: 18
  }
})

export default AiUsersScreen
