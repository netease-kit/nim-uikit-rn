import { makeAutoObservable, observable, runInAction } from 'mobx'

import {
  V2NIMCreateTeamResult,
  V2NIMTeam,
  V2NIMTeamAgreeMode,
  V2NIMTeamChatBannedMode,
  V2NIMTeamInviteMode,
  V2NIMTeamJoinMode,
  V2NIMTeamMember,
  V2NIMTeamMemberRole,
  V2NIMTeamType,
  V2NIMTeamUpdateExtensionMode,
  V2NIMTeamUpdateInfoMode,
  V2NIMUpdateTeamInfoParams
} from '@/utils/nim-sdk'

import { nimStore } from './NIMStore'

export const DEFAULT_TEAM_AVATARS = [
  'https://yx-web-nosdn.netease.im/common/2425b4cc058e5788867d63c322feb7ac/groupAvatar1.png',
  'https://yx-web-nosdn.netease.im/common/62c45692c9771ab388d43fea1c9d2758/groupAvatar2.png',
  'https://yx-web-nosdn.netease.im/common/d1ed3c21d3f87a41568d17197760e663/groupAvatar3.png',
  'https://yx-web-nosdn.netease.im/common/e677d8551deb96723af2b40b821c766a/groupAvatar4.png',
  'https://yx-web-nosdn.netease.im/common/fd6c75bb6abca9c810d1292e66d5d87e/groupAvatar5.png'
]
const TEAM_MEMBER_FULL_LOAD_LIMIT = 2000
const TEAM_MEMBER_PRELOAD_LIMIT = 150
const TEAM_CATEGORY_EXTENSION_KEY = 'im2TeamCategory'
const NATIVE_DISCUSSION_EXTENSION_KEY = 'im_ui_kit_group'
const NATIVE_COMPATIBLE_TEAM_TYPE =
  (V2NIMTeamType as { V2NIM_TEAM_TYPE_ADVANCED?: number } | undefined)?.V2NIM_TEAM_TYPE_ADVANCED ??
  1
const RECENT_JOIN_GRACE_MS = 10 * 1000

export const TEAM_CATEGORY = {
  GROUP: 'group',
  DISCUSSION: 'discussion'
} as const

export type TeamCategory = (typeof TEAM_CATEGORY)[keyof typeof TEAM_CATEGORY]

type ImStoreV2BridgeLike = {
  aiUsers: Array<{ accountId: string }>
}

function getImStoreV2Bridge(): ImStoreV2BridgeLike {
  return require('./ImStoreV2Bridge').imStoreV2Bridge as ImStoreV2BridgeLike
}

function createTeamServerExtension(category?: TeamCategory) {
  if (!category) {
    return undefined
  }

  if (category === TEAM_CATEGORY.DISCUSSION) {
    return JSON.stringify({ [NATIVE_DISCUSSION_EXTENSION_KEY]: true })
  }

  return undefined
}

export function getTeamCategory(team?: V2NIMTeam | null): TeamCategory {
  if (!team?.serverExtension) {
    return TEAM_CATEGORY.GROUP
  }

  try {
    const extension = JSON.parse(team.serverExtension) as Record<string, unknown>

    return extension[NATIVE_DISCUSSION_EXTENSION_KEY] === true ||
      extension[TEAM_CATEGORY_EXTENSION_KEY] === TEAM_CATEGORY.DISCUSSION
      ? TEAM_CATEGORY.DISCUSSION
      : TEAM_CATEGORY.GROUP
  } catch {
    return team.serverExtension.includes(NATIVE_DISCUSSION_EXTENSION_KEY)
      ? TEAM_CATEGORY.DISCUSSION
      : TEAM_CATEGORY.GROUP
  }
}

