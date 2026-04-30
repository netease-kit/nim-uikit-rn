import { makeAutoObservable } from 'mobx'

class ForwardStore {
  multiTargetMode = false
  selectedConversationIds: string[] = []

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true })
  }

  reset() {
    this.multiTargetMode = false
    this.selectedConversationIds = []
  }

  setMultiTargetMode(value: boolean) {
    this.multiTargetMode = value
  }

  toggleConversation(conversationId: string) {
    if (this.selectedConversationIds.includes(conversationId)) {
      this.selectedConversationIds = this.selectedConversationIds.filter(
        (item) => item !== conversationId
      )
      return
    }

    this.selectedConversationIds = [...this.selectedConversationIds, conversationId]
  }

  removeConversation(conversationId: string) {
    this.selectedConversationIds = this.selectedConversationIds.filter(
      (item) => item !== conversationId
    )
  }
}

export const forwardStore = new ForwardStore()
