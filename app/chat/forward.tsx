import { Image } from 'expo-image'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import {
  getUIKitAppellation,
  UIKitChatEmptyState,
  UIKitChatHeaderTitle,
  UIKitChatSearchBar,
  UIKitSelectionIndicator
} from '@/src/NEUIKit/rn'
import {
  conversationStore,
  forwardStore,
  friendStore,
  messageStore,
  nimStore,
  teamStore,
  userStore
} from '@/stores'
import {
  getForwardPreview,
  getMergedForwardNestedLevel,
  getMessageKey,
  isForwardableMessage,
  MAX_FORWARD_TARGETS,
  MergedForwardPayload,
  parseMergedForwardPayload
} from '@/utils/messageForward'
import { ensureNetworkAvailable, NETWORK_UNAVAILABLE_MESSAGE } from '@/utils/network'
import {
  V2NIMConversationType,
  V2NIMMessage,
  V2NIMMessageAudioAttachment,
  V2NIMMessageFileAttachment,
  V2NIMMessageLocationAttachment,
  V2NIMMessageVideoAttachment
} from '@/utils/nim-sdk'

type ForwardMode = 'single' | 'serial' | 'merged'

type ForwardTarget = {
  conversationId: string
  targetId: string
  title: string
  subtitle: string
  avatar?: string
  conversationType: V2NIMConversationType
  valid: boolean
}

function getMessageDisplayName(
  accountId: string,
  conversationType?: V2NIMConversationType,
  teamId?: string
) {
  return (
    getUIKitAppellation({
      account: accountId,
      teamId:
        conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM ? teamId : undefined
    }) || accountId
  )
}

function getForwardModeLabel(mode: ForwardMode) {
  switch (mode) {
    case 'serial':
      return '逐条转发'
    case 'merged':
      return '合并转发'
    default:
      return '转发'
  }
}

function getAttachmentSource(
  attachment?:
    | V2NIMMessageFileAttachment
    | V2NIMMessageAudioAttachment
    | V2NIMMessageVideoAttachment
    | null
) {
  return attachment?.url || attachment?.path || ''
}

function buildMergedForwardPayload(
  messages: V2NIMMessage[],
  sourceTitle: string,
  sourceConversationType?: V2NIMConversationType,
  sourceTargetId?: string
) {
  const sortedMessages = messages.slice().sort((left, right) => left.createTime - right.createTime)
  const items = sortedMessages.map((message) => {
    const nestedPayload = parseMergedForwardPayload(message)

    return {
      messageId: getMessageKey(message),
      senderId: message.senderId,
      senderName: getMessageDisplayName(message.senderId, sourceConversationType, sourceTargetId),
      createTime: message.createTime,
      messageType: message.messageType,
      preview: getForwardPreview(message),
      text: message.text,
      attachmentName: (message.attachment as V2NIMMessageFileAttachment | undefined)?.name,
      attachmentUrl: getAttachmentSource(
        message.attachment as
          | V2NIMMessageFileAttachment
          | V2NIMMessageAudioAttachment
          | V2NIMMessageVideoAttachment
          | undefined
      ),
      attachmentSize: (message.attachment as V2NIMMessageFileAttachment | undefined)?.size,
      attachmentDuration: (
        message.attachment as V2NIMMessageAudioAttachment | V2NIMMessageVideoAttachment | undefined
      )?.duration,
      attachmentWidth: (message.attachment as V2NIMMessageVideoAttachment | undefined)?.width,
      attachmentHeight: (message.attachment as V2NIMMessageVideoAttachment | undefined)?.height,
      attachmentAddress: (message.attachment as V2NIMMessageLocationAttachment | undefined)
        ?.address,
      attachmentLatitude: (message.attachment as V2NIMMessageLocationAttachment | undefined)
        ?.latitude,
      attachmentLongitude: (message.attachment as V2NIMMessageLocationAttachment | undefined)
        ?.longitude,
      mergedPayload: nestedPayload || undefined
    }
  })

  return {
    title: `${sourceTitle || '聊天'}的消息`,
    previewList: items.slice(0, 3).map((item) => `${item.senderName}: ${item.preview}`),
    nestedLevel: Math.max(
      1,
      ...sortedMessages.map((message) => getMergedForwardNestedLevel(message) + 1)
    ),
    messages: items
  } as MergedForwardPayload
}

