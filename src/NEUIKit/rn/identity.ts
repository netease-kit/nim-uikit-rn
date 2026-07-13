import { friendStore, imStoreV2Bridge, nimStore, teamStore, userStore } from '@/stores'
import { V2NIMConversationType, V2NIMUser } from '@/utils/nim-sdk'

const P2P_CONVERSATION_TYPE = V2NIMConversationType?.V2NIM_CONVERSATION_TYPE_P2P ?? 1
const TEAM_CONVERSATION_TYPE = V2NIMConversationType?.V2NIM_CONVERSATION_TYPE_TEAM ?? 2
const pendingUserProfileAccountIds = new Set<string>()
const attemptedUserProfileAccountIds = new Set<string>()

const AVATAR_COLORS: Record<number, string> = {
  0: '#60CFA7',
  1: '#53C3F3',
  2: '#537FF4',
  3: '#854FE2',
  4: '#BE65D9',
  5: '#E9749D',
  6: '#F9B751'
}

type AppellationOptions = {
  account: string
  teamId?: string
  ignoreAlias?: boolean
  nickFromMsg?: string
}

type AvatarUriOptions = {
  teamId?: string
}

type UserAvatarLabelOptions = {
  account: string
  explicitLabel?: string
}

type ConversationIdentityInput = {
  conversationId: string
  type?: V2NIMConversationType
  name?: string
  avatar?: string
}

function getUIKitUserNickname(account: string) {
  const user = userStore.users.get(account)
  const selfProfile = userStore.selfProfile?.accountId === account ? userStore.selfProfile : null
  const friend = friendStore.friends.get(account)

  return user?.name || selfProfile?.name || friend?.userProfile?.name || ''
}

function hashString(input: string) {
  let hash = 0

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index)
    hash &= hash
  }

  return Math.abs(hash)
}

export function getUIKitAvatarColor(account: string) {
  return AVATAR_COLORS[(hashString(account) || 0) % 7]
}

export function getUIKitAppellation({
  account,
  teamId = '',
  ignoreAlias = false,
  nickFromMsg = ''
}: AppellationOptions) {
  if (!account) {
    return ''
  }

  const friend = friendStore.friends.get(account)
  const aiUser = imStoreV2Bridge.aiUsers.find((item) => item.accountId === account)
  const teamMember = teamId
    ? teamStore.getMembers(teamId).find((item) => item.accountId === account)
    : null
  const isFriend = !!friend

  if (!ignoreAlias && friend?.alias) {
    return friend.alias
  }

  if (teamMember?.teamNick) {
    return teamMember.teamNick
  }

  const imAppellation = imStoreV2Bridge.rootStore?.uiStore.getAppellation({
    account,
    teamId,
    ignoreAlias,
    nickFromMsg
  })

  if (imAppellation && (teamId || isFriend)) {
    return imAppellation
  }

  return getUIKitUserNickname(account) || aiUser?.name || nickFromMsg || account
}

export function getUIKitAvatarUri(
  account: string,
  explicitAvatar?: string,
  options: AvatarUriOptions = {}
) {
  if (explicitAvatar) {
    return explicitAvatar
  }

  const aiUser = imStoreV2Bridge.aiUsers.find((item) => item.accountId === account)
  const teamMember = options.teamId
    ? teamStore.getMembers(options.teamId).find((item) => item.accountId === account)
    : null
  const imUser = imStoreV2Bridge.rootStore?.userStore.users.get(account)
  const user = userStore.users.get(account)
  const friend = friendStore.friends.get(account)
  const selfProfile = userStore.selfProfile?.accountId === account ? userStore.selfProfile : null

  return (
    aiUser?.avatar ||
    (teamMember as { avatar?: string } | null)?.avatar ||
    imUser?.avatar ||
    user?.avatar ||
    selfProfile?.avatar ||
    friend?.userProfile?.avatar ||
    ''
  )
}

export function getUIKitAvatarLabel(options: AppellationOptions) {
  return getUIKitUserAvatarLabel({ account: options.account })
}

export function getUIKitUserAvatarLabel(options: UserAvatarLabelOptions) {
  const account = options.account

  if (!account) {
    return ''
  }

  const name = getUIKitUserNickname(account) || account

  return name.slice(-2)
}

