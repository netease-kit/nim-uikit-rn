import { makeAutoObservable, observable, runInAction } from 'mobx'

import { V2NIMUser, V2NIMUserUpdateParams } from '@/utils/nim-sdk'

import { nimStore } from './NIMStore'

class UserStore {
  selfProfile: V2NIMUser | null = null
  users = observable.map<string, V2NIMUser>()
  isLoadingSelf = false

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true })
  }

  applyUsers(users: V2NIMUser[]) {
    runInAction(() => {
      users.forEach((user) => {
        this.users.set(user.accountId, user)
      })
    })
  }

  async refreshSelfProfile() {
    const accountId = nimStore.getLoginUser()

    if (!accountId || !nimStore.nim) {
      return null
    }

    runInAction(() => {
      this.isLoadingSelf = true
    })

    try {
      const users = await nimStore.nim.V2NIMUserService.getUserListFromCloud([accountId])
      const profile = users[0] ?? null

      runInAction(() => {
        this.selfProfile = profile
      })
      this.applyUsers(users)
      return profile
    } finally {
      runInAction(() => {
        this.isLoadingSelf = false
      })
    }
  }

  async fetchUsers(accountIds: string[]) {
    const normalized = Array.from(
      new Set(accountIds.map((item) => item.trim()).filter(Boolean))
    )

    if (normalized.length === 0 || !nimStore.nim) {
      return []
    }

    const users = await nimStore.nim.V2NIMUserService.getUserListFromCloud(normalized)
    this.applyUsers(users)

    const currentAccountId = nimStore.getLoginUser()
    const currentUser = users.find((item) => item.accountId === currentAccountId)

    if (currentUser) {
      runInAction(() => {
        this.selfProfile = currentUser
      })
    }

    return users
  }

  async fetchUser(accountId: string) {
    const users = await this.fetchUsers([accountId])
    return users[0] ?? null
  }

  async searchUsers(keyword: string) {
    const normalizedKeyword = keyword.trim()

    if (!normalizedKeyword || !nimStore.nim) {
      return []
    }

    const result = await nimStore.nim.V2NIMUserService.searchUserByOption({
      keyword: normalizedKeyword,
      searchAccountId: true,
      searchMobile: true,
      searchName: true
    })
    this.applyUsers(result)
    return result
  }

  async updateSelfProfile(updateParams: V2NIMUserUpdateParams) {
    if (!nimStore.nim) {
      return
    }

    await nimStore.nim.V2NIMUserService.updateSelfUserProfile(updateParams)
    await this.refreshSelfProfile()
  }

  async updateAvatar(localUri: string) {
    if (!nimStore.nim) {
      return
    }

    const task = nimStore.nim.V2NIMStorageService.createUploadFileTask({
      fileObj: localUri
    })
    const avatarUrl = await nimStore.nim.V2NIMStorageService.uploadFile(task, () => undefined)
    await this.updateSelfProfile({ avatar: avatarUrl })
  }

  getDisplayName(accountId: string, fallback?: string) {
    if (this.selfProfile?.accountId === accountId) {
      return this.selfProfile.name || fallback || accountId
    }

    return this.users.get(accountId)?.name || fallback || accountId
  }
}

export const userStore = new UserStore()
