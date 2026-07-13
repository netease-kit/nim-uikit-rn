import { Image } from 'expo-image'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  ListRenderItemInfo,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { useAppTranslation } from '@/hooks/useAppTranslation'
import { toast } from '@/src/NEUIKit/common/utils/toast'
import {
  getUIKitAppellation,
  getUIKitAvatarUri,
  getUIKitUserAvatarLabel,
  UIKitChatEmptyState,
  UIKitChatHeaderTitle,
  UIKitChatHighlightText,
  UIKitChatSearchBar,
  UIKitSelectionIndicator
} from '@/src/NEUIKit/rn'
import {
  conversationStore,
  forwardStore,
  friendStore,
  imStoreV2Bridge,
  messageStore,
  nimStore,
  teamStore,
  userStore
} from '@/stores'
import {
  getMergedForwardNestedLevel,
  isForwardableMessage,
  MAX_FORWARD_TARGETS
} from '@/utils/messageForward'
import { ensureNetworkAvailable, NETWORK_UNAVAILABLE_MESSAGE } from '@/utils/network'
import { V2NIMConversationType, V2NIMMessage, V2NIMMessageSendingState } from '@/utils/nim-sdk'

type ForwardMode = 'single' | 'serial' | 'merged'

type ForwardTarget = {
  conversationId: string
  targetId: string
  title: string
  subtitle: string
  avatar?: string
  conversationType: V2NIMConversationType
  memberCount?: number
  valid: boolean
}

type ForwardAIUser = {
  accountId: string
}

type ForwardConversationSource = {
  conversationId: string
  name?: string
  avatar?: string
  sortOrder?: number
  stickTop?: boolean
  lastMessage?: { messageRefer?: { createTime?: number } }
}

type ForwardTargetTab = 'recentChats' | 'friends' | 'groups'

const FORWARD_PAGE_HORIZONTAL_PADDING = 16
const RECENT_FORWARD_COLUMNS = 5
const RECENT_FORWARD_GAP = 8
const RECENT_FORWARD_AVATAR_SIZE = 44
const CONFIRM_TARGET_AVATAR_LIMIT = 6
const CONFIRM_MULTI_TARGET_AVATAR_SIZE = 40
const FORWARD_PREVIEW_TITLE_TOKEN = '{title}'
const FORWARD_TARGET_ROW_HEIGHT = 56
const FORWARD_TARGET_INITIAL_RENDER_COUNT = 14
const FORWARD_TARGET_BATCH_RENDER_COUNT = 16
const FORWARD_TARGET_WINDOW_SIZE = 10

function hasRealConversationContent(conversation: { lastMessage?: unknown }) {
  return !!conversation.lastMessage
}

function hasRetainedP2PConversation(conversation?: { lastMessage?: unknown } | null) {
  return !!conversation && hasRealConversationContent(conversation)
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
      return 'forwardModeSerial'
    case 'merged':
      return 'forwardModeMerged'
    default:
      return 'forwardModeSingle'
  }
}

function getForwardTargetTitle(
  targetId: string,
  conversationType: V2NIMConversationType,
  fallbackName?: string
) {
  if (conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM) {
    return fallbackName || targetId
  }

  return getUIKitAppellation({ account: targetId }) || fallbackName || targetId
}

function getForwardTargetAvatar(
  targetId: string,
  conversationType: V2NIMConversationType,
  explicitAvatar?: string
) {
  if (conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM) {
    return explicitAvatar || ''
  }

  return getUIKitAvatarUri(targetId, explicitAvatar)
}

function getForwardTargetSubtitle(targetId: string, conversationType: V2NIMConversationType) {
  if (conversationType !== V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM) {
    return targetId
  }

  const memberCount = teamStore.getMembers(targetId).length
  return memberCount > 0 ? `__GROUP_COUNT__${memberCount}` : '__GROUP_FALLBACK__'
}

function sortForwardConversations<T extends ForwardConversationSource>(conversations: T[]) {
  return conversations.slice().sort((left, right) => {
    if (!!left.stickTop !== !!right.stickTop) {
      return left.stickTop ? -1 : 1
    }

    const leftTime = left.sortOrder || left.lastMessage?.messageRefer?.createTime || 0
    const rightTime = right.sortOrder || right.lastMessage?.messageRefer?.createTime || 0

    return rightTime - leftTime
  })
}

function getForwardPayloadSourceTitle(
  sourceConversationType?: V2NIMConversationType,
  sourceTargetId?: string,
  sourceConversationName?: string
) {
  if (!sourceTargetId) {
    return sourceConversationName || ''
  }

  if (sourceConversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM) {
    return teamStore.getTeam(sourceTargetId)?.name || sourceConversationName || sourceTargetId
  }

  const user = userStore.users.get(sourceTargetId)
  const selfProfile =
    userStore.selfProfile?.accountId === sourceTargetId ? userStore.selfProfile : null
  const friend = friendStore.friends.get(sourceTargetId)

  return user?.name || selfProfile?.name || friend?.userProfile?.name || sourceTargetId
}

function buildConfirmPreview(
  mode: ForwardMode,
  messages: V2NIMMessage[],
  sourceTitle?: string,
  sourceConversationType?: V2NIMConversationType,
  sourceTargetId?: string
) {
  if (messages.length === 0) {
    return '__FORWARD_EMPTY__'
  }

  const title =
    sourceTitle ||
    getMessageDisplayName(messages[0].senderId, sourceConversationType, sourceTargetId)

  return JSON.stringify({
    type: 'forward-preview',
    modeKey: getForwardModeLabel(mode),
    title
  })
}