export function parseUIKitConversationIdentity(conversationId: string) {
  const util = nimStore.nim?.V2NIMConversationIdUtil

  if (util) {
    return {
      targetId: util.parseConversationTargetId(conversationId),
      type: util.parseConversationType(conversationId)
    }
  }

  const parts = conversationId.split('|')
  const typeToken = parts[0]?.toLowerCase()

  return {
    targetId: parts[1] || conversationId,
    type: typeToken === 'team' ? TEAM_CONVERSATION_TYPE : P2P_CONVERSATION_TYPE
  }
}

export function getUIKitConversationIdentity(conversation: ConversationIdentityInput) {
  const parsed = parseUIKitConversationIdentity(conversation.conversationId)
  const type = conversation.type || parsed.type
  const targetId = parsed.targetId
  const isP2P = type === P2P_CONVERSATION_TYPE
  const isTeam = type === TEAM_CONVERSATION_TYPE

  if (isP2P) {
    const aiUser = imStoreV2Bridge.aiUsers.find((item) => item.accountId === targetId)

    return {
      targetId,
      type,
      title: aiUser?.name || getUIKitAppellation({ account: targetId }) || targetId,
      avatarAccount: targetId,
      avatarUri: getUIKitAvatarUri(targetId, aiUser?.avatar)
    }
  }

  const team = isTeam ? teamStore.getTeam(targetId) : null

  return {
    targetId,
    type,
    title: team?.name || conversation.name || targetId || conversation.conversationId,
    avatarAccount: targetId || conversation.conversationId,
    avatarUri: isTeam ? team?.avatar || conversation.avatar || '' : ''
  }
}

export async function ensureUIKitUserProfiles(accountIds: string[]) {
  const normalizedAccountIds = Array.from(
    new Set(accountIds.map((item) => item.trim()).filter(Boolean))
  ).filter((accountId) => {
    const localUser = userStore.users.get(accountId)
    const imUser = imStoreV2Bridge.rootStore?.userStore.users.get(accountId)
    const hasLocalUser =
      !!localUser?.avatar ||
      !!localUser?.name ||
      !!imUser?.avatar ||
      !!imUser?.name ||
      friendStore.friends.has(accountId) ||
      imStoreV2Bridge.aiUsers.some((item) => item.accountId === accountId)

    return (
      !hasLocalUser &&
      !pendingUserProfileAccountIds.has(accountId) &&
      !attemptedUserProfileAccountIds.has(accountId)
    )
  })

  if (normalizedAccountIds.length === 0) {
    return []
  }

  normalizedAccountIds.forEach((accountId) => {
    pendingUserProfileAccountIds.add(accountId)
  })

  try {
    const imUserStore = imStoreV2Bridge.rootStore?.userStore
    const imUsers = imUserStore
      ? await Promise.all(
          normalizedAccountIds.map((accountId) =>
            imUserStore.getUserActive(accountId).catch(() => null)
          )
        )
      : []
    const cloudUsers = await userStore.fetchUsers(normalizedAccountIds).catch(() => [])
    const mergedUsers = [...imUsers, ...cloudUsers].filter(
      (user): user is V2NIMUser => !!user?.accountId
    )

    if (mergedUsers.length > 0) {
      userStore.applyUsers(mergedUsers)
    }

    return mergedUsers
  } finally {
    normalizedAccountIds.forEach((accountId) => {
      pendingUserProfileAccountIds.delete(accountId)
      attemptedUserProfileAccountIds.add(accountId)
    })
  }
}

export function isUIKitAIUser(accountId?: string | null) {
  if (!accountId) {
    return false
  }

  return imStoreV2Bridge.aiUsers.some((item) => item.accountId === accountId)
}

export async function resolveUIKitProfileRoute(accountId?: string | null) {
  if (!accountId) {
    return '/friend/friend-card' as const
  }

  if (nimStore.getLoginUser() === accountId) {
    return '/user/my-detail' as const
  }

  await friendStore.ensureFriendRelationFresh(accountId).catch(() => undefined)

  if (!isUIKitAIUser(accountId)) {
    try {
      await imStoreV2Bridge.ensureAIUsersLoaded()
    } catch {
      // Ignore AI user preload failures and fall back to friend-card routing.
    }
  }

  return isUIKitAIUser(accountId) ? ('/friend/ai-card' as const) : ('/friend/friend-card' as const)
}
