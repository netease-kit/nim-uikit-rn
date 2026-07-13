import { makeAutoObservable, runInAction } from 'mobx'

class ConversationListUIStore {
  jumpToNearestUnreadRequestId = 0

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true })
  }

  requestJumpToNearestUnread() {
    runInAction(() => {
      this.jumpToNearestUnreadRequestId += 1
    })
  }
}

export const conversationListUIStore = new ConversationListUIStore()