function splitForwardPreviewTemplate(template: string, title: string) {
  const [prefix, suffix = ''] = template.split(FORWARD_PREVIEW_TITLE_TOKEN)

  return {
    prefix,
    title,
    suffix
  }
}

const ForwardMessageScreen = observer(() => {
  const { t } = useAppTranslation()
  const { width: windowWidth } = useWindowDimensions()
  const { conversationId, messageId, messageIds, mode, source, sourceTitle, sourcePayloadTitle } =
    useLocalSearchParams<{
      conversationId?: string
      messageId?: string
      messageIds?: string
      mode?: string
      source?: string
      sourceTitle?: string
      sourcePayloadTitle?: string
    }>()
  const [keyword, setKeyword] = useState('')
  const [confirmVisible, setConfirmVisible] = useState(false)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [pendingTargetId, setPendingTargetId] = useState<string | null>(null)
  const [recentForwardLoading, setRecentForwardLoading] = useState(false)
  const [recentForwardLoadFailed, setRecentForwardLoadFailed] = useState(false)
  const [recentForwardLoaded, setRecentForwardLoaded] = useState(false)
  const [activeTargetTab, setActiveTargetTab] = useState<ForwardTargetTab>('recentChats')
  const [keyboardBottomInset, setKeyboardBottomInset] = useState(0)
  const forwardConfirmLockRef = useRef(false)
  const [targetSnapshot, setTargetSnapshot] = useState<{
    recentForwardTargets: ForwardTarget[]
    friendTargets: ForwardTarget[]
    teamTargets: ForwardTarget[]
  } | null>(null)

  const sourceConversationId = typeof conversationId === 'string' ? conversationId : ''
  const isCollectionSource = source === 'collection'
  const sourceConversation =
    imStoreV2Bridge.getConversation(sourceConversationId) ||
    conversationStore.getConversation(sourceConversationId)
  const sourceConversationType =
    nimStore.nim?.V2NIMConversationIdUtil.parseConversationType(sourceConversationId)
  const sourceTargetId =
    nimStore.nim?.V2NIMConversationIdUtil.parseConversationTargetId(sourceConversationId)
  const forwardMode = (
    mode === 'serial' || mode === 'merged' || mode === 'single' ? mode : 'single'
  ) as ForwardMode
  const normalizedKeyword = keyword.trim().toLowerCase()
  const aiUsers = imStoreV2Bridge.aiUsers as ForwardAIUser[]
  const aiAccountIds = useMemo(() => new Set(aiUsers.map((item) => item.accountId)), [aiUsers])
  const recentForwardConversationIds = messageStore.recentForwardConversationIds
  const hasBoundImConversationStore = imStoreV2Bridge.hasBoundStore
  const preferCloudConversation = imStoreV2Bridge.preferCloudConversation
  const imDisplayConversations = imStoreV2Bridge.displayConversations as ForwardConversationSource[]
  const friendSections = friendStore.friendSections
  const forwardRecentConversationSources = useMemo(() => {
    if (!hasBoundImConversationStore) {
      return conversationStore.conversations as ForwardConversationSource[]
    }

    if (preferCloudConversation) {
      return sortForwardConversations(imDisplayConversations)
    }

    const merged = new Map<string, ForwardConversationSource>()

    imDisplayConversations.forEach((conversation) => {
      if (conversation.conversationId) {
        merged.set(conversation.conversationId, conversation)
      }
    })
    conversationStore.conversations.forEach((conversation) => {
      const conversationId = conversation.conversationId

      if (!conversationId || merged.has(conversationId)) {
        return
      }

      if (conversationStore.isConversationLocallyHidden(conversationId)) {
        return
      }

      const hasLocalPreview =
        !!conversation.lastMessage ||
        messageStore.getConversationMessages(conversationId).list.length > 0

      if (hasLocalPreview) {
        merged.set(conversationId, conversation as ForwardConversationSource)
      }
    })

    return sortForwardConversations(Array.from(merged.values()))
  }, [hasBoundImConversationStore, imDisplayConversations, preferCloudConversation])
  const forwardFriendSources = useMemo(() => {
    return friendSections.flatMap((section) => section.data)
  }, [friendSections])
  const recentForwardItemWidth = Math.floor(
    (windowWidth -
      FORWARD_PAGE_HORIZONTAL_PADDING * 2 -
      RECENT_FORWARD_GAP * (RECENT_FORWARD_COLUMNS - 1)) /
      RECENT_FORWARD_COLUMNS
  )
  const loadRecentForwardTargets = useCallback(async () => {
    setRecentForwardLoading(true)
    setRecentForwardLoadFailed(false)

    try {
      await messageStore.loadRecentForwardConversations()
    } catch (error) {
      setRecentForwardLoadFailed(true)
      toast.alert(
        t('commonLoadingFailed'),
        error instanceof Error ? error.message : t('forwardRecentLoadFailed')
      )
    } finally {
      setRecentForwardLoading(false)
      setRecentForwardLoaded(true)
    }
  }, [t])

  useEffect(() => {
    loadRecentForwardTargets().catch(() => undefined)
    forwardStore.reset()

    return () => {
      forwardStore.reset()
    }
  }, [loadRecentForwardTargets])

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'
    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      setKeyboardBottomInset(Math.max(0, event.endCoordinates.height - 24))
    })
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardBottomInset(0)
    })

    return () => {
      showSubscription.remove()
      hideSubscription.remove()
    }
  }, [])

  const rawMessageIds = useMemo(() => {
    if (typeof messageIds === 'string' && messageIds.trim()) {
      return messageIds.split(',').filter(Boolean)
    }

    if (typeof messageId === 'string' && messageId) {
      return [messageId]
    }

    return []
  }, [messageId, messageIds])

  const sourceMessages = useMemo(() => {
    const snapshotMessages = isCollectionSource
      ? forwardStore.getSourceMessages(sourceConversationId)
      : []
    const messageSources = snapshotMessages.length > 0 ? snapshotMessages : []

    if (messageSources.length > 0) {
      return rawMessageIds
        .map(
          (item) =>
            messageSources.find(
              (message) => message.messageClientId === item || message.messageServerId === item
            ) || null
        )
        .filter(Boolean)
        .sort((left, right) => left!.createTime - right!.createTime) as V2NIMMessage[]
    }

    return rawMessageIds
      .map((item) => messageStore.getMessageById(sourceConversationId, item))
      .filter(Boolean)
      .sort((left, right) => left!.createTime - right!.createTime) as V2NIMMessage[]
  }, [isCollectionSource, rawMessageIds, sourceConversationId])

  const forwardableMessages = useMemo(() => {
    if (forwardMode === 'merged') {
      return sourceMessages.filter(
        (message) =>
          (isCollectionSource || !messageStore.getRevokedText(message)) &&
          (isCollectionSource ||
            message.sendingState === V2NIMMessageSendingState.V2NIM_MESSAGE_SENDING_STATE_SUCCEEDED)
      )
    }

    if (isCollectionSource) {
      return sourceMessages.filter(
        (message) => !!messageStore.createCollectionForwardSourceMessage(message)
      )
    }

    return sourceMessages.filter((message) =>
      isForwardableMessage(
        message,
        isCollectionSource ? null : messageStore.getRevokedText(message)
      )
    )
  }, [forwardMode, isCollectionSource, sourceMessages])

  const recentForwardTargets = useMemo(
    () =>
      !nimStore.nim
        ? []
        : recentForwardConversationIds.flatMap((conversationId) => {
            const targetId =
              nimStore.nim!.V2NIMConversationIdUtil.parseConversationTargetId(conversationId)
            const conversationType =
              nimStore.nim!.V2NIMConversationIdUtil.parseConversationType(conversationId)
            const conversation =
              imStoreV2Bridge.getConversation(conversationId) ||
              conversationStore.getConversation(conversationId)
            const team = teamStore.getTeam(targetId)
            const friend = friendStore.friends.get(targetId)
            const valid =
              conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM
                ? !!team || !!conversation
                : true

            if (!valid) {
              return []
            }

            return [
              {
                conversationId,
                targetId,
                title: getForwardTargetTitle(
                  targetId,
                  conversationType,
                  conversation?.name || team?.name || friend?.userProfile?.name
                ),
                subtitle: getForwardTargetSubtitle(targetId, conversationType),
                avatar: getForwardTargetAvatar(
                  targetId,
                  conversationType,
                  conversation?.avatar || team?.avatar || friend?.userProfile?.avatar
                ),
                conversationType,
                memberCount:
                  conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM
                    ? team?.memberCount || teamStore.getMembers(targetId).length || 0
                    : undefined,
                valid
              } as ForwardTarget
            ]
          }),
    [recentForwardConversationIds]
  )

  const recentConversationTargets = useMemo(
    () =>
      !nimStore.nim
        ? []
        : forwardRecentConversationSources.flatMap((conversation) => {
            const targetId = nimStore.nim!.V2NIMConversationIdUtil.parseConversationTargetId(
              conversation.conversationId
            )
            const conversationType = nimStore.nim!.V2NIMConversationIdUtil.parseConversationType(
              conversation.conversationId
            )
            const team = teamStore.getTeam(targetId)
            const friend = friendStore.friends.get(targetId)
            const valid =
              conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM
                ? !!team
                : !!friend ||
                  hasRetainedP2PConversation(conversation) ||
                  targetId === nimStore.getLoginUser()

            if (
              conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P &&
              aiAccountIds.has(targetId) &&
              !hasRealConversationContent(conversation)
            ) {
              return []
            }

            if (!valid) {
              return []
            }

            return [
              {
                conversationId: conversation.conversationId,
                targetId,
                title: getForwardTargetTitle(
                  targetId,
                  conversationType,
                  conversation.name || team?.name || friend?.userProfile?.name
                ),
                subtitle: getForwardTargetSubtitle(targetId, conversationType),
                avatar: getForwardTargetAvatar(
                  targetId,
                  conversationType,
                  conversation.avatar || team?.avatar || friend?.userProfile?.avatar
                ),
                conversationType,
                memberCount:
                  conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM
                    ? team?.memberCount || teamStore.getMembers(targetId).length || 0
                    : undefined,
                valid
              } as ForwardTarget
            ]
          }),
    [aiAccountIds, forwardRecentConversationSources]
  )

  const friendTargets = useMemo(
    () =>
      !nimStore.nim
        ? []
        : forwardFriendSources
            .filter((friend) => !aiAccountIds.has(friend.accountId))
            .map((friend) => {
              const conversationType = V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P

              return {
                conversationId: nimStore.nim!.V2NIMConversationIdUtil.p2pConversationId(
                  friend.accountId
                ),
                targetId: friend.accountId,
                title: friend.appellation,
                subtitle: friend.accountId,
                avatar: getForwardTargetAvatar(friend.accountId, conversationType, friend.avatar),
                conversationType,
                valid: true
              } as ForwardTarget
            }),
    [aiAccountIds, forwardFriendSources]
  )

  const teamTargets = useMemo(
    () =>
      !nimStore.nim
        ? []
        : teamStore.teamList.map((team) => ({
            conversationId: nimStore.nim!.V2NIMConversationIdUtil.teamConversationId(team.teamId),
            targetId: team.teamId,
            title: team.name || team.teamId,
            subtitle: getForwardTargetSubtitle(
              team.teamId,
              V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM
            ),
            avatar: team.avatar,
            conversationType: V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM,
            memberCount: team.memberCount || teamStore.getMembers(team.teamId).length || 0,
            valid: true
          })),
    []
  )

  useEffect(() => {
    if (!nimStore.nim || !recentForwardLoaded || targetSnapshot) {
      return
    }

    setTargetSnapshot({
      recentForwardTargets,
      friendTargets,
      teamTargets
    })
  }, [friendTargets, recentForwardLoaded, recentForwardTargets, targetSnapshot, teamTargets])

  const stableRecentForwardTargets = targetSnapshot?.recentForwardTargets || recentForwardTargets
  const stableRecentConversationTargets = recentConversationTargets
  const stableFriendTargets = targetSnapshot?.friendTargets || friendTargets
  const stableTeamTargets = targetSnapshot?.teamTargets || teamTargets
  const selectedConversationIds = forwardStore.selectedConversationIds
  const isMultiTargetMode = forwardStore.multiTargetMode

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

  const displayedRecentForwardTargets = filterTargets(stableRecentForwardTargets)
  const displayedRecentConversationTargets = filterTargets(stableRecentConversationTargets)
  const displayedFriendTargets = filterTargets(stableFriendTargets)
  const displayedTeamTargets = filterTargets(stableTeamTargets)
  const shouldShowRecentForwardSection =
    !normalizedKeyword &&
    (recentForwardLoading || recentForwardLoadFailed || displayedRecentForwardTargets.length > 0)

  const targetMap = useMemo(() => {
    const nextTargetMap = new Map<string, ForwardTarget>()

    ;[
      ...stableRecentForwardTargets,
      ...stableRecentConversationTargets,
      ...stableFriendTargets,
      ...stableTeamTargets
    ].forEach((item) => {
      nextTargetMap.set(item.conversationId, item)
    })

    return nextTargetMap
  }, [
    stableFriendTargets,
    stableRecentConversationTargets,
    stableRecentForwardTargets,
    stableTeamTargets
  ])
  const selectedConversationIdSet = useMemo(
    () => new Set(selectedConversationIds),
    [selectedConversationIds]
  )
  const selectedTargets = useMemo(
    () =>
      selectedConversationIds.map((item) => targetMap.get(item)).filter(Boolean) as ForwardTarget[],
    [selectedConversationIds, targetMap]
  )
  const confirmTargets = useMemo(
    () =>
      pendingTargetId
        ? ([targetMap.get(pendingTargetId)].filter(Boolean) as ForwardTarget[])
        : selectedTargets,
    [pendingTargetId, selectedTargets, targetMap]
  )
  const visibleConfirmTargets = confirmTargets.slice(0, CONFIRM_TARGET_AVATAR_LIMIT)

  const handleTargetPress = useCallback(
    (target: ForwardTarget) => {
      if (!target.valid) {
        toast.alert(t('forwardUnavailableTitle'), t('forwardUnavailableMessage'))
        return
      }

      if (!isMultiTargetMode) {
        setPendingTargetId(target.conversationId)
        setConfirmVisible(true)
        return
      }

      if (
        !selectedConversationIdSet.has(target.conversationId) &&
        selectedConversationIds.length >= MAX_FORWARD_TARGETS
      ) {
        toast.alert(
          t('chatActionFailedTitle'),
          t('forwardMaxTargets', { count: MAX_FORWARD_TARGETS })
        )
        return
      }

      forwardStore.toggleConversation(target.conversationId)
    },
    [isMultiTargetMode, selectedConversationIdSet, selectedConversationIds.length, t]
  )

  const canLoadMoreRecentConversationTargets = hasBoundImConversationStore
    ? !imStoreV2Bridge.isLoadingMore && imStoreV2Bridge.hasMoreConversations
    : !conversationStore.isLoadingMore && conversationStore.hasMore

  const prefetchMoreRecentConversationTargets = useCallback(() => {
    if (!canLoadMoreRecentConversationTargets) {
      return
    }

    if (hasBoundImConversationStore) {
      imStoreV2Bridge.loadMoreConversations().catch(() => undefined)
      return
    }

    conversationStore.loadMoreConversations().catch(() => undefined)
  }, [canLoadMoreRecentConversationTargets, hasBoundImConversationStore])

  const openConfirmForSelectedTargets = () => {
    if (!isMultiTargetMode) {
      forwardStore.setMultiTargetMode(true)
      return
    }

    if (selectedTargets.length === 0) {
      toast.alert(t('chatActionFailedTitle'), t('forwardSelectAtLeastOne'))
      return
    }

    setPendingTargetId(null)
    setConfirmVisible(true)
  }

  const handleConfirmForward = async () => {
    if (sourceMessages.length === 0 || submitting || forwardConfirmLockRef.current) {
      return
    }

    if (confirmTargets.length === 0) {
      toast.alert(t('forwardFailedTitle'), t('forwardSelectValidTarget'))
      return
    }

    const validMessages = forwardableMessages

    if (validMessages.length === 0 && !comment.trim()) {
      toast.alert(t('forwardFailedTitle'), t('forwardUnsupportedFormat'))
      setConfirmVisible(false)
      return
    }

    if (forwardMode === 'merged') {
      const blockedMessages = validMessages.filter(
        (message) => getMergedForwardNestedLevel(message) > 2
      )

      if (blockedMessages.length > 0) {
        toast.alert(t('forwardFailedTitle'), t('forwardMergedLimitExceeded'))
        setConfirmVisible(false)
        return
      }
    }

    try {
      forwardConfirmLockRef.current = true
      setSubmitting(true)
      await ensureNetworkAvailable()

      const targetsToForward = confirmTargets.slice()
      const messagesToForward = validMessages.slice()
      const commentToForward = comment
      const resolvedSourceTitle =
        forwardMode === 'merged'
          ? typeof sourcePayloadTitle === 'string'
            ? sourcePayloadTitle
            : getForwardPayloadSourceTitle(
                sourceConversationType,
                sourceTargetId,
                sourceConversation?.name
              ) || t('chatMergedForwardFooter')
          : ''

      setConfirmVisible(false)
      setComment('')
      forwardStore.reset()
      forwardStore.clearSourceMessages()
      setPendingTargetId(null)

      if (forwardMode !== 'single' && sourceConversationId) {
        forwardStore.markExitBatchSelection(sourceConversationId)
      }

      if (
        sourceConversationId &&
        targetsToForward.some((target) => target.conversationId === sourceConversationId)
      ) {
        forwardStore.markLatestAlignment(sourceConversationId)
      }

      await Promise.all(
        targetsToForward.map((target) =>
          messageStore.rememberRecentForwardConversation(target.conversationId)
        )
      )

      router.back()
      ;(async () => {
        await Promise.all(
          targetsToForward.map(async (target) => {
            const existingConversation =
              imStoreV2Bridge.getConversation(target.conversationId) ||
              conversationStore.getConversation(target.conversationId)

            if (!existingConversation && !imStoreV2Bridge.preferCloudConversation) {
              await conversationStore.createConversation(target.conversationId)
            }

            if (messagesToForward.length === 0) {
              await messageStore.sendForwardComment(target.conversationId, commentToForward)
              return
            }

            if (forwardMode === 'serial') {
              await messageStore.forwardMessages(
                messagesToForward,
                target.conversationId,
                commentToForward
              )
              return
            }

            if (forwardMode === 'merged') {
              await messageStore.sendMergedForwardMessage(
                target.conversationId,
                messagesToForward,
                sourceConversationId,
                resolvedSourceTitle,
                commentToForward
              )
              return
            }

            if (isCollectionSource) {
              await messageStore.forwardCollectionMessage(
                messagesToForward[0],
                target.conversationId,
                commentToForward
              )
              return
            }

            await messageStore.forwardMessage(
              messagesToForward[0],
              target.conversationId,
              commentToForward
            )
          })
        )
      })().catch((error) => {
        if (error instanceof Error && error.message === NETWORK_UNAVAILABLE_MESSAGE) {
          toast.alert(t('forwardFailedTitle'), NETWORK_UNAVAILABLE_MESSAGE)
          return
        }

        if (forwardMode === 'merged') {
          toast.alert(t('forwardFailedTitle'))
        }
      })
    } catch (error) {
      setConfirmVisible(false)

      if (error instanceof Error && error.message === NETWORK_UNAVAILABLE_MESSAGE) {
        if (forwardMode !== 'single' && sourceConversationId) {
          forwardStore.markExitBatchSelection(sourceConversationId)
        }
        toast.alert(t('forwardFailedTitle'), NETWORK_UNAVAILABLE_MESSAGE)
        return
      }

      if (forwardMode !== 'single' && sourceConversationId) {
        forwardStore.markExitBatchSelection(sourceConversationId)
      }

      router.back()
    } finally {
      forwardConfirmLockRef.current = false
      setSubmitting(false)
    }
  }

  const cancelForward = () => {
    setConfirmVisible(false)
    setPendingTargetId(null)
  }

  const renderAvatar = (target: ForwardTarget, size = 52) => {
    const label =
      target.conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM
        ? target.title.slice(0, 1)
        : getUIKitUserAvatarLabel({ account: target.targetId })

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
          {label.toUpperCase()}
        </ThemedText>
      </View>
    )
  }

  const renderRecentForwardTarget = (target: ForwardTarget) => {
    const selected =
      target.conversationId === pendingTargetId ||
      selectedConversationIdSet.has(target.conversationId)

    return (
      <TouchableOpacity
        key={`recent-forward-${target.conversationId}`}
        style={[styles.recentItem, { width: recentForwardItemWidth }]}
        onPress={() => handleTargetPress(target)}
      >
        <View>{renderAvatar(target, RECENT_FORWARD_AVATAR_SIZE)}</View>
        <ThemedText numberOfLines={1} style={styles.recentLabel}>
          {target.title}
        </ThemedText>
        {isMultiTargetMode && (
          <View style={[styles.recentIndicator, selected && styles.recentIndicatorSelected]}>
            {selected ? <ThemedText style={styles.recentIndicatorText}>✓</ThemedText> : null}
          </View>
        )}
      </TouchableOpacity>
    )
  }

  const targetTabs = useMemo(
    () =>
      [
        {
          key: 'recentChats',
          label: t('forwardSectionRecentChats'),
          targets: displayedRecentConversationTargets,
          emptyTitle: t('forwardNoConversations'),
          emptyDescription: t('forwardNoConversationsDescription')
        },
        {
          key: 'friends',
          label: t('forwardSectionFriends'),
          targets: displayedFriendTargets,
          emptyTitle: t('commonNoFriends'),
          emptyDescription: t('forwardNoFriendsDescription')
        },
        {
          key: 'groups',
          label: t('forwardSectionGroups'),
          targets: displayedTeamTargets,
          emptyTitle: t('forwardNoGroups'),
          emptyDescription: t('forwardNoGroupsDescription')
        }
      ] as const,
    [displayedFriendTargets, displayedRecentConversationTargets, displayedTeamTargets, t]
  )
  const activeTargetTabConfig =
    targetTabs.find((tab) => tab.key === activeTargetTab) || targetTabs[0]
  const renderTargetTabEmpty = () =>
    normalizedKeyword ? (
      <View style={styles.searchEmpty}>
        <ThemedText style={styles.searchEmptyIcon}>⌕</ThemedText>
        <ThemedText style={styles.searchEmptyText}>
          {t('forwardSearchNoResultPrefix')}
          <UIKitChatHighlightText text={keyword.trim()} keyword={keyword.trim()} />
          {t('forwardSearchNoResultSuffix')}
        </ThemedText>
      </View>
    ) : (
      <View style={styles.emptyListWrap}>
        <UIKitChatEmptyState
          title={activeTargetTabConfig.emptyTitle}
          description={activeTargetTabConfig.emptyDescription}
        />
      </View>
    )
  const renderTargetListItem = useCallback(
    ({ item }: ListRenderItemInfo<ForwardTarget>) => {
      const selected =
        item.conversationId === pendingTargetId ||
        selectedConversationIdSet.has(item.conversationId)
      const isTeam = item.conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM

      return (
        <TouchableOpacity
          style={[styles.row, !item.valid && styles.rowDisabled]}
          onPress={() => handleTargetPress(item)}
        >
          {isMultiTargetMode && (
            <UIKitSelectionIndicator
              selected={selected}
              style={[styles.rowIndicator, selected && styles.rowIndicatorSelected]}
              textStyle={styles.rowIndicatorText}
            />
          )}
          {renderAvatar(item, 40)}
          <View style={styles.meta}>
            {isTeam ? (
              <View style={styles.titleRow}>
                <ThemedText numberOfLines={1} ellipsizeMode="tail" style={styles.title}>
                  {item.title}
                </ThemedText>
                <ThemedText style={styles.memberCountText}>({item.memberCount || 0})</ThemedText>
              </View>
            ) : (
              <ThemedText numberOfLines={1} ellipsizeMode="tail" style={styles.title}>
                {item.title}
              </ThemedText>
            )}
          </View>
        </TouchableOpacity>
      )
    },
    [handleTargetPress, isMultiTargetMode, pendingTargetId, selectedConversationIdSet]
  )
  const handleTargetListEndReached = useCallback(() => {
    if (normalizedKeyword || activeTargetTab !== 'recentChats') {
      return
    }

    prefetchMoreRecentConversationTargets()
  }, [activeTargetTab, normalizedKeyword, prefetchMoreRecentConversationTargets])
  const renderTargetTabPane = () => (
    <FlatList
      data={activeTargetTabConfig.targets}
      keyExtractor={(item) => item.conversationId}
      style={styles.targetTabPane}
      contentContainerStyle={styles.content}
      removeClippedSubviews
      initialNumToRender={FORWARD_TARGET_INITIAL_RENDER_COUNT}
      maxToRenderPerBatch={FORWARD_TARGET_BATCH_RENDER_COUNT}
      windowSize={FORWARD_TARGET_WINDOW_SIZE}
      updateCellsBatchingPeriod={8}
      getItemLayout={(_, index) => ({
        length: FORWARD_TARGET_ROW_HEIGHT,
        offset: FORWARD_TARGET_ROW_HEIGHT * index,
        index
      })}
      renderItem={renderTargetListItem}
      ListEmptyComponent={renderTargetTabEmpty}
      onEndReached={activeTargetTab === 'recentChats' ? handleTargetListEndReached : undefined}
      onEndReachedThreshold={0.4}
      extraData={{
        pendingTargetId,
        selectedConversationIdSet,
        multiTargetMode: isMultiTargetMode
      }}
    />
  )

  const renderTargetTabs = () => (
    <View style={styles.targetTabs}>
      {targetTabs.map((tab) => {
        const active = activeTargetTab === tab.key

        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.targetTab, active && styles.targetTabActive]}
            onPress={() => setActiveTargetTab(tab.key)}
          >
            <ThemedText style={[styles.targetTabText, active && styles.targetTabTextActive]}>
              {tab.label}
            </ThemedText>
            <View style={[styles.targetTabIndicator, active && styles.targetTabIndicatorActive]} />
          </TouchableOpacity>
        )
      })}
    </View>
  )

  const confirmPreview = buildConfirmPreview(
    forwardMode,
    sourceMessages,
    typeof sourceTitle === 'string' ? sourceTitle : sourceConversation?.name,
    sourceConversationType,
    sourceTargetId
  )
  const resolvedConfirmPreview = useMemo(() => {
    if (confirmPreview === '__FORWARD_EMPTY__') {
      return t('forwardNoMessages')
    }

    try {
      const previewPayload = JSON.parse(confirmPreview) as
        | { type?: string; modeKey?: string; title?: string }
        | undefined

      if (previewPayload?.type === 'forward-preview' && previewPayload.modeKey) {
        return t('forwardPreviewConversationRecord', {
          mode: t(previewPayload.modeKey as never),
          title: previewPayload.title || ''
        })
      }
    } catch {
      // Fall through to legacy parsing.
    }

    if (confirmPreview.startsWith('__FORWARD_PREVIEW__')) {
      const parts = confirmPreview.split('__')
      const modeKey = parts[2]
      const previewTitle = parts.slice(3).join('__')

      if (!modeKey) {
        return confirmPreview
      }

      return t('forwardPreviewConversationRecord', {
        mode: t(modeKey as never),
        title: previewTitle
      })
    }

    return confirmPreview
  }, [confirmPreview, t])
  const confirmPreviewParts = useMemo(() => {
    if (confirmPreview === '__FORWARD_EMPTY__') {
      return null
    }

    try {
      const previewPayload = JSON.parse(confirmPreview) as
        | { type?: string; modeKey?: string; title?: string }
        | undefined

      if (previewPayload?.type === 'forward-preview' && previewPayload.modeKey) {
        return splitForwardPreviewTemplate(
          t('forwardPreviewConversationRecord', {
            mode: t(previewPayload.modeKey as never),
            title: FORWARD_PREVIEW_TITLE_TOKEN
          }),
          previewPayload.title || ''
        )
      }
    } catch {
      // Fall through to legacy parsing.
    }

    if (confirmPreview.startsWith('__FORWARD_PREVIEW__')) {
      const parts = confirmPreview.split('__')
      const modeKey = parts[2]
      const previewTitle = parts.slice(3).join('__')

      if (modeKey) {
        return splitForwardPreviewTemplate(
          t('forwardPreviewConversationRecord', {
            mode: t(modeKey as never),
            title: FORWARD_PREVIEW_TITLE_TOKEN
          }),
          previewTitle
        )
      }
    }

    return null
  }, [confirmPreview, t])

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: () => <UIKitChatHeaderTitle title={t('forwardHeaderSelect')} />,
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#FFFFFF' },
          headerRight: () => (
            <TouchableOpacity style={styles.headerButton} onPress={openConfirmForSelectedTargets}>
              <ThemedText style={styles.headerButtonText}>
                {isMultiTargetMode ? t('actionConfirm') : t('forwardHeaderMultiSelect')}
              </ThemedText>
            </TouchableOpacity>
          )
        }}
      />

      <View style={styles.topArea}>
        <UIKitChatSearchBar
          value={keyword}
          onChangeText={setKeyword}
          placeholder={t('commonSearch')}
          returnKeyType="search"
        />

        {isMultiTargetMode && selectedTargets.length > 0 ? (
          <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.selectedStrip}
              contentContainerStyle={styles.selectedAvatarRow}
            >
              {selectedTargets.map((target) => (
                <TouchableOpacity
                  key={target.conversationId}
                  style={styles.selectedAvatarItem}
                  onPress={() => router.push('/chat/forward-selected' as never)}
                >
                  {renderAvatar(target, 34)}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.selectedTabsGap} />
          </>
        ) : (
          <View style={styles.selectedTabsGap} />
        )}

        {shouldShowRecentForwardSection ? (
          <View style={styles.recentForwardModule}>
            <ThemedText style={styles.sectionTitle}>{t('forwardSectionRecent')}</ThemedText>
            {recentForwardLoading ? (
              <View style={styles.recentLoadingWrap}>
                <ActivityIndicator color="#337EFF" />
              </View>
            ) : recentForwardLoadFailed ? (
              <UIKitChatEmptyState
                title={t('forwardRecentLoadFailedTitle')}
                actionLabel={t('commonRetry')}
                onActionPress={() => {
                  loadRecentForwardTargets().catch(() => undefined)
                }}
              />
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.recentRow}>
                  {displayedRecentForwardTargets.map(renderRecentForwardTarget)}
                </View>
              </ScrollView>
            )}
          </View>
        ) : null}

        {shouldShowRecentForwardSection ? <View style={styles.recentTabsGap} /> : null}

        {renderTargetTabs()}
      </View>

      <View style={styles.targetTabPaneContainer}>{renderTargetTabPane()}</View>

      <Modal
        transparent
        visible={confirmVisible}
        animationType="fade"
        onRequestClose={cancelForward}
      >
        <Pressable
          style={[
            styles.modalMask,
            keyboardBottomInset > 0 && { paddingBottom: keyboardBottomInset }
          ]}
          onPress={cancelForward}
        >
          <Pressable style={styles.modalCard} onPress={() => undefined}>
            <ThemedText style={styles.modalTitle}>{t('forwardSendToTitle')}</ThemedText>
            <View
              style={[
                styles.modalTargetPreview,
                confirmTargets.length === 1 && styles.modalTargetPreviewSingle
              ]}
            >
              {confirmTargets.length === 1
                ? confirmTargets.map((target) => (
                    <View key={target.conversationId} style={styles.modalSingleTargetRow}>
                      {renderAvatar(target, 50)}
                      <ThemedText
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={styles.modalSingleTargetName}
                      >
                        {target.title}
                      </ThemedText>
                    </View>
                  ))
                : visibleConfirmTargets.map((target) => (
                    <View key={target.conversationId} style={styles.modalAvatarOnlyWrap}>
                      {renderAvatar(target, CONFIRM_MULTI_TARGET_AVATAR_SIZE)}
                    </View>
                  ))}
            </View>
            <View style={styles.previewBox}>
              {confirmPreviewParts ? (
                <View style={styles.previewTextRow}>
                  {!!confirmPreviewParts.prefix && (
                    <ThemedText numberOfLines={1} style={styles.previewTextFixed}>
                      {confirmPreviewParts.prefix}
                    </ThemedText>
                  )}
                  <ThemedText
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={styles.previewTextTitle}
                  >
                    {confirmPreviewParts.title}
                  </ThemedText>
                  {!!confirmPreviewParts.suffix && (
                    <ThemedText numberOfLines={1} style={styles.previewTextFixed}>
                      {confirmPreviewParts.suffix}
                    </ThemedText>
                  )}
                </View>
              ) : (
                <ThemedText numberOfLines={1} ellipsizeMode="tail" style={styles.previewText}>
                  {resolvedConfirmPreview}
                </ThemedText>
              )}
            </View>
            <TextInput
              style={styles.commentInput}
              value={comment}
              onChangeText={(text) => setComment(text.replace(/[\r\n]+/g, ''))}
              placeholder={t('forwardCommentPlaceholder')}
              placeholderTextColor="#B4BCC7"
              multiline={false}
              returnKeyType="done"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={cancelForward}
                disabled={submitting}
              >
                <ThemedText style={styles.modalCancelText}>{t('actionCancel')}</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleConfirmForward}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#337EFF" />
                ) : (
                  <ThemedText style={styles.modalConfirmText}>{t('sendText' as never)}</ThemedText>
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
    backgroundColor: '#FFFFFF'
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
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    gap: 12
  },
  targetTabs: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: -16,
    backgroundColor: '#FFFFFF'
  },
  targetTab: {
    flex: 1,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6
  },
  targetTabActive: {
    backgroundColor: '#FFFFFF'
  },
  targetTabText: {
    color: '#667085',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    textAlign: 'center'
  },
  targetTabTextActive: {
    color: '#337EFF',
    fontWeight: '700'
  },
  targetTabIndicator: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 3,
    backgroundColor: 'transparent'
  },
  targetTabIndicatorActive: {
    backgroundColor: '#337EFF'
  },
  selectedStrip: {},
  selectedAvatarRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  selectedAvatarItem: {
    marginRight: 8
  },
  selectedTabsGap: {
    height: 8,
    marginHorizontal: -16,
    backgroundColor: '#F5F7FB'
  },
  recentForwardModule: {
    marginHorizontal: -8,
    paddingHorizontal: 8
  },
  targetTabPaneContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  targetTabPane: {
    flex: 1
  },
  content: {
    paddingHorizontal: FORWARD_PAGE_HORIZONTAL_PADDING,
    paddingTop: 12,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF'
  },
  sectionTitle: {
    marginBottom: 8,
    color: '#8E98A8',
    fontSize: 14,
    lineHeight: 20
  },
  loadingWrap: {
    paddingVertical: 32,
    alignItems: 'center'
  },
  recentLoadingWrap: {
    paddingVertical: 18,
    alignItems: 'center'
  },
  recentRow: {
    flexDirection: 'row',
    gap: RECENT_FORWARD_GAP,
    paddingVertical: 2
  },
  recentItem: {
    alignItems: 'center',
    gap: 6
  },
  recentLabel: {
    color: '#586171',
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center'
  },
  recentIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#C3CCD8',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  recentIndicatorSelected: {
    backgroundColor: '#337EFF',
    borderColor: '#337EFF'
  },
  recentIndicatorText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 16,
    fontWeight: '700',
    transform: [{ translateY: -1 }]
  },
  recentTabsGap: {
    height: 8,
    marginHorizontal: -16,
    backgroundColor: '#F5F7FB'
  },
  searchEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 64
  },
  emptyListWrap: {
    paddingVertical: 64
  },
  searchEmptyIcon: {
    color: '#C5CDD8',
    fontSize: 46,
    lineHeight: 54,
    marginBottom: 12
  },
  searchEmptyText: {
    color: '#667085',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8
  },
  rowDisabled: {
    opacity: 0.5
  },
  rowIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12
  },
  rowIndicatorSelected: {
    width: 24,
    height: 24,
    borderRadius: 12
  },
  rowIndicatorText: {
    transform: [{ translateY: -1 }]
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
    marginLeft: 12,
    minWidth: 0
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0
  },
  title: {
    flexShrink: 1,
    color: '#2F3642',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600'
  },
  memberCountText: {
    flexShrink: 0,
    color: '#2F3642',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600'
  },
  modalMask: {
    flex: 1,
    backgroundColor: 'rgba(10, 16, 24, 0.42)',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24
  },
  modalCard: {
    maxHeight: '100%',
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
  modalTargetPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14
  },
  modalTargetPreviewSingle: {
    flexWrap: 'nowrap'
  },
  modalSingleTargetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0
  },
  modalSingleTargetName: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
    color: '#2E3541',
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '500'
  },
  modalAvatarOnlyWrap: {
    width: CONFIRM_MULTI_TARGET_AVATAR_SIZE,
    height: CONFIRM_MULTI_TARGET_AVATAR_SIZE
  },
  previewBox: {
    marginHorizontal: 20,
    borderRadius: 14,
    backgroundColor: '#EEF2F7',
    paddingHorizontal: 16,
    paddingVertical: 18
  },
  previewTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0
  },
  previewText: {
    color: '#4B5567',
    fontSize: 15,
    lineHeight: 22
  },
  previewTextFixed: {
    flexShrink: 0,
    color: '#4B5567',
    fontSize: 15,
    lineHeight: 22
  },
  previewTextTitle: {
    flexShrink: 1,
    minWidth: 0,
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