function buildConfirmPreview(
  mode: ForwardMode,
  messages: V2NIMMessage[],
  sourceConversationType?: V2NIMConversationType,
  sourceTargetId?: string
) {
  if (messages.length === 0) {
    return '未找到可转发的消息'
  }

  if (messages.length === 1 && mode === 'single') {
    return getForwardPreview(messages[0])
  }

  return `[${getForwardModeLabel(mode)}]${getMessageDisplayName(
    messages[0].senderId,
    sourceConversationType,
    sourceTargetId
  )}的会话记录`
}

const ForwardMessageScreen = observer(() => {
  const { conversationId, messageId, messageIds, mode, sourceTitle } = useLocalSearchParams<{
    conversationId?: string
    messageId?: string
    messageIds?: string
    mode?: string
    sourceTitle?: string
  }>()
  const [keyword, setKeyword] = useState('')
  const [confirmVisible, setConfirmVisible] = useState(false)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [pendingTargetId, setPendingTargetId] = useState<string | null>(null)
  const [recentForwardLoading, setRecentForwardLoading] = useState(false)
  const [recentForwardLoadFailed, setRecentForwardLoadFailed] = useState(false)

  const sourceConversationId = typeof conversationId === 'string' ? conversationId : ''
  const sourceConversation = conversationStore.getConversation(sourceConversationId)
  const sourceConversationType =
    nimStore.nim?.V2NIMConversationIdUtil.parseConversationType(sourceConversationId)
  const sourceTargetId =
    nimStore.nim?.V2NIMConversationIdUtil.parseConversationTargetId(sourceConversationId)
  const forwardMode = (
    mode === 'serial' || mode === 'merged' || mode === 'single' ? mode : 'single'
  ) as ForwardMode
  const normalizedKeyword = keyword.trim().toLowerCase()

  const loadRecentForwardTargets = useCallback(async () => {
    setRecentForwardLoading(true)
    setRecentForwardLoadFailed(false)

    try {
      await messageStore.loadRecentForwardConversations()
    } catch (error) {
      setRecentForwardLoadFailed(true)
      Alert.alert('加载失败', error instanceof Error ? error.message : '最近转发加载失败')
    } finally {
      setRecentForwardLoading(false)
    }
  }, [])

  useEffect(() => {
    loadRecentForwardTargets().catch(() => undefined)
    forwardStore.reset()

    return () => {
      forwardStore.reset()
    }
  }, [loadRecentForwardTargets])

  const rawMessageIds = useMemo(() => {
    if (typeof messageIds === 'string' && messageIds.trim()) {
      return messageIds.split(',').filter(Boolean)
    }

    if (typeof messageId === 'string' && messageId) {
      return [messageId]
    }

    return []
  }, [messageId, messageIds])

  const sourceMessages = useMemo(
    () =>
      rawMessageIds
        .map((item) => messageStore.getMessageById(sourceConversationId, item))
        .filter(Boolean)
        .sort((left, right) => left!.createTime - right!.createTime) as V2NIMMessage[],
    [rawMessageIds, sourceConversationId]
  )

  const forwardableMessages = useMemo(() => {
    return sourceMessages.filter((message) =>
      isForwardableMessage(message, messageStore.getRevokedText(message))
    )
  }, [sourceMessages])

  const recentForwardTargets = messageStore.recentForwardConversationIds
    .map((item) => conversationStore.getConversation(item))
    .filter(Boolean)
    .map((conversation) => {
      const targetId = nimStore.nim!.V2NIMConversationIdUtil.parseConversationTargetId(
        conversation!.conversationId
      )
      const conversationType = nimStore.nim!.V2NIMConversationIdUtil.parseConversationType(
        conversation!.conversationId
      )

      return {
        conversationId: conversation!.conversationId,
        targetId,
        title: conversation!.name || userStore.getDisplayName(targetId),
        subtitle:
          conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM
            ? `群聊 · ${targetId}`
            : targetId,
        avatar: conversation!.avatar,
        conversationType,
        valid:
          conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM
            ? !!teamStore.getTeam(targetId)
            : !!friendStore.friends.get(targetId) || targetId === nimStore.getLoginUser()
      } as ForwardTarget
    })

  const recentConversationTargets = !nimStore.nim
    ? []
    : conversationStore.conversations.slice(0, 100).map((conversation) => {
        const targetId = nimStore.nim!.V2NIMConversationIdUtil.parseConversationTargetId(
          conversation.conversationId
        )
        const conversationType = nimStore.nim!.V2NIMConversationIdUtil.parseConversationType(
          conversation.conversationId
        )
        const team = teamStore.getTeam(targetId)
        const friend = friendStore.friends.get(targetId)

        return {
          conversationId: conversation.conversationId,
          targetId,
          title:
            conversation.name ||
            team?.name ||
            friend?.alias ||
            friend?.userProfile?.name ||
            userStore.getDisplayName(targetId),
          subtitle:
            conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM
              ? `群聊 · ${targetId}`
              : targetId,
          avatar: conversation.avatar || team?.avatar || friend?.userProfile?.avatar,
          conversationType,
          valid:
            conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM
              ? !!team
              : !!friend || targetId === nimStore.getLoginUser()
        } as ForwardTarget
      })

  const friendTargets = !nimStore.nim
    ? []
    : friendStore.friendList.map((friend) => ({
        conversationId: nimStore.nim!.V2NIMConversationIdUtil.p2pConversationId(friend.accountId),
        targetId: friend.accountId,
        title:
          friend.alias || friend.userProfile?.name || userStore.getDisplayName(friend.accountId),
        subtitle: friend.accountId,
        avatar: friend.userProfile?.avatar,
        conversationType: V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P,
        valid: true
      }))

  const teamTargets = !nimStore.nim
    ? []
    : teamStore.teamList.map((team) => ({
        conversationId: nimStore.nim!.V2NIMConversationIdUtil.teamConversationId(team.teamId),
        targetId: team.teamId,
        title: team.name || team.teamId,
        subtitle: `群聊 · ${team.teamId}`,
        avatar: team.avatar,
        conversationType: V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM,
        valid: true
      }))

  const filterTargets = (targets: ForwardTarget[]) =>
    targets.filter((item) => {
      if (!normalizedKeyword) {
        return true
      }

      return (
        item.title.toLowerCase().includes(normalizedKeyword) ||
        item.subtitle.toLowerCase().includes(normalizedKeyword) ||
        item.targetId.toLowerCase().includes(normalizedKeyword)
      )
    })

  const displayedRecentForwardTargets = filterTargets(recentForwardTargets)
  const displayedRecentConversationTargets = filterTargets(recentConversationTargets)
  const displayedFriendTargets = filterTargets(friendTargets)
  const displayedTeamTargets = filterTargets(teamTargets)

  const targetMap = new Map<string, ForwardTarget>()

  ;[
    ...recentForwardTargets,
    ...recentConversationTargets,
    ...friendTargets,
    ...teamTargets
  ].forEach((item) => {
    targetMap.set(item.conversationId, item)
  })

  const selectedTargets = forwardStore.selectedConversationIds
    .map((item) => targetMap.get(item))
    .filter(Boolean) as ForwardTarget[]
  const confirmTargets = pendingTargetId
    ? ([targetMap.get(pendingTargetId)].filter(Boolean) as ForwardTarget[])
    : selectedTargets

  const handleTargetPress = (target: ForwardTarget) => {
    if (!target.valid) {
      Alert.alert('无法转发', '目标会话已失效，请重新选择有效的联系人或群聊')
      return
    }

    if (!forwardStore.multiTargetMode) {
      setPendingTargetId(target.conversationId)
      setConfirmVisible(true)
      return
    }

    if (
      !forwardStore.selectedConversationIds.includes(target.conversationId) &&
      forwardStore.selectedConversationIds.length >= MAX_FORWARD_TARGETS
    ) {
      Alert.alert('操作失败', `最多选择${MAX_FORWARD_TARGETS}个会话`)
      return
    }

    forwardStore.toggleConversation(target.conversationId)
  }

  const openConfirmForSelectedTargets = () => {
    if (!forwardStore.multiTargetMode) {
      forwardStore.setMultiTargetMode(true)
      return
    }

    if (selectedTargets.length === 0) {
      Alert.alert('操作失败', '请至少选择一个有效会话')
      return
    }

    setPendingTargetId(null)
    setConfirmVisible(true)
  }

  const handleConfirmForward = async () => {
    if (sourceMessages.length === 0 || submitting) {
      return
    }

    if (confirmTargets.length === 0) {
      Alert.alert('转发失败', '请选择有效的转发会话')
      return
    }

    const validMessages = forwardableMessages

    if (validMessages.length === 0) {
      Alert.alert('转发失败', '存在不可转发的消息体')
      setConfirmVisible(false)
      return
    }

    if (forwardMode === 'merged') {
      const blockedMessages = validMessages.filter(
        (message) => getMergedForwardNestedLevel(message) > 2
      )

      if (blockedMessages.length > 0) {
        Alert.alert('转发失败', '存在超出合并限制的消息，无法合并转发')
        setConfirmVisible(false)
        return
      }
    }

    try {
      setSubmitting(true)
      await ensureNetworkAvailable()

      for (const target of confirmTargets) {
        if (!conversationStore.getConversation(target.conversationId)) {
          await conversationStore.createConversation(target.conversationId)
        }

        if (forwardMode === 'serial') {
          await messageStore.forwardMessages(validMessages, target.conversationId, comment)
          continue
        }

        if (forwardMode === 'merged') {
          const payload = buildMergedForwardPayload(
            validMessages,
            typeof sourceTitle === 'string' ? sourceTitle : sourceConversation?.name || '聊天记录',
            sourceConversationType,
            sourceTargetId
          )

          await messageStore.sendMergedForwardMessage(target.conversationId, payload, comment)
          continue
        }

        await messageStore.forwardMessage(validMessages[0], target.conversationId, comment)
      }

      setConfirmVisible(false)
      setComment('')
      forwardStore.reset()
      setPendingTargetId(null)
      router.back()
    } catch (error) {
      Alert.alert('转发失败', error instanceof Error ? error.message : NETWORK_UNAVAILABLE_MESSAGE)
    } finally {
      setSubmitting(false)
    }
  }

  const renderAvatar = (target: ForwardTarget, size = 52) => {
    if (target.avatar) {
      return (
        <Image
          source={target.avatar}
          style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: '#D8E0EA' }}
          contentFit="cover"
        />
      )
    }

    return (
      <View style={[styles.avatarFallback, { width: size, height: size, borderRadius: size / 2 }]}>
        <ThemedText
          style={[styles.avatarFallbackText, size <= 36 && styles.avatarFallbackTextSmall]}
        >
          {target.title.slice(0, 1).toUpperCase()}
        </ThemedText>
      </View>
    )
  }

  const renderTargetRow = (target: ForwardTarget) => {
    const selected =
      target.conversationId === pendingTargetId ||
      forwardStore.selectedConversationIds.includes(target.conversationId)

    return (
      <TouchableOpacity
        key={target.conversationId}
        style={[styles.row, selected && styles.rowSelected, !target.valid && styles.rowDisabled]}
        onPress={() => handleTargetPress(target)}
      >
        <UIKitSelectionIndicator selected={selected} style={styles.rowIndicator} />
        {renderAvatar(target, 54)}
        <View style={styles.meta}>
          <ThemedText numberOfLines={1} style={styles.title}>
            {target.title}
          </ThemedText>
          <ThemedText numberOfLines={1} style={styles.subText}>
            {target.subtitle}
          </ThemedText>
        </View>
      </TouchableOpacity>
    )
  }

  const confirmPreview = buildConfirmPreview(
    forwardMode,
    sourceMessages,
    sourceConversationType,
    sourceTargetId
  )

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: () => <UIKitChatHeaderTitle title="选择" />,
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#FFFFFF' },
          headerRight: () => (
            <TouchableOpacity style={styles.headerButton} onPress={openConfirmForSelectedTargets}>
              <ThemedText style={styles.headerButtonText}>
                {forwardStore.multiTargetMode ? '确定' : '多选'}
              </ThemedText>
            </TouchableOpacity>
          )
        }}
      />

      <View style={styles.topArea}>
        <UIKitChatSearchBar
          value={keyword}
          onChangeText={setKeyword}
          placeholder="搜索好友"
          returnKeyType="search"
        />

        {forwardStore.multiTargetMode ? (
          <TouchableOpacity
            style={styles.selectedStrip}
            onPress={() => router.push('/chat/forward-selected' as never)}
          >
            <View style={styles.selectedAvatarRow}>
              {selectedTargets.slice(0, 4).map((target) => (
                <View key={target.conversationId} style={styles.selectedAvatarItem}>
                  {renderAvatar(target, 34)}
                </View>
              ))}
            </View>
            <ThemedText style={styles.selectedStripText}>
              已选择 {forwardStore.selectedConversationIds.length} 个会话
            </ThemedText>
          </TouchableOpacity>
        ) : null}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {!normalizedKeyword &&
        (recentForwardLoading ||
          recentForwardLoadFailed ||
          displayedRecentForwardTargets.length > 0) ? (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>最近转发</ThemedText>
            {recentForwardLoading ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator color="#337EFF" />
              </View>
            ) : recentForwardLoadFailed ? (
              <UIKitChatEmptyState
                title="最近转发加载失败"
                actionLabel="重试"
                onActionPress={() => {
                  loadRecentForwardTargets().catch(() => undefined)
                }}
              />
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.recentRow}>
                  {displayedRecentForwardTargets.map((target) => (
                    <TouchableOpacity
                      key={`recent-forward-${target.conversationId}`}
                      style={styles.recentItem}
                      onPress={() => handleTargetPress(target)}
                    >
                      {renderAvatar(target, 58)}
                      <ThemedText numberOfLines={1} style={styles.recentLabel}>
                        {target.title}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            )}
          </View>
        ) : null}

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>最近聊天</ThemedText>
          {displayedRecentConversationTargets.length > 0 ? (
            displayedRecentConversationTargets.map(renderTargetRow)
          ) : (
            <UIKitChatEmptyState
              title="暂无会话"
              description="进入聊天后可从最近会话里快速转发。"
            />
          )}
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>我的好友</ThemedText>
          {displayedFriendTargets.length > 0 ? (
            displayedFriendTargets.map(renderTargetRow)
          ) : (
            <UIKitChatEmptyState title="暂无好友" description="请先添加好友后再转发消息。" />
          )}
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>我的群聊</ThemedText>
          {displayedTeamTargets.length > 0 ? (
            displayedTeamTargets.map(renderTargetRow)
          ) : (
            <UIKitChatEmptyState title="暂无群聊" description="加入群聊后可以把消息转发到这里。" />
          )}
        </View>
      </ScrollView>

      <Modal
        transparent
        visible={confirmVisible}
        animationType="fade"
        onRequestClose={() => setConfirmVisible(false)}
      >
        <Pressable style={styles.modalMask} onPress={() => setConfirmVisible(false)}>
          <Pressable style={styles.modalCard} onPress={() => undefined}>
            <ThemedText style={styles.modalTitle}>发送给</ThemedText>
            <View style={styles.modalAvatarRow}>
              {confirmTargets.map((target) => (
                <View key={target.conversationId} style={styles.modalAvatarWrap}>
                  {renderAvatar(target, 50)}
                </View>
              ))}
            </View>
            <View style={styles.previewBox}>
              <ThemedText numberOfLines={2} style={styles.previewText}>
                {confirmPreview}
              </ThemedText>
            </View>
            <TextInput
              style={styles.commentInput}
              value={comment}
              onChangeText={setComment}
              placeholder="留言"
              placeholderTextColor="#B4BCC7"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setConfirmVisible(false)}
                disabled={submitting}
              >
                <ThemedText style={styles.modalCancelText}>取消</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleConfirmForward}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#337EFF" />
                ) : (
                  <ThemedText style={styles.modalConfirmText}>发送</ThemedText>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ThemedView>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB'
  },
  headerButton: {
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  headerButtonText: {
    color: '#337EFF',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700'
  },
  topArea: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    gap: 12
  },
  selectedStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  selectedAvatarRow: {
    flexDirection: 'row'
  },
  selectedAvatarItem: {
    marginRight: 8
  },
  selectedStripText: {
    color: '#6C7687',
    fontSize: 14,
    lineHeight: 20
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 30
  },
  section: {
    marginBottom: 20
  },
  sectionTitle: {
    marginBottom: 12,
    color: '#8E98A8',
    fontSize: 16,
    lineHeight: 22
  },
  loadingWrap: {
    paddingVertical: 32,
    alignItems: 'center'
  },
  recentRow: {
    flexDirection: 'row',
    gap: 18,
    paddingVertical: 4
  },
  recentItem: {
    width: 72,
    alignItems: 'center',
    gap: 8
  },
  recentLabel: {
    color: '#586171',
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 12
  },
  rowSelected: {
    backgroundColor: '#F2F7FF'
  },
  rowDisabled: {
    opacity: 0.5
  },
  rowIndicator: {
    marginRight: 14
  },
  avatarFallback: {
    backgroundColor: '#337EFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarFallbackText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700'
  },
  avatarFallbackTextSmall: {
    fontSize: 14
  },
  meta: {
    flex: 1,
    marginLeft: 14,
    gap: 4
  },
  title: {
    color: '#2F3642',
    fontSize: 18,
    lineHeight: 25,
    fontWeight: '700'
  },
  subText: {
    color: '#A0A9B5',
    fontSize: 13,
    lineHeight: 18
  },
  modalMask: {
    flex: 1,
    backgroundColor: 'rgba(10, 16, 24, 0.42)',
    justifyContent: 'center',
    paddingHorizontal: 20
  },
  modalCard: {
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden'
  },
  modalTitle: {
    color: '#2E3541',
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '800',
    paddingHorizontal: 20,
    paddingTop: 22
  },
  modalAvatarRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14
  },
  modalAvatarWrap: {
    marginRight: 2
  },
  previewBox: {
    marginHorizontal: 20,
    borderRadius: 14,
    backgroundColor: '#EEF2F7',
    paddingHorizontal: 16,
    paddingVertical: 18
  },
  previewText: {
    color: '#4B5567',
    fontSize: 15,
    lineHeight: 22
  },
  commentInput: {
    minHeight: 58,
    marginHorizontal: 20,
    marginTop: 14,
    marginBottom: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D9E0E8',
    paddingHorizontal: 16,
    color: '#2E3541',
    fontSize: 16
  },
  modalActions: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#D9E0E8'
  },
  modalButton: {
    flex: 1,
    minHeight: 68,
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalButtonPrimary: {
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: '#D9E0E8'
  },
  modalCancelText: {
    color: '#505A6B',
    fontSize: 19,
    lineHeight: 26
  },
  modalConfirmText: {
    color: '#337EFF',
    fontSize: 19,
    lineHeight: 26,
    fontWeight: '700'
  }
})

export default ForwardMessageScreen
