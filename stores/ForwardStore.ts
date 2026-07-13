import { makeAutoObservable } from 'mobx'

import { V2NIMMessage } from '@/utils/nim-sdk'

class ForwardStore {
  multiTargetMode = false
  selectedConversationIds: string[] = []
  pendingExitBatchSelectionConversationId: string | null = null
  private pendingLatestAlignmentConversationIds = new Set<string>()
  private sourceConversationId: string | null = null
  private sourceMessages: V2NIMMessage[] = []

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true })
  }

  reset() {
    this.multiTargetMode = false
    this.selectedConversationIds = []
  }

  setSourceMessages(conversationId: string, messages: V2NIMMessage[]) {
    this.sourceConversationId = conversationId
    this.sourceMessages = messages.slice()
  }

  getSourceMessages(conversationId: string) {
    if (!conversationId || this.sourceConversationId !== conversationId) {
      return []
    }

    return this.sourceMessages.slice()
  }

  clearSourceMessages() {
    this.sourceConversationId = null
    this.sourceMessages = []
  }

  markExitBatchSelection(conversationId: string) {
    this.pendingExitBatchSelectionConversationId = conversationId
  }

  consumeExitBatchSelection(conversationId: string) {
    if (this.pendingExitBatchSelectionConversationId !== conversationId) {
      return false
    }

    this.pendingExitBatchSelectionConversationId = null
    return true
  }

  markLatestAlignment(conversationId: string) {
    if (!conversationId) {
      return
    }

    this.pendingLatestAlignmentConversationIds.add(conversationId)
  }

  consumeLatestAlignment(conversationId: string) {
    if (!this.pendingLatestAlignmentConversationIds.has(conversationId)) {
      return false
    }

    this.pendingLatestAlignmentConversationIds.delete(conversationId)
    return true
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
