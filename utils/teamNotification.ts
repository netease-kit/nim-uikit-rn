import { getUIKitAppellation } from '@/src/NEUIKit/rn/identity'
import { friendStore, imStoreV2Bridge, userStore } from '@/stores'
import { translateCurrentApp } from '@/utils/app-language'
import { V2NIMConst, V2NIMMessage, V2NIMTeam } from '@/utils/nim-sdk'

type NotificationAttachment = {
  type?: number
  targetIds?: string[]
  updatedTeamInfo?: Partial<V2NIMTeam>
}

type TeamServerExtension = {
  teamInviteMode?: string
  teamUpdateInfoMode?: string
  yxAllowAt?: string
}

function getPersonalAppellation(accountId: string) {
  if (!accountId) {
    return ''
  }

  const friend = friendStore.friends.get(accountId)
  const user = userStore.users.get(accountId)
  const selfProfile = userStore.selfProfile?.accountId === accountId ? userStore.selfProfile : null
  const imUser = imStoreV2Bridge.rootStore?.userStore.users.get(accountId)
  const aiUser = imStoreV2Bridge.aiUsers.find((item) => item.accountId === accountId)

  return (
    friend?.alias?.trim() ||
    user?.name?.trim() ||
    selfProfile?.name?.trim() ||
    imUser?.name?.trim() ||
    friend?.userProfile?.name?.trim() ||
    aiUser?.name?.trim() ||
    accountId
  )
}

function getAppellation(accountId: string, teamId: string, options?: { ignoreTeamNick?: boolean }) {
  if (options?.ignoreTeamNick) {
    return getPersonalAppellation(accountId)
  }

  return getUIKitAppellation({ account: accountId, teamId }) || accountId
}

function getNotificationAccounts(attachment: NotificationAttachment) {
  return attachment.targetIds || []
}

export function getTeamNotificationAccountIds(
  message?: Pick<V2NIMMessage, 'senderId' | 'receiverId' | 'attachment'> | null
) {
  if (!message?.attachment) {
    return []
  }

  const attachment = message.attachment as NotificationAttachment
  return Array.from(
    new Set([message.senderId, ...getNotificationAccounts(attachment)].filter(Boolean))
  )
}

function parseTeamServerExtension(serverExtension?: string) {
  if (!serverExtension) {
    return {}
  }

  try {
    return JSON.parse(serverExtension) as TeamServerExtension
  } catch {
    return {}
  }
}

function getInviteModeText(inviteMode?: number) {
  return inviteMode === V2NIMConst.V2NIMTeamInviteMode?.V2NIM_TEAM_INVITE_MODE_ALL
    ? translateCurrentApp('teamNotificationValueAll')
    : translateCurrentApp('teamNotificationValueOwnerAndManager')
}

function getUpdateInfoModeText(updateInfoMode?: number) {
  return updateInfoMode === V2NIMConst.V2NIMTeamUpdateInfoMode?.V2NIM_TEAM_UPDATE_INFO_MODE_ALL
    ? translateCurrentApp('teamNotificationValueAll')
    : translateCurrentApp('teamNotificationValueOwnerAndManager')
}

function getChatBannedModeText(chatBannedMode?: number) {
  return chatBannedMode === V2NIMConst.V2NIMTeamChatBannedMode?.V2NIM_TEAM_CHAT_BANNED_MODE_UNBAN
    ? translateCurrentApp('teamNotificationValueClose')
    : translateCurrentApp('teamNotificationValueOpen')
}

