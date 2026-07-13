import { friendStore, imStoreV2Bridge, teamStore, userStore } from '@/stores'

export type TeamMentionNameSources = {
  accountId: string
  friendAlias?: string
  teamNick?: string
  localUserName?: string
  selfProfileName?: string
  imUserName?: string
  friendProfileName?: string
  messageNickname?: string
}

function normalizeName(value?: string | null) {
  return value?.trim() || ''
}

function getPersonalNickname(sources: TeamMentionNameSources) {
  return (
    normalizeName(sources.localUserName) ||
    normalizeName(sources.selfProfileName) ||
    normalizeName(sources.imUserName) ||
    normalizeName(sources.friendProfileName) ||
    normalizeName(sources.messageNickname)
  )
}

export function resolveTeamMentionPickerName(sources: TeamMentionNameSources) {
  return (
    normalizeName(sources.friendAlias) ||
    normalizeName(sources.teamNick) ||
    getPersonalNickname(sources) ||
    sources.accountId
  )
}

export function resolveTeamMentionTokenName(sources: TeamMentionNameSources) {
  return normalizeName(sources.teamNick) || getPersonalNickname(sources) || sources.accountId
}

export function getTeamMentionNameSources(
  accountId: string,
  teamId?: string,
  messageNickname = ''
): TeamMentionNameSources {
  const friend = friendStore.friends.get(accountId)
  const teamMember = teamId
    ? teamStore.getMembers(teamId).find((item) => item.accountId === accountId)
    : null
  const localUser = userStore.users.get(accountId)
  const selfProfile = userStore.selfProfile?.accountId === accountId ? userStore.selfProfile : null
  const imUser = imStoreV2Bridge.rootStore?.userStore.users.get(accountId)

  return {
    accountId,
    friendAlias: friend?.alias,
    teamNick: teamMember?.teamNick,
    localUserName: localUser?.name,
    selfProfileName: selfProfile?.name,
    imUserName: imUser?.name,
    friendProfileName: friend?.userProfile?.name,
    messageNickname
  }
}

export function getTeamMentionPickerName(accountId: string, teamId?: string, messageNickname = '') {
  if (!accountId) {
    return ''
  }

  return resolveTeamMentionPickerName(getTeamMentionNameSources(accountId, teamId, messageNickname))
}

export function getTeamMentionTokenName(accountId: string, teamId?: string, messageNickname = '') {
  if (!accountId) {
    return ''
  }

  return resolveTeamMentionTokenName(getTeamMentionNameSources(accountId, teamId, messageNickname))
}

export function getTeamMentionNameResolutionKey(accountIds: string[], teamId?: string) {
  return accountIds
    .map((accountId) => {
      const sources = getTeamMentionNameSources(accountId, teamId)

      return [
        sources.accountId,
        sources.friendAlias,
        sources.teamNick,
        sources.localUserName,
        sources.selfProfileName,
        sources.imUserName,
        sources.friendProfileName
      ]
        .map((item) => normalizeName(item))
        .join('\u0001')
    })
    .join('\u0002')
}