class TeamStore {
  teams = observable.map<string, V2NIMTeam>()
  membersByTeam = observable.map<string, V2NIMTeamMember[]>(undefined, { deep: false })
  loadedMemberTeamIds = observable.set<string>()
  hasLoadedJoinedTeams = false
  private recentJoinedTeamExpiresAt = new Map<string, number>()
  private memberLoadPromises = new Map<string, Promise<V2NIMTeamMember[]>>()
  private memberPreloadPromises = new Map<string, Promise<V2NIMTeamMember[]>>()
  private memberByIdsLoadPromises = new Map<string, Promise<V2NIMTeamMember[]>>()
  private preloadedMemberTeamIds = new Set<string>()

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true })
  }

  resetState() {
    this.teams.clear()
    this.membersByTeam.clear()
    this.loadedMemberTeamIds.clear()
    this.hasLoadedJoinedTeams = false
    this.recentJoinedTeamExpiresAt.clear()
    this.memberLoadPromises.clear()
    this.memberPreloadPromises.clear()
    this.memberByIdsLoadPromises.clear()
    this.preloadedMemberTeamIds.clear()
  }

  get teamList() {
    return Array.from(this.teams.values()).sort((a, b) => {
      const leftTime = a.createTime || 0
      const rightTime = b.createTime || 0

      if (leftTime !== rightTime) {
        return rightTime - leftTime
      }

      const leftName = a.name || a.teamId
      const rightName = b.name || b.teamId
      return leftName.localeCompare(rightName, 'zh-Hans-CN')
    })
  }

  getTeam(teamId: string) {
    return this.teams.get(teamId) || null
  }

  getMembers(teamId: string) {
    return this.membersByTeam.get(teamId) || []
  }

  hasLoadedMembers(teamId: string) {
    return this.loadedMemberTeamIds.has(teamId)
  }

  markRecentlyJoinedTeam(teamId: string) {
    if (!teamId) {
      return
    }

    this.recentJoinedTeamExpiresAt.set(teamId, Date.now() + RECENT_JOIN_GRACE_MS)
  }

  isRecentlyJoinedTeam(teamId?: string | null) {
    if (!teamId) {
      return false
    }

    const expiresAt = this.recentJoinedTeamExpiresAt.get(teamId)

    if (!expiresAt) {
      return false
    }

    if (expiresAt <= Date.now()) {
      this.recentJoinedTeamExpiresAt.delete(teamId)
      return false
    }

    return true
  }

  getTeamType(teamId: string) {
    return this.getTeam(teamId)?.teamType || NATIVE_COMPATIBLE_TEAM_TYPE
  }

  private getNativeCompatibleTeamType(teamId: string) {
    const teamType = this.getTeamType(teamId)

    return teamType === V2NIMTeamType.V2NIM_TEAM_TYPE_INVALID
      ? NATIVE_COMPATIBLE_TEAM_TYPE
      : teamType
  }

  applyTeamMembers(teamMembers: V2NIMTeamMember[]) {
    if (teamMembers.length === 0) {
      return
    }

    runInAction(() => {
      const membersByTeamId = new Map<string, V2NIMTeamMember[]>()

      teamMembers.forEach((member) => {
        if (!member.teamId || !member.accountId) {
          return
        }

        const members = membersByTeamId.get(member.teamId) || []
        members.push(member)
        membersByTeamId.set(member.teamId, members)
      })

      membersByTeamId.forEach((members, teamId) => {
        const currentMembers = this.membersByTeam.get(teamId) || []
        const nextMembers = [...currentMembers]

        members.forEach((member) => {
          const existingIndex = nextMembers.findIndex((item) => item.accountId === member.accountId)

          if (existingIndex >= 0) {
            nextMembers[existingIndex] = {
              ...nextMembers[existingIndex],
              ...member
            }
            return
          }

          nextMembers.push(member)
        })

        this.membersByTeam.set(teamId, nextMembers)
      })
    })
  }

  replaceTeamMembers(teamId: string, teamMembers: V2NIMTeamMember[]) {
    runInAction(() => {
      this.membersByTeam.set(
        teamId,
        teamMembers.filter((member) => member.teamId === teamId && member.accountId)
      )
      this.loadedMemberTeamIds.add(teamId)
    })
  }

  getMyMemberRole(teamId: string) {
    const accountId = nimStore.getLoginUser()
    const member = this.getMembers(teamId).find((item) => item.accountId === accountId)
    return member?.memberRole ?? V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_NORMAL
  }

  private canQueryTeams() {
    const nim = nimStore.nim

    if (!nim || !nimStore.getLoginUser()) {
      return false
    }

    try {
      return nim.V2NIMLoginService.getLoginStatus() === 1
    } catch {
      return false
    }
  }

  private async queryTeamInfoWithFallback(teamId: string) {
    if (!nimStore.nim) {
      return null
    }

    try {
      return await nimStore.nim.V2NIMTeamService.getTeamInfo(teamId, NATIVE_COMPATIBLE_TEAM_TYPE)
    } catch (error) {
      const advancedTeam = await nimStore.nim.V2NIMTeamService.getTeamInfo(
        teamId,
        V2NIMTeamType.V2NIM_TEAM_TYPE_ADVANCED
      )

      if (advancedTeam) {
        return advancedTeam
      }

      throw error
    }
  }

  applyTeams(teams: V2NIMTeam[]) {
    runInAction(() => {
      teams.forEach((team) => {
        if (!team.teamId) {
          return
        }

        if (team.isValidTeam === false || team.isTeamEffective === false) {
          this.teams.delete(team.teamId)
          this.membersByTeam.delete(team.teamId)
          this.loadedMemberTeamIds.delete(team.teamId)
          this.preloadedMemberTeamIds.delete(team.teamId)
          return
        }

        this.teams.set(team.teamId, team)
      })
    })
  }

  async refreshJoinedTeams() {
    if (!this.canQueryTeams()) {
      return
    }

    const nim = nimStore.nim

    if (!nim) {
      return
    }

    const teamTypes = [NATIVE_COMPATIBLE_TEAM_TYPE, V2NIMTeamType.V2NIM_TEAM_TYPE_ADVANCED].filter(
      (teamType, index, self) => self.indexOf(teamType) === index
    )
    const teams = await nim.V2NIMTeamService.getJoinedTeamList(teamTypes)
    const joinedTeamIds = new Set(teams.map((team) => team.teamId).filter(Boolean))

    runInAction(() => {
      this.teams.clear()
      Array.from(this.membersByTeam.keys()).forEach((teamId) => {
        if (joinedTeamIds.has(teamId)) {
          return
        }

        this.membersByTeam.delete(teamId)
        this.loadedMemberTeamIds.delete(teamId)
        this.preloadedMemberTeamIds.delete(teamId)
      })
    })
    this.applyTeams(teams)
    runInAction(() => {
      this.hasLoadedJoinedTeams = true
    })
  }

  async refreshTeamInfo(teamId: string, teamType = this.getTeamType(teamId)) {
    if (!nimStore.nim) {
      return null
    }

    const team = await nimStore.nim.V2NIMTeamService.getTeamInfo(teamId, teamType)
    if (team.isValidTeam === false || team.isTeamEffective === false) {
      runInAction(() => {
        this.teams.delete(teamId)
        this.membersByTeam.delete(teamId)
        this.loadedMemberTeamIds.delete(teamId)
        this.preloadedMemberTeamIds.delete(teamId)
      })
      return team
    }

    this.applyTeams([team])
    return team
  }

  async refreshTeamInfoWithNativeFallback(teamId: string) {
    if (!nimStore.nim) {
      return null
    }

    const preferredTeamType = this.getNativeCompatibleTeamType(teamId)
    const queryTeamTypes = [
      preferredTeamType,
      NATIVE_COMPATIBLE_TEAM_TYPE,
      V2NIMTeamType.V2NIM_TEAM_TYPE_ADVANCED
    ].filter((teamType, index, self) => self.indexOf(teamType) === index)
    let lastError: unknown = null

    for (const queryTeamType of queryTeamTypes) {
      try {
        return await this.refreshTeamInfo(teamId, queryTeamType)
      } catch (error) {
        lastError = error
      }
    }

    throw lastError
  }

  async loadMembers(teamId: string, teamType = this.getTeamType(teamId)) {
    if (!nimStore.nim) {
      return []
    }

    const loadKey = `${teamId}:${teamType}`
    const existingPromise = this.memberLoadPromises.get(loadKey)

    if (existingPromise) {
      return existingPromise
    }

    const queryTeamTypes = [
      teamType === V2NIMTeamType.V2NIM_TEAM_TYPE_ADVANCED ? NATIVE_COMPATIBLE_TEAM_TYPE : teamType,
      V2NIMTeamType.V2NIM_TEAM_TYPE_ADVANCED
    ].filter((queryTeamType, index, self) => self.indexOf(queryTeamType) === index)
    let lastError: unknown = null

    const loadPromise = (async () => {
      for (const queryTeamType of queryTeamTypes) {
        try {
          return await this.loadMembersByType(teamId, queryTeamType)
        } catch (error) {
          lastError = error
        }
      }

      throw lastError
    })()

    this.memberLoadPromises.set(loadKey, loadPromise)

    try {
      return await loadPromise
    } finally {
      this.memberLoadPromises.delete(loadKey)
    }
  }

  async preloadMembers(teamId: string, teamType = this.getTeamType(teamId)) {
    if (!nimStore.nim) {
      return []
    }

    if (this.hasLoadedMembers(teamId) || this.preloadedMemberTeamIds.has(teamId)) {
      return this.getMembers(teamId)
    }

    const loadKey = `${teamId}:${teamType}`
    const existingPromise = this.memberPreloadPromises.get(loadKey)

    if (existingPromise) {
      return existingPromise
    }

    const queryTeamTypes = [
      teamType === V2NIMTeamType.V2NIM_TEAM_TYPE_ADVANCED ? NATIVE_COMPATIBLE_TEAM_TYPE : teamType,
      V2NIMTeamType.V2NIM_TEAM_TYPE_ADVANCED
    ].filter((queryTeamType, index, self) => self.indexOf(queryTeamType) === index)
    let lastError: unknown = null

    const loadPromise = (async () => {
      for (const queryTeamType of queryTeamTypes) {
        try {
          return await this.preloadMembersByType(teamId, queryTeamType)
        } catch (error) {
          lastError = error
        }
      }

      throw lastError
    })()

    this.memberPreloadPromises.set(loadKey, loadPromise)

    try {
      return await loadPromise
    } finally {
      this.memberPreloadPromises.delete(loadKey)
    }
  }

  async loadMembersByIds(
    teamId: string,
    accountIds: string[],
    teamType = this.getTeamType(teamId)
  ) {
    if (!nimStore.nim) {
      return []
    }

    const normalizedAccountIds = Array.from(
      new Set(accountIds.map((accountId) => accountId.trim()).filter(Boolean))
    )

    if (normalizedAccountIds.length === 0) {
      return []
    }

    const missingAccountIds = normalizedAccountIds.filter(
      (accountId) => !this.getMembers(teamId).some((member) => member.accountId === accountId)
    )

    if (missingAccountIds.length === 0) {
      return normalizedAccountIds
        .map((accountId) =>
          this.getMembers(teamId).find((member) => member.accountId === accountId)
        )
        .filter(Boolean) as V2NIMTeamMember[]
    }

    const loadKey = `${teamId}:${teamType}:${missingAccountIds.sort().join(',')}`
    const existingPromise = this.memberByIdsLoadPromises.get(loadKey)

    if (existingPromise) {
      return existingPromise
    }

    const queryTeamTypes = [
      teamType === V2NIMTeamType.V2NIM_TEAM_TYPE_ADVANCED ? NATIVE_COMPATIBLE_TEAM_TYPE : teamType,
      V2NIMTeamType.V2NIM_TEAM_TYPE_ADVANCED
    ].filter((queryTeamType, index, self) => self.indexOf(queryTeamType) === index)
    let lastError: unknown = null

    const loadPromise = (async () => {
      for (const queryTeamType of queryTeamTypes) {
        try {
          const members = await nimStore.nim!.V2NIMTeamService.getTeamMemberListByIds(
            teamId,
            queryTeamType,
            missingAccountIds
          )
          this.applyTeamMembers(members)
          return members
        } catch (error) {
          lastError = error
        }
      }

      throw lastError
    })()

    this.memberByIdsLoadPromises.set(loadKey, loadPromise)

    try {
      return await loadPromise
    } finally {
      this.memberByIdsLoadPromises.delete(loadKey)
    }
  }

  private async loadMembersByType(teamId: string, teamType: V2NIMTeamType) {
    if (!nimStore.nim) {
      return []
    }

    const memberList: V2NIMTeamMember[] = []
    let nextToken = ''
    let finished = false

    while (!finished) {
      const result = await nimStore.nim.V2NIMTeamService.getTeamMemberList(teamId, teamType, {
        limit: TEAM_MEMBER_FULL_LOAD_LIMIT,
        nextToken,
        onlyChatBanned: false,
        roleQueryType: 0
      })

      const pageMembers = result.memberList || []
      memberList.push(...pageMembers)
      nextToken = result.nextToken || ''
      finished = result.finished || !nextToken
    }

    this.replaceTeamMembers(teamId, memberList)

    return memberList
  }

  private async preloadMembersByType(teamId: string, teamType: V2NIMTeamType) {
    if (!nimStore.nim) {
      return []
    }

    const result = await nimStore.nim.V2NIMTeamService.getTeamMemberList(teamId, teamType, {
      limit: TEAM_MEMBER_PRELOAD_LIMIT,
      nextToken: '',
      onlyChatBanned: false,
      roleQueryType: 0
    })
    const members = result.memberList || []

    this.applyTeamMembers(members)
    this.preloadedMemberTeamIds.add(teamId)

    return members
  }

  async createTeam(
    name: string,
    inviteeAccountIds: string[],
    options?: {
      category?: TeamCategory
    }
  ) {
    if (!nimStore.nim) {
      return null
    }

    const trimmedName = name.trim()
    const avatarIndex = Math.floor(Math.random() * DEFAULT_TEAM_AVATARS.length)
    const isDiscussion = options?.category === TEAM_CATEGORY.DISCUSSION

    try {
      const result = (await nimStore.nim.V2NIMTeamService.createTeam(
        {
          avatar: DEFAULT_TEAM_AVATARS[avatarIndex],
          name: trimmedName || (isDiscussion ? '讨论组' : '群聊'),
          teamType: NATIVE_COMPATIBLE_TEAM_TYPE,
          joinMode: V2NIMTeamJoinMode.V2NIM_TEAM_JOIN_MODE_FREE,
          agreeMode: V2NIMTeamAgreeMode.V2NIM_TEAM_AGREE_MODE_NO_AUTH,
          inviteMode: isDiscussion
            ? V2NIMTeamInviteMode.V2NIM_TEAM_INVITE_MODE_ALL
            : V2NIMTeamInviteMode.V2NIM_TEAM_INVITE_MODE_MANAGER,
          updateInfoMode: isDiscussion
            ? V2NIMTeamUpdateInfoMode.V2NIM_TEAM_UPDATE_INFO_MODE_ALL
            : V2NIMTeamUpdateInfoMode.V2NIM_TEAM_UPDATE_INFO_MODE_MANAGER,
          updateExtensionMode: V2NIMTeamUpdateExtensionMode.V2NIM_TEAM_UPDATE_EXTENSION_MODE_ALL,
          serverExtension: createTeamServerExtension(options?.category)
        },
        inviteeAccountIds
      )) as V2NIMCreateTeamResult

      this.applyTeams([result.team])
      return result.team
    } catch (error) {
      const nimError = error as { code?: unknown; detail?: unknown; message?: unknown }
      console.warn('[TeamStore] createTeam failed', {
        category: options?.category || TEAM_CATEGORY.GROUP,
        code: nimError.code,
        detail: nimError.detail,
        inviteeCount: inviteeAccountIds.length,
        message: nimError.message
      })
      throw error
    }
  }

  async searchTeams(keyword: string) {
    if (!nimStore.nim) {
      return []
    }

    const trimmedKeyword = keyword.trim()

    if (!trimmedKeyword) {
      return []
    }

    const teams = await nimStore.nim.V2NIMTeamService.searchTeamByKeyword(trimmedKeyword)
    this.applyTeams(teams)
    return teams
  }

  async getTeamById(teamId: string) {
    if (!nimStore.nim) {
      return null
    }

    const trimmedTeamId = teamId.trim()

    if (!trimmedTeamId) {
      return null
    }

    const team = await this.queryTeamInfoWithFallback(trimmedTeamId)
    if (!team) {
      return null
    }

    this.applyTeams([team])
    return team
  }

  async applyJoinTeam(teamId: string, postscript?: string) {
    if (!nimStore.nim) {
      return null
    }

    const team = await nimStore.nim.V2NIMTeamService.applyJoinTeam(
      teamId,
      this.getTeamType(teamId),
      postscript
    )

    this.applyTeams([team])
    this.markRecentlyJoinedTeam(team.teamId || teamId)
    return team
  }

  async inviteMembers(teamId: string, inviteeAccountIds: string[]) {
    if (!nimStore.nim) {
      return
    }

    await nimStore.nim.V2NIMTeamService.inviteMember(
      teamId,
      this.getTeamType(teamId),
      inviteeAccountIds
    )
    await this.loadMembers(teamId)
  }

  async updateTeamInfo(teamId: string, updateParams: V2NIMUpdateTeamInfoParams) {
    if (!nimStore.nim) {
      return
    }

    await nimStore.nim.V2NIMTeamService.updateTeamInfo(
      teamId,
      this.getTeamType(teamId),
      updateParams
    )
    await this.refreshJoinedTeams()
  }

  async updateMyNick(teamId: string, nick: string) {
    if (!nimStore.nim) {
      return
    }

    const accountId = nimStore.getLoginUser()

    if (!accountId) {
      return
    }

    await nimStore.nim.V2NIMTeamService.updateTeamMemberNick(
      teamId,
      this.getTeamType(teamId),
      accountId,
      nick
    )
    this.applyTeamMembers([
      {
        teamId,
        accountId,
        teamNick: nick
      } as V2NIMTeamMember
    ])
    await this.loadMembers(teamId)
  }

  async updateTeamAvatar(teamId: string, localUri: string) {
    if (!nimStore.nim) {
      return
    }

    const task = nimStore.nim.V2NIMStorageService.createUploadFileTask({
      fileObj: localUri
    })
    const avatarUrl = await nimStore.nim.V2NIMStorageService.uploadFile(task, () => undefined)
    await this.updateTeamInfo(teamId, { avatar: avatarUrl })
  }

  async setChatBannedMode(teamId: string, chatBannedMode: V2NIMTeamChatBannedMode) {
    if (!nimStore.nim) {
      return
    }

    await nimStore.nim.V2NIMTeamService.setTeamChatBannedMode(
      teamId,
      this.getTeamType(teamId),
      chatBannedMode
    )
    await this.refreshTeamInfo(teamId)
  }

  async kickMembers(teamId: string, accountIds: string[]) {
    if (!nimStore.nim || accountIds.length === 0) {
      return
    }

    await nimStore.nim.V2NIMTeamService.kickMember(teamId, this.getTeamType(teamId), accountIds)
    await this.loadMembers(teamId)
    await this.refreshTeamInfo(teamId)
  }

  async leaveTeam(teamId: string) {
    if (!nimStore.nim) {
      return
    }

    await nimStore.nim.V2NIMTeamService.leaveTeam(teamId, this.getTeamType(teamId))
    runInAction(() => {
      this.teams.delete(teamId)
      this.membersByTeam.delete(teamId)
      this.loadedMemberTeamIds.delete(teamId)
      this.preloadedMemberTeamIds.delete(teamId)
    })
  }

  async leaveDiscussionTeam(teamId: string) {
    if (!nimStore.nim) {
      return
    }

    const accountId = nimStore.getLoginUser()
    const team = this.getTeam(teamId)

    if (!accountId || team?.ownerAccountId !== accountId) {
      await this.leaveTeam(teamId)
      return
    }

    const members = this.getMembers(teamId).length
      ? this.getMembers(teamId)
      : await this.loadMembers(teamId)

    const aiAccountIds = new Set(getImStoreV2Bridge().aiUsers.map((item) => item.accountId))
    const nextOwner = members.find(
      (member) => member.accountId !== accountId && !aiAccountIds.has(member.accountId)
    )

    if (!nextOwner) {
      await this.dismissTeam(teamId)
      return
    }

    await nimStore.nim.V2NIMTeamService.transferTeamOwner(
      teamId,
      this.getTeamType(teamId),
      nextOwner.accountId,
      true
    )

    runInAction(() => {
      this.teams.delete(teamId)
      this.membersByTeam.delete(teamId)
      this.loadedMemberTeamIds.delete(teamId)
      this.preloadedMemberTeamIds.delete(teamId)
    })
  }

  async dismissTeam(teamId: string) {
    if (!nimStore.nim) {
      return
    }

    await nimStore.nim.V2NIMTeamService.dismissTeam(teamId, this.getTeamType(teamId))
    runInAction(() => {
      this.teams.delete(teamId)
      this.membersByTeam.delete(teamId)
      this.loadedMemberTeamIds.delete(teamId)
      this.preloadedMemberTeamIds.delete(teamId)
    })
  }
}

export const teamStore = new TeamStore()