export function getTeamNotificationText(
  message?: Pick<V2NIMMessage, 'senderId' | 'receiverId' | 'attachment'> | null
) {
  if (!message?.attachment || !message.receiverId) {
    return ''
  }

  const attachment = message.attachment as NotificationAttachment
  const teamId = message.receiverId
  const type = attachment.type

  switch (type) {
    case V2NIMConst.V2NIMMessageNotificationType?.V2NIM_MESSAGE_NOTIFICATION_TYPE_TEAM_APPLY_PASS:
    case V2NIMConst.V2NIMMessageNotificationType
      ?.V2NIM_MESSAGE_NOTIFICATION_TYPE_TEAM_INVITE_ACCEPT:
      return translateCurrentApp('teamNotificationJoinedGroup', {
        name: getAppellation(message.senderId, teamId, { ignoreTeamNick: true })
      })
    case V2NIMConst.V2NIMMessageNotificationType?.V2NIM_MESSAGE_NOTIFICATION_TYPE_TEAM_INVITE: {
      const inviter = getAppellation(message.senderId, teamId, { ignoreTeamNick: true })
      const nicks = getNotificationAccounts(attachment)
        .map((item) => getAppellation(item, teamId, { ignoreTeamNick: true }))
        .filter(Boolean)
        .join('、')

      return nicks
        ? translateCurrentApp('teamNotificationInviteMembers', {
            inviter,
            members: nicks
          })
        : translateCurrentApp('teamNotificationInviteNewMembers', {
            inviter
          })
    }
    case V2NIMConst.V2NIMMessageNotificationType?.V2NIM_MESSAGE_NOTIFICATION_TYPE_TEAM_KICK: {
      const nicks = getNotificationAccounts(attachment)
        .map((item) => getAppellation(item, teamId, { ignoreTeamNick: true }))
        .filter(Boolean)
        .join('、')

      return nicks
        ? translateCurrentApp('teamNotificationMembersRemoved', {
            members: nicks
          })
        : translateCurrentApp('teamNotificationMemberRemoved')
    }
    case V2NIMConst.V2NIMMessageNotificationType?.V2NIM_MESSAGE_NOTIFICATION_TYPE_TEAM_LEAVE:
      return translateCurrentApp('teamNotificationLeftGroup', {
        name: getAppellation(message.senderId, teamId, { ignoreTeamNick: true })
      })
    case V2NIMConst.V2NIMMessageNotificationType
      ?.V2NIM_MESSAGE_NOTIFICATION_TYPE_TEAM_OWNER_TRANSFER: {
      const newOwner = getNotificationAccounts(attachment)[0]
      return newOwner
        ? translateCurrentApp('teamNotificationOwnerTransferred', {
            name: getAppellation(newOwner, teamId)
          })
        : translateCurrentApp('teamNotificationOwnerTransferredFallback')
    }
    case V2NIMConst.V2NIMMessageNotificationType
      ?.V2NIM_MESSAGE_NOTIFICATION_TYPE_TEAM_UPDATE_TINFO: {
      const team = (attachment.updatedTeamInfo || {}) as Partial<V2NIMTeam>
      const content: string[] = []

      if (team.avatar !== undefined) {
        content.push(
          translateCurrentApp('teamNotificationUpdatedAvatar', {
            name: getAppellation(message.senderId, teamId)
          })
        )
      }

      if (team.name !== undefined) {
        content.push(
          translateCurrentApp('teamNotificationRenamedGroup', {
            name: getAppellation(message.senderId, teamId),
            groupName: team.name || ''
          })
        )
      }

      if (team.intro !== undefined) {
        content.push(
          translateCurrentApp('teamNotificationUpdatedIntro', {
            name: getAppellation(message.senderId, teamId)
          })
        )
      }

      if (team.inviteMode !== undefined) {
        content.push(
          `${getAppellation(message.senderId, teamId)} ${translateCurrentApp(
            'teamNotificationUpdatedInviteMode',
            {
              value: getInviteModeText(team.inviteMode)
            }
          )}`
        )
      }

      if (team.updateInfoMode !== undefined) {
        content.push(
          `${getAppellation(message.senderId, teamId)} ${translateCurrentApp(
            'teamNotificationUpdatedInfoMode',
            {
              value: getUpdateInfoModeText(team.updateInfoMode)
            }
          )}`
        )
      }

      if (team.chatBannedMode !== undefined) {
        content.push(
          `${getAppellation(message.senderId, teamId)} ${translateCurrentApp(
            'teamNotificationUpdatedChatBanned',
            {
              value: getChatBannedModeText(team.chatBannedMode)
            }
          )}`
        )
      }

      const ext = parseTeamServerExtension(team.serverExtension)

      if (ext.teamInviteMode === 'manager' || ext.teamInviteMode === 'all') {
        content.push(
          `${getAppellation(message.senderId, teamId)} ${translateCurrentApp(
            'teamNotificationUpdatedInviteMode',
            {
              value:
                ext.teamInviteMode === 'all'
                  ? translateCurrentApp('teamNotificationValueAll')
                  : translateCurrentApp('teamNotificationValueOwnerAndManager')
            }
          )}`
        )
      }

      if (ext.teamUpdateInfoMode === 'manager' || ext.teamUpdateInfoMode === 'all') {
        content.push(
          `${getAppellation(message.senderId, teamId)} ${translateCurrentApp(
            'teamNotificationUpdatedInfoMode',
            {
              value:
                ext.teamUpdateInfoMode === 'all'
                  ? translateCurrentApp('teamNotificationValueAll')
                  : translateCurrentApp('teamNotificationValueOwnerAndManager')
            }
          )}`
        )
      }

      if (ext.yxAllowAt === 'manager' || ext.yxAllowAt === 'all') {
        content.push(
          translateCurrentApp('teamNotificationUpdatedAllowAt', {
            value:
              ext.yxAllowAt === 'all'
                ? translateCurrentApp('teamNotificationValueAll')
                : translateCurrentApp('teamNotificationValueOwnerAndManager')
          })
        )
      }

      return content.join('、') || translateCurrentApp('teamNotificationUpdatedInfo')
    }
    default:
      return ''
  }
}
