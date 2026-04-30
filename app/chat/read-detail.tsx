import { Stack, useLocalSearchParams } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import {
  getUIKitAppellation,
  UIKitChatEmptyState,
  UIKitChatHeaderTitle,
  UIKitChatMemberRow,
  UIKitSegmentTabs
} from '@/src/NEUIKit/rn'
import { messageStore, nimStore, teamStore, userStore } from '@/stores'

const ReadDetailScreen = observer(() => {
  const { conversationId, messageId, teamId } = useLocalSearchParams<{
    conversationId?: string
    messageId?: string
    teamId?: string
  }>()
  const resolvedConversationId = typeof conversationId === 'string' ? conversationId : ''
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
      setLoadError(error instanceof Error ? error.message : '阅读状态加载失败')
      setLoading(false)
    })
  }, [loadDetail])

  const currentList =
    activeTab === 'read' ? (detail?.readAccountList ?? []) : (detail?.unreadAccountList ?? [])
  const currentEmptyText = activeTab === 'read' ? '全部成员暂未读' : '全部成员已读'

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: () => <UIKitChatHeaderTitle title="消息阅读状态" />,
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#FFFFFF' }
        }}
      />

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
                setLoadError(error instanceof Error ? error.message : '阅读状态加载失败')
                setLoading(false)
              })
            }}
          >
            <ThemedText style={styles.retryText}>重试</ThemedText>
          </TouchableOpacity>
        </View>
      ) : !detail ? (
        <UIKitChatEmptyState
          title="暂无阅读状态"
          description="当前消息还没有可展示的已读未读详情。"
        />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <UIKitSegmentTabs
            items={[
              { key: 'read', label: `已读(${detail.readReceipt.readCount})` },
              { key: 'unread', label: `未读(${detail.readReceipt.unreadCount})` }
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
                description="阅读状态会随着消息回执实时更新。"
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
