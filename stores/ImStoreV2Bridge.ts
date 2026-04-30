import RootStore from '@xkit-yx/im-store-v2'
import type { LocalOptions } from '@xkit-yx/im-store-v2/dist/types/types'
import { makeAutoObservable, runInAction } from 'mobx'

import type { V2NIM } from '@/utils/nim-sdk'

class ImStoreV2Bridge {
  rootStore: RootStore | null = null
  bindError: string | null = null

  private nim: V2NIM | null = null

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true })
  }

  bindNIM(nim: V2NIM, localOptions: Partial<LocalOptions> = {}) {
    if (this.nim === nim && this.rootStore) {
      return this.rootStore
    }

    this.destroy()

    try {
      const rootStore = new RootStore(
        nim as unknown as ConstructorParameters<typeof RootStore>[0],
        {
          enableTeam: true,
          needMention: true,
          p2pMsgReceiptVisible: true,
          teamMsgReceiptVisible: true,
          teamManagerVisible: true,
          ...localOptions
        },
        'RN'
      )

      runInAction(() => {
        this.nim = nim
        this.rootStore = rootStore
        this.bindError = null
      })

      return rootStore
    } catch (error) {
      runInAction(() => {
        this.bindError = error instanceof Error ? error.message : 'im-store-v2 bind failed'
      })
      return null
    }
  }

  destroy() {
    this.rootStore?.destroy()
    this.rootStore = null
    this.nim = null
  }

  get conversations() {
    const localConversationStore = this.rootStore?.localConversationStore
    const conversationStore = this.rootStore?.conversationStore

    if (localConversationStore) {
      return this.sortConversations(Array.from(localConversationStore.conversations.values()))
    }

    if (conversationStore) {
      return this.sortConversations(Array.from(conversationStore.conversations.values()))
    }

    return []
  }

  private sortConversations<
    T extends { stickTop?: boolean; sortOrder?: number; lastMessage?: any }
  >(conversations: T[]) {
    return conversations.slice().sort((left, right) => {
      if (!!left.stickTop !== !!right.stickTop) {
        return left.stickTop ? -1 : 1
      }

      const leftTime = left.sortOrder || left.lastMessage?.messageRefer?.createTime || 0
      const rightTime = right.sortOrder || right.lastMessage?.messageRefer?.createTime || 0

      return rightTime - leftTime
    })
  }

  get totalUnread() {
    return (
      this.rootStore?.localConversationStore?.totalUnreadCount ||
      this.rootStore?.conversationStore?.totalUnreadCount ||
      0
    )
  }

  get friends() {
    return this.rootStore ? Array.from(this.rootStore.friendStore.friends.values()) : []
  }

  get teams() {
    return this.rootStore?.uiStore.teamList || []
  }

  get users() {
    return this.rootStore?.uiStore.users || []
  }
}

export const imStoreV2Bridge = new ImStoreV2Bridge()
