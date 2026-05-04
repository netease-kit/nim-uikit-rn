import { makeAutoObservable, observable, runInAction } from 'mobx'

import {
  V2NIMCreateTeamResult,
  V2NIMTeam,
  V2NIMTeamChatBannedMode,
  V2NIMTeamMember,
  V2NIMTeamMemberRole,
  V2NIMTeamType,
  V2NIMUpdateTeamInfoParams
} from '@/utils/nim-sdk'

import { nimStore } from './NIMStore'
import { userStore } from './UserStore'

class TeamStore {
  teams = observable.map<string, V2NIMTeam>()
  membersByTeam = observable.map<string, V2NIMTeamMember[]>()

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true })
  }

  get teamList() {
    return Array.from(this.teams.values()).sort((a, b) => {
      const left = a.name || a.teamId
      const right = b.name || b.teamId
      return left.localeCompare(right, 'zh-Hans-CN')
    })
  }

  getTeam(teamId: string) {
    return this.teams.get(teamId) || null
  }

  getMembers(teamId: string) {
    return this.membersByTeam.get(teamId) || []
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

  applyTeams(teams: V2NIMTeam[]) {
    runInAction(() => {
      teams.forEach((team) => {
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

    const teams = await nim.V2NIMTeamService.getJoinedTeamList([
      V2NIMTeamType.V2NIM_TEAM_TYPE_ADVANCED
    ])
    runInAction(() => {
      this.teams.clear()
    })
    this.applyTeams(teams)
  }

  async refreshTeamInfo(teamId: string, teamType = V2NIMTeamType.V2NIM_TEAM_TYPE_ADVANCED) {
    if (!nimStore.nim) {
      return null
    }

    const team = await nimStore.nim.V2NIMTeamService.getTeamInfo(teamId, teamType)
    this.applyTeams([team])
    return team
  }

  async loadMembers(teamId: string, teamType = V2NIMTeamType.V2NIM_TEAM_TYPE_ADVANCED) {
    if (!nimStore.nim) {
      return []
    }

    const result = await nimStore.nim.V2NIMTeamService.getTeamMemberList(teamId, teamType, {
      direction: 0,
      limit: 100,
      nextToken: '',
      onlyChatBanned: false,
      roleQueryType: 0
    })

    runInAction(() => {
      this.membersByTeam.set(teamId, result.memberList)
    })

    userStore
      .fetchUsers(result.memberList.map((item) => item.accountId))
      .catch(() => undefined)

    return result.memberList
  }

  async createTeam(name: string, inviteeAccountIds: string[]) {
    if (!nimStore.nim) {
      return null
    }

    const trimmedName = name.trim()
    const result = (await nimStore.nim.V2NIMTeamService.createTeam(
      {
        name: trimmedName || '群聊',
        teamType: V2NIMTeamType.V2NIM_TEAM_TYPE_ADVANCED,
        memberLimit: 200
      },
      inviteeAccountIds
    )) as V2NIMCreateTeamResult

    this.applyTeams([result.team])
    return result.team
  }

  async inviteMembers(teamId: string, inviteeAccountIds: string[]) {
    if (!nimStore.nim) {
      return
    }

    await nimStore.nim.V2NIMTeamService.inviteMember(
      teamId,
      V2NIMTeamType.V2NIM_TEAM_TYPE_ADVANCED,
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
      V2NIMTeamType.V2NIM_TEAM_TYPE_ADVANCED,
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
      V2NIMTeamType.V2NIM_TEAM_TYPE_ADVANCED,
      accountId,
      nick
    )
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
      V2NIMTeamType.V2NIM_TEAM_TYPE_ADVANCED,
      chatBannedMode
    )
    await this.refreshTeamInfo(teamId)
  }

  async kickMembers(teamId: string, accountIds: string[]) {
    if (!nimStore.nim || accountIds.length === 0) {
      return
    }

    await nimStore.nim.V2NIMTeamService.kickMember(
      teamId,
      V2NIMTeamType.V2NIM_TEAM_TYPE_ADVANCED,
      accountIds
    )
    await this.loadMembers(teamId)
    await this.refreshTeamInfo(teamId)
  }

  async leaveTeam(teamId: string) {
    if (!nimStore.nim) {
      return
    }

    await nimStore.nim.V2NIMTeamService.leaveTeam(teamId, V2NIMTeamType.V2NIM_TEAM_TYPE_ADVANCED)
    runInAction(() => {
      this.teams.delete(teamId)
      this.membersByTeam.delete(teamId)
    })
  }

  async dismissTeam(teamId: string) {
    if (!nimStore.nim) {
      return
    }

    await nimStore.nim.V2NIMTeamService.dismissTeam(teamId, V2NIMTeamType.V2NIM_TEAM_TYPE_ADVANCED)
    runInAction(() => {
      this.teams.delete(teamId)
      this.membersByTeam.delete(teamId)
    })
  }
}

export const teamStore = new TeamStore()
