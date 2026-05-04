import { makeAutoObservable, observable, runInAction } from 'mobx'

import {
  V2NIMFriend,
  V2NIMFriendAddApplication,
  V2NIMFriendAddApplicationStatus,
  V2NIMFriendAddMode
} from '@/utils/nim-sdk'

import { nimStore } from './NIMStore'

class FriendStore {
  friends = observable.map<string, V2NIMFriend>()
  applications: V2NIMFriendAddApplication[] = []
  unreadApplicationCount = 0
  blockList: string[] = []

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true })
  }

  private canQueryFriends() {
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

  async refreshAll() {
    if (!this.canQueryFriends()) {
      return
    }

    const nim = nimStore.nim

    if (!nim) {
      return
    }

    const [friends, applicationsResult, unreadCount, blockList] = await Promise.all([
      nim.V2NIMFriendService.getFriendList(),
      nim.V2NIMFriendService.getAddApplicationList({
        offset: 0,
        limit: 100
      } as never),
      nim.V2NIMFriendService.getAddApplicationUnreadCount(),
      nim.V2NIMUserService.getBlockList()
    ])

    runInAction(() => {
      this.friends.clear()
      friends.forEach((friend) => {
        this.friends.set(friend.accountId, friend)
      })
      this.applications = applicationsResult.infos
        .slice()
        .sort(
          (a: V2NIMFriendAddApplication, b: V2NIMFriendAddApplication) => b.timestamp - a.timestamp
        )
      this.unreadApplicationCount = unreadCount
      this.blockList = blockList
    })
  }

  get friendList() {
    return Array.from(this.friends.values()).sort((a, b) => {
      const left = (a.alias || a.userProfile?.name || a.accountId).toLowerCase()
      const right = (b.alias || b.userProfile?.name || b.accountId).toLowerCase()
      return left.localeCompare(right, 'zh-Hans-CN')
    })
  }

  async addFriend(accountId: string, postscript: string) {
    if (!nimStore.nim) {
      return
    }

    await nimStore.nim.V2NIMFriendService.addFriend(accountId, {
      addMode: V2NIMFriendAddMode.V2NIM_FRIEND_MODE_TYPE_APPLY,
      postscript
    })
    await this.refreshAll()
  }

  async accept(application: V2NIMFriendAddApplication) {
    if (!nimStore.nim) {
      return
    }

    await nimStore.nim.V2NIMFriendService.acceptAddApplication(application)
    await this.refreshAll()
  }

  async reject(application: V2NIMFriendAddApplication, postscript?: string) {
    if (!nimStore.nim) {
      return
    }

    await nimStore.nim.V2NIMFriendService.rejectAddApplication(application, postscript)
    await this.refreshAll()
  }

  async markApplicationsRead() {
    if (!nimStore.nim) {
      return
    }

    await nimStore.nim.V2NIMFriendService.setAddApplicationRead()
    runInAction(() => {
      this.unreadApplicationCount = 0
    })
  }

  async clearApplications() {
    if (!nimStore.nim) {
      return
    }

    await nimStore.nim.V2NIMFriendService.clearAllAddApplication()
    await this.refreshAll()
  }

  async deleteApplication(application: V2NIMFriendAddApplication) {
    if (!nimStore.nim) {
      return
    }

    await nimStore.nim.V2NIMFriendService.deleteAddApplication(application)
    await this.refreshAll()
  }

  async updateAlias(accountId: string, alias: string) {
    if (!nimStore.nim) {
      return
    }

    await nimStore.nim.V2NIMFriendService.setFriendInfo(accountId, { alias })
    await this.refreshAll()
  }

  async deleteFriend(accountId: string) {
    if (!nimStore.nim) {
      return
    }

    await nimStore.nim.V2NIMFriendService.deleteFriend(accountId, {
      deleteAlias: true
    })
    await this.refreshAll()
  }

  async addToBlockList(accountId: string) {
    if (!nimStore.nim) {
      return
    }

    await nimStore.nim.V2NIMUserService.addUserToBlockList(accountId)
    await this.refreshAll()
  }

  async removeFromBlockList(accountId: string) {
    if (!nimStore.nim) {
      return
    }

    await nimStore.nim.V2NIMUserService.removeUserFromBlockList(accountId)
    await this.refreshAll()
  }

  getApplicationStatusLabel(status: V2NIMFriendAddApplicationStatus) {
    switch (status) {
      case V2NIMFriendAddApplicationStatus.V2NIM_FRIEND_ADD_APPLICATION_STATUS_AGREED:
        return '已同意'
      case V2NIMFriendAddApplicationStatus.V2NIM_FRIEND_ADD_APPLICATION_STATUS_REJECTED:
        return '已拒绝'
      case V2NIMFriendAddApplicationStatus.V2NIM_FRIEND_ADD_APPLICATION_STATUS_EXPIRED:
        return '已过期'
      case V2NIMFriendAddApplicationStatus.V2NIM_FRIEND_ADD_APPLICATION_STATUS_DIRECT_ADD:
        return '已直接添加'
      default:
        return '待处理'
    }
  }
}

export const friendStore = new FriendStore()
