import { makeAutoObservable, observable, runInAction } from 'mobx'

import { V2NIMUser, V2NIMUserUpdateParams } from '@/utils/nim-sdk'

import { nimStore } from './NIMStore'

class UserStore {
  selfProfile: V2NIMUser | null = null
  users = observable.map<string, V2NIMUser>()
  userVersion = 0
  isLoadingSelf = false

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true })
  }

  resetState() {
    runInAction(() => {
      this.selfProfile = null
      this.users.clear()
      this.userVersion += 1
      this.isLoadingSelf = false
    })
  }

  applyUsers(users: V2NIMUser[]) {
    runInAction(() => {
      const selfAccountId = this.selfProfile?.accountId || nimStore.getLoginUser()
      let nextSelfProfile: V2NIMUser | null = null

      users.forEach((user) => {
        const mergedUser = { ...this.users.get(user.accountId), ...user } as V2NIMUser
        this.users.set(user.accountId, mergedUser)

        if (selfAccountId && user.accountId === selfAccountId) {
          nextSelfProfile = {
            ...(this.selfProfile || this.users.get(user.accountId)),
            ...mergedUser
          } as V2NIMUser
        }
      })

      if (nextSelfProfile) {
        const resolvedSelfProfile = nextSelfProfile as V2NIMUser
        this.selfProfile = resolvedSelfProfile
        this.users.set(resolvedSelfProfile.accountId, resolvedSelfProfile)
      }

      if (users.length > 0) {
        this.userVersion += 1
      }
    })
  }

  private mergeSelfProfile(updateParams: V2NIMUserUpdateParams) {
    const accountId = nimStore.getLoginUser()

    runInAction(() => {
      const nextProfile = this.selfProfile
        ? ({ ...this.selfProfile, ...updateParams } as V2NIMUser)
        : accountId
          ? ({ accountId, name: '', createTime: Date.now(), ...updateParams } as V2NIMUser)
          : null

      if (!nextProfile) {
        return
      }

      this.selfProfile = nextProfile
      this.users.set(nextProfile.accountId, nextProfile)
      this.userVersion += 1
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
    const normalized = Array.from(new Set(accountIds.map((item) => item.trim()).filter(Boolean)))

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

  async searchAccountExactly(accountId: string) {
    const normalizedAccountId = accountId.trim()

    if (!normalizedAccountId) {
      return null
    }

    const user = await this.fetchUser(normalizedAccountId)
    return user?.accountId === normalizedAccountId ? user : null
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
    this.mergeSelfProfile(updateParams)
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
