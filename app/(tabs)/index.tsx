import NetInfo from '@react-native-community/netinfo'
import { router, Stack } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React, { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import {
  getUIKitConversationIdentity,
  NEUIKitColors,
  UIKitActionSheet,
  UIKitConversationRow,
  UIKitDropdownMenu,
  UIKitEmptyState,
  UIKitIcon,
  UIKitNoticeBanner,
  UIKitSwipeActionRow,
  UIKitWhitePage
} from '@/src/NEUIKit/rn'
import { authStore, conversationStore, imStoreV2Bridge, messageStore } from '@/stores'
import { MERGED_FORWARD_SUBTYPE } from '@/utils/messageForward'
import {
  V2NIMConversationType,
  V2NIMMessageAttachment,
  V2NIMMessageCallAttachment,
  V2NIMMessageCustomAttachment,
  V2NIMMessageFileAttachment,
  V2NIMMessageType
} from '@/utils/nim-sdk'

type ConversationPreviewMessage = {
  messageType?: V2NIMMessageType
  text?: string
  subType?: number
  attachment?: V2NIMMessageAttachment
}

type ConversationMutationStore = {
  updateConversation?: (conversations: unknown[]) => void
  removeConversation?: (conversationIds: string[]) => void
}

type FormattedConversation = {
  id: string
  title: string
  avatar?: string
  avatarAccount?: string
  subtitle: string
  timeText: string
  unread: number
  muted: boolean
  stickTop: boolean
}

function formatConversationTime(timestamp?: number) {
  if (!timestamp) {
    return ''
  }

  const date = new Date(timestamp)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()

  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return date.toLocaleDateString([], { month: '2-digit', day: '2-digit' })
}

function getPreviewText(message?: ConversationPreviewMessage | null, beMentioned = false) {
  if (!message) {
    return '暂无消息'
  }

  const baseText = (() => {
    switch (message.messageType) {
      case V2NIMMessageType.V2NIM_MESSAGE_TYPE_TEXT:
        return message.text || '暂无消息'
      case V2NIMMessageType.V2NIM_MESSAGE_TYPE_IMAGE:
        return '[图片消息]'
      case V2NIMMessageType.V2NIM_MESSAGE_TYPE_FILE:
        return `[文件消息] ${(message.attachment as V2NIMMessageFileAttachment | undefined)?.name || ''}`.trim()
      case V2NIMMessageType.V2NIM_MESSAGE_TYPE_AUDIO:
        return '[语音消息]'
      case V2NIMMessageType.V2NIM_MESSAGE_TYPE_VIDEO:
        return '[视频消息]'
      case V2NIMMessageType.V2NIM_MESSAGE_TYPE_LOCATION:
        return '[地理位置]'
      case V2NIMMessageType.V2NIM_MESSAGE_TYPE_CALL: {
        const text = (message.attachment as V2NIMMessageCallAttachment | undefined)?.text || ''

        if (text.includes('视频')) {
          return '[视频通话]'
        }

        if (text.includes('音频') || text.includes('语音')) {
          return '[音频通话]'
        }

        return '[音视频通话]'
      }
      case V2NIMMessageType.V2NIM_MESSAGE_TYPE_NOTIFICATION:
        return '[通知消息]'
      case V2NIMMessageType.V2NIM_MESSAGE_TYPE_TIPS:
        return message.text || '[提示消息]'
      case V2NIMMessageType.V2NIM_MESSAGE_TYPE_CUSTOM: {
        const raw = (message.attachment as V2NIMMessageCustomAttachment | undefined)?.raw || ''
        return message.subType === MERGED_FORWARD_SUBTYPE && raw ? '[聊天记录]' : '[未知消息体]'
      }
      default:
        return '[未知消息体]'
    }
  })()

  return beMentioned ? `[有人@我] ${baseText}` : baseText
}

function getImConversationStore() {
  return (
    imStoreV2Bridge.rootStore?.localConversationStore ||
    imStoreV2Bridge.rootStore?.conversationStore ||
    null
  )
}

const HomeScreen = observer(() => {
  const [actionConversationId, setActionConversationId] = useState<string | null>(null)
  const [swipedConversationId, setSwipedConversationId] = useState<string | null>(null)
  const [deletingConversationId, setDeletingConversationId] = useState<string | null>(null)
  const [isDeletingConversation, setIsDeletingConversation] = useState(false)
  const [headerMenuVisible, setHeaderMenuVisible] = useState(false)
  const [networkAvailable, setNetworkAvailable] = useState(true)

  const { conversations, isLoading, isLoadingMore } = conversationStore
  const { isAuthenticated, loginStatus } = authStore
  const didRequestInitialRefreshRef = useRef(false)
  const imConversations = imStoreV2Bridge.conversations
  const sourceConversations = imConversations.length ? imConversations : conversations
  const isUsingImStoreConversations = imConversations.length > 0

  useEffect(() => {
    if (!isAuthenticated || loginStatus !== 1) {
      didRequestInitialRefreshRef.current = false
      return
    }

    if (sourceConversations.length > 0) {
      didRequestInitialRefreshRef.current = true
      return
    }

    if (!didRequestInitialRefreshRef.current && !isLoading) {
      didRequestInitialRefreshRef.current = true
      conversationStore.refreshConversations().catch(() => undefined)
    }
  }, [isAuthenticated, isLoading, loginStatus, sourceConversations.length])

  useEffect(() => {
    const subscription = NetInfo.addEventListener((state) => {
      setNetworkAvailable(!!state.isConnected && state.isInternetReachable !== false)
    })

    return () => subscription()
  }, [])

  const formattedConversations = sourceConversations.map((conversation) => {
    const item = conversation as typeof conversation & {
      name?: string
      avatar?: string
      type?: V2NIMConversationType
      sortOrder?: number
      lastMessage?: ConversationPreviewMessage & { messageRefer?: { createTime?: number } }
      unreadCount?: number
      mute?: boolean
      stickTop?: boolean
      aitMsgs?: unknown[]
    }
    const timestamp = item.sortOrder || item.lastMessage?.messageRefer?.createTime
    const identity = getUIKitConversationIdentity({
      conversationId: item.conversationId,
      type: item.type,
      name: item.name,
      avatar: item.avatar
    })

    return {
      id: item.conversationId,
      title: identity.title,
      avatar: identity.avatarUri,
      avatarAccount: identity.avatarAccount,
      subtitle: getPreviewText(item.lastMessage, !!item.aitMsgs?.length),
      timeText: formatConversationTime(timestamp),
      unread: item.unreadCount || 0,
      muted: !!item.mute,
      stickTop: !!item.stickTop
    }
  }) satisfies FormattedConversation[]

  const actionConversation = formattedConversations.find((item) => item.id === actionConversationId)
  const deletingConversation = formattedConversations.find(
    (item) => item.id === deletingConversationId
  )

  const clearUnread = async (conversationId: string) => {
    const imConversationStore = getImConversationStore()

    if (imConversationStore) {
      await imConversationStore.resetConversation(conversationId)
      return
    }

    await conversationStore.clearUnread(conversationId)
  }

  const handleConversationPress = async (conversationId: string) => {
    void clearUnread(conversationId).catch(() => undefined)

    router.push({ pathname: '/chat/[id]', params: { id: conversationId } })

    try {
      const { isSync } = messageStore.getConversationMessages(conversationId)
      if (!isSync) {
        await messageStore.loadHistory(conversationId)
      }
    } catch (error) {
      console.warn('预加载历史消息失败', error)
    }
  }

  const closeActions = () => {
    setActionConversationId(null)
    setSwipedConversationId(null)
  }

  const runConversationAction = async (action: () => Promise<void>) => {
    try {
      await action()
    } catch (error) {
      Alert.alert('操作失败', error instanceof Error ? error.message : '请稍后重试')
    } finally {
      closeActions()
    }
  }

  const toggleStickTop = async (conversationId: string, stickTop: boolean) => {
    await runConversationAction(async () => {
      const imConversationStore = getImConversationStore()
      if (imConversationStore) {
        const nextStickTop = !stickTop
        await imConversationStore.stickTopConversationActive(conversationId, nextStickTop)
        const conversation = imConversationStore.conversations.get(conversationId)

        if (conversation) {
          const mutationStore = imConversationStore as ConversationMutationStore
          mutationStore.updateConversation?.([{ ...conversation, stickTop: nextStickTop }])
        }
        return
      }

      await conversationStore.toggleStickTop(conversationId, !stickTop)
    })
  }

  const deleteConversation = (conversationId: string) => {
    setDeletingConversationId(conversationId)
    setActionConversationId(null)
    setSwipedConversationId(null)
  }

  const confirmDeleteConversation = async () => {
    if (!deletingConversationId || isDeletingConversation) {
      return
    }

    setIsDeletingConversation(true)
    try {
      const imConversationStore = getImConversationStore()
      if (imConversationStore) {
        await imConversationStore.deleteConversationActive(deletingConversationId)
        const mutationStore = imConversationStore as ConversationMutationStore
        mutationStore.removeConversation?.([deletingConversationId])
      } else {
        await conversationStore.deleteConversation(deletingConversationId)
      }

      setDeletingConversationId(null)
    } catch (error) {
      Alert.alert('删除失败', error instanceof Error ? error.message : '请稍后重试')
    } finally {
      setIsDeletingConversation(false)
    }
  }

  return (
    <UIKitWhitePage>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <View style={styles.headerTitle}>
              <UIKitIcon type="logo" width={34} height={34} />
              <ThemedText style={styles.headerTitleText}>云信Demo</ThemedText>
            </View>
          ),
          headerTitleAlign: 'left',
          headerRight: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => router.push('/conversation/search' as never)}
              >
                <UIKitIcon type="icon-sousuo" size={20} tintColor="#333333" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => setHeaderMenuVisible(true)}
              >
                <UIKitIcon type="icon-tianjiaanniu" size={22} tintColor="#333333" />
              </TouchableOpacity>
            </View>
          )
        }}
      />

      <FlatList
        data={formattedConversations}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          !networkAvailable ? (
            <UIKitNoticeBanner text="当前网络不可用，请检查你当前网络设置。" />
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => {
              conversationStore.refreshConversations()
            }}
          />
        }
        ListEmptyComponent={
          <UIKitEmptyState title="暂无会话" subtitle="从搜索好友或创建群聊开始。" />
        }
        renderItem={({ item }) => {
          const isSwipeOpen = swipedConversationId === item.id

          return (
            <UIKitSwipeActionRow
              open={isSwipeOpen}
              onOpen={() => {
                setSwipedConversationId(item.id)
                setActionConversationId(null)
              }}
              onClose={() => {
                setSwipedConversationId((current) => (current === item.id ? null : current))
              }}
              actions={[
                {
                  label: item.stickTop ? '取消置顶' : '置顶',
                  color: NEUIKitColors.primary,
                  onPress: () => {
                    toggleStickTop(item.id, item.stickTop).catch(() => undefined)
                  }
                },
                {
                  label: '删除',
                  color: '#A8ABB6',
                  onPress: () => deleteConversation(item.id)
                }
              ]}
            >
              <UIKitConversationRow
                title={item.title}
                subtitle={item.subtitle}
                avatar={item.avatar}
                avatarAccount={item.avatarAccount}
                badge={item.unread}
                muted={item.muted}
                pinned={item.stickTop}
                meta={item.timeText}
                onPress={() => {
                  if (isSwipeOpen) {
                    closeActions()
                    return
                  }

                  handleConversationPress(item.id).catch(() => undefined)
                }}
                onLongPress={() => {
                  setActionConversationId(item.id)
                  setSwipedConversationId(null)
                }}
              />
            </UIKitSwipeActionRow>
          )
        }}
        onEndReachedThreshold={0.3}
        onEndReached={() => {
          if (!isUsingImStoreConversations) {
            conversationStore.loadMoreConversations()
          }
        }}
        ListFooterComponent={
          isLoadingMore ? (
            <View style={styles.footerLoading}>
              <ActivityIndicator color={NEUIKitColors.primary} />
            </View>
          ) : null
        }
      />

      <UIKitActionSheet
        visible={!!actionConversation}
        title={actionConversation?.title || '会话操作'}
        onClose={closeActions}
        actions={[
          {
            label: actionConversation?.stickTop ? '取消置顶' : '置顶会话',
            onPress: () =>
              toggleStickTop(actionConversation!.id, !!actionConversation?.stickTop).catch(
                () => undefined
              )
          },
          {
            label: actionConversation?.muted ? '关闭免打扰' : '开启免打扰',
            onPress: () =>
              runConversationAction(() =>
                conversationStore.toggleMute(actionConversation!.id, !actionConversation?.muted)
              )
          },
          {
            label: '清除未读',
            onPress: () => runConversationAction(() => clearUnread(actionConversation!.id))
          },
          {
            label: '删除会话',
            danger: true,
            onPress: () => deleteConversation(actionConversation!.id)
          }
        ]}
      />

      <UIKitActionSheet
        visible={!!deletingConversation}
        title={`将会话“${deletingConversation?.title || '当前会话'}”删除`}
        onClose={() => {
          if (!isDeletingConversation) {
            setDeletingConversationId(null)
          }
        }}
        actions={[
          {
            label: isDeletingConversation ? '删除中...' : '删除会话',
            danger: true,
            onPress: () => {
              if (!isDeletingConversation) {
                confirmDeleteConversation().catch(() => undefined)
              }
            }
          }
        ]}
      />

      <UIKitDropdownMenu
        visible={headerMenuVisible}
        top={88}
        right={14}
        onClose={() => setHeaderMenuVisible(false)}
        actions={[
          {
            label: '添加好友',
            icon: 'icon-tianjiahaoyou',
            onPress: () => {
              setHeaderMenuVisible(false)
              router.push('/friend/add' as never)
            }
          },
          {
            label: '创建高级群',
            icon: 'icon-chuangjianqunzu',
            onPress: () => {
              setHeaderMenuVisible(false)
              router.push('/conversation/picker' as never)
            }
          }
        ]}
      />
    </UIKitWhitePage>
  )
})

const styles = StyleSheet.create({
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  headerTitleText: {
    color: '#222222',
    fontSize: 22,
    fontWeight: '700'
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 8
  },
  headerButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center'
  },
  footerLoading: {
    paddingVertical: 20
  }
})

export default HomeScreen
