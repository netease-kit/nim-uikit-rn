import { friendStore, imStoreV2Bridge, nimStore, teamStore, userStore } from '@/stores'
import { V2NIMConversationType } from '@/utils/nim-sdk'

const P2P_CONVERSATION_TYPE = V2NIMConversationType?.V2NIM_CONVERSATION_TYPE_P2P ?? 1
const TEAM_CONVERSATION_TYPE = V2NIMConversationType?.V2NIM_CONVERSATION_TYPE_TEAM ?? 2

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

type ConversationIdentityInput = {
  conversationId: string
  type?: V2NIMConversationType
  name?: string
  avatar?: string
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

  const imAppellation = imStoreV2Bridge.rootStore?.uiStore.getAppellation({
    account,
    teamId,
    ignoreAlias,
    nickFromMsg
  })

  if (imAppellation) {
    return imAppellation
  }

  const friend = friendStore.friends.get(account)
  const user = userStore.users.get(account)
  const selfProfile = userStore.selfProfile?.accountId === account ? userStore.selfProfile : null
  const teamMember = teamId
    ? teamStore.getMembers(teamId).find((item) => item.accountId === account)
    : null

  return (
    (!ignoreAlias && friend?.alias) ||
    teamMember?.teamNick ||
    user?.name ||
    selfProfile?.name ||
    friend?.userProfile?.name ||
    nickFromMsg ||
    account
  )
}

export function getUIKitAvatarUri(account: string, explicitAvatar?: string) {
  if (explicitAvatar) {
    return explicitAvatar
  }

  const imUser = imStoreV2Bridge.rootStore?.userStore.users.get(account)
  const user = userStore.users.get(account)
  const friend = friendStore.friends.get(account)
  const selfProfile = userStore.selfProfile?.accountId === account ? userStore.selfProfile : null

  return imUser?.avatar || user?.avatar || selfProfile?.avatar || friend?.userProfile?.avatar || ''
}

export function getUIKitAvatarLabel(options: AppellationOptions) {
  const name = getUIKitAppellation(options) || options.account
  return name.slice(0, 2)
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
    return {
      targetId,
      type,
      title: getUIKitAppellation({ account: targetId }) || targetId,
      avatarAccount: targetId,
      avatarUri: getUIKitAvatarUri(targetId)
    }
  }

  return {
    targetId,
    type,
    title: conversation.name || targetId || conversation.conversationId,
    avatarAccount: targetId || conversation.conversationId,
    avatarUri: isTeam ? conversation.avatar || teamStore.getTeam(targetId)?.avatar || '' : ''
  }
}
