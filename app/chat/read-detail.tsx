import { router, Stack, useLocalSearchParams } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { useAppTranslation } from '@/hooks/useAppTranslation'
import {
  getUIKitAppellation,
  UIKitChatEmptyState,
  UIKitChatMemberRow,
  UIKitHeaderBackButton,
  UIKitSegmentTabs
} from '@/src/NEUIKit/rn'
import { messageStore, nimStore, teamStore, userStore } from '@/stores'
import { getDisplayErrorMessage } from '@/utils/error-message'

const ReadDetailScreen = observer(() => {
  const { t } = useAppTranslation()
  const insets = useSafeAreaInsets()
  const {
    conversationId,
    readConversationId: routeReadConversationId,
    messageId,
    teamId
  } = useLocalSearchParams<{
    conversationId?: string
    readConversationId?: string
    messageId?: string
    teamId?: string
  }>()
  const readConversationId =
    typeof routeReadConversationId === 'string'
      ? routeReadConversationId
      : typeof conversationId === 'string'
        ? conversationId
        : ''
  const resolvedConversationId = readConversationId
  const resolvedMessageId = typeof messageId === 'string' ? messageId : ''
  const resolvedTeamId = typeof teamId === 'string' ? teamId : ''
  const currentUserId = nimStore.getLoginUser()
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [activeTab, setActiveTab] = useState<'read' | 'unread'>('read')
  const [detail, setDetail] = useState<Awaited<
    ReturnType<typeof messageStore.getTeamMessageReceiptDetail>
  > | null>(null)

  const loadDetail = useCallback(async () => {
    if (!currentUserId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setLoadError('')
    const message = messageStore.getMessageById(resolvedConversationId, resolvedMessageId)

    if (!message) {
      setLoading(false)
      return
    }

    if (resolvedTeamId) {
      await teamStore.loadMembers(resolvedTeamId)
    }

    const nextDetail = await messageStore.getTeamMessageReceiptDetail(message)
    const accountIds = Array.from(
      new Set([...(nextDetail?.readAccountList || []), ...(nextDetail?.unreadAccountList || [])])
    )

    await userStore.fetchUsers(accountIds).catch(() => undefined)
    setDetail(nextDetail)
    setLoading(false)
  }, [currentUserId, resolvedConversationId, resolvedMessageId, resolvedTeamId])

  useEffect(() => {
    loadDetail().catch((error) => {
      setLoadError(getDisplayErrorMessage(error, t('readDetailLoadFailed')))
      setLoading(false)
    })
  }, [loadDetail, t])

  const currentList =
    activeTab === 'read' ? (detail?.readAccountList ?? []) : (detail?.unreadAccountList ?? [])
  const currentEmptyText = activeTab === 'read' ? t('readDetailAllUnread') : t('readDetailAllRead')

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false
        }}
      />
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerSide}>
          <UIKitHeaderBackButton onPress={() => router.back()} />
        </View>
        <ThemedText numberOfLines={1} style={styles.headerTitle}>
          {t('readDetailTitle')}
        </ThemedText>
        <View style={styles.headerSide} />
      </View>

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator color="#337EFF" />
        </View>
      ) : loadError ? (
        <View style={styles.centerState}>
          <ThemedText>{loadError}</ThemedText>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              loadDetail().catch((error) => {
                setLoadError(getDisplayErrorMessage(error, t('readDetailLoadFailed')))
                setLoading(false)
              })
            }}
          >
            <ThemedText style={styles.retryText}>{t('commonRetry')}</ThemedText>
          </TouchableOpacity>
        </View>
      ) : !detail ? (
        <UIKitChatEmptyState
          title={t('readDetailEmptyTitle')}
          description={t('readDetailEmptyDescription')}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <UIKitSegmentTabs
            items={[
              {
                key: 'read',
                label: t('readDetailReadTab', { count: detail.readReceipt.readCount })
              },
              {
                key: 'unread',
                label: t('readDetailUnreadTab', { count: detail.readReceipt.unreadCount })
              }
            ]}
            activeKey={activeTab}
            onChange={setActiveTab}
            style={styles.tabs}
          />
          <View style={styles.listSurface}>
            {currentList.length > 0 ? (
              currentList.map((accountId) => (
                <MemberRow key={accountId} accountId={accountId} teamId={resolvedTeamId} />
              ))
            ) : (
              <UIKitChatEmptyState
                title={currentEmptyText}
                description={t('readDetailRealtimeDescription')}
              />
            )}
          </View>
        </ScrollView>
      )}
    </ThemedView>
  )
})

function MemberRow({ accountId, teamId }: { accountId: string; teamId: string }) {
  const name = getUIKitAppellation({ account: accountId, teamId }) || accountId

  return <UIKitChatMemberRow account={accountId} teamId={teamId} title={name} />
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB'
  },
  header: {
    minHeight: 44,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ECF0F5',
    flexDirection: 'row',
    alignItems: 'flex-end'
  },
  headerSide: {
    width: 56,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: {
    flex: 1,
    height: 44,
    color: '#111827',
    fontSize: 17,
    lineHeight: 44,
    fontWeight: '700',
    textAlign: 'center'
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  retryButton: {
    marginTop: 16,
    minHeight: 40,
    minWidth: 88,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#337EFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '700'
  },
  content: {
    paddingBottom: 30
  },
  tabs: {
    paddingHorizontal: 12
  },
  listSurface: {
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ECF0F5',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ECF0F5'
  }
})

export default ReadDetailScreen
