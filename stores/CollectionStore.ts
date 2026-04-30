import { makeAutoObservable, runInAction } from 'mobx'

import { getForwardPreview, getMessageKey } from '@/utils/messageForward'
import { V2NIMCollection, V2NIMMessage } from '@/utils/nim-sdk'

import { nimStore } from './NIMStore'

export type MessageCollectionPayload = {
  messageRefer: {
    senderId: string
    receiverId: string
    messageClientId: string
    messageServerId: string
    createTime: number
    conversationType: number
    conversationId: string
  }
  preview: string
  senderId: string
  conversationId: string
  messageType: number
}

class CollectionStore {
  collections: V2NIMCollection[] = []
  loading = false

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true })
  }

  private buildCollectionPayload(message: V2NIMMessage): MessageCollectionPayload {
    return {
      messageRefer: {
        senderId: message.senderId,
        receiverId: message.receiverId,
        messageClientId: message.messageClientId,
        messageServerId: message.messageServerId,
        createTime: message.createTime,
        conversationType: message.conversationType,
        conversationId: message.conversationId
      },
      preview: getForwardPreview(message),
      senderId: message.senderId,
      conversationId: message.conversationId,
      messageType: message.messageType
    }
  }

  parseCollectionPayload(collection: V2NIMCollection) {
    try {
      return JSON.parse(collection.collectionData) as MessageCollectionPayload
    } catch {
      return null
    }
  }

  isCollected(message: V2NIMMessage) {
    return this.collections.some((item) => item.uniqueId === getMessageKey(message))
  }

  async refreshCollections() {
    if (!nimStore.nim) {
      return []
    }

    runInAction(() => {
      this.loading = true
    })

    try {
      const result = await nimStore.nim.V2NIMMessageService.getCollectionListExByOption({
        limit: 100,
        collectionType: 1
      })

      runInAction(() => {
        this.collections = result.collectionList
      })

      return result.collectionList
    } finally {
      runInAction(() => {
        this.loading = false
      })
    }
  }

  async addMessageCollection(message: V2NIMMessage) {
    if (!nimStore.nim) {
      return null
    }

    const collection = await nimStore.nim.V2NIMMessageService.addCollection({
      collectionType: 1,
      collectionData: JSON.stringify(this.buildCollectionPayload(message)),
      uniqueId: getMessageKey(message)
    })

    runInAction(() => {
      this.collections = [
        collection,
        ...this.collections.filter((item) => item.uniqueId !== collection.uniqueId)
      ]
    })

    return collection
  }

  async removeCollection(collection: V2NIMCollection) {
    if (!nimStore.nim) {
      return
    }

    await nimStore.nim.V2NIMMessageService.removeCollections([collection])

    runInAction(() => {
      this.collections = this.collections.filter(
        (item) => item.collectionId !== collection.collectionId
      )
    })
  }

  async toggleMessageCollection(message: V2NIMMessage) {
    const existing = this.collections.find((item) => item.uniqueId === getMessageKey(message))

    if (existing) {
      await this.removeCollection(existing)
      return false
    }

    await this.addMessageCollection(message)
    return true
  }

  async getCollectionMessage(collection: V2NIMCollection) {
    if (!nimStore.nim) {
      return null
    }

    const payload = this.parseCollectionPayload(collection)

    if (!payload) {
      return null
    }

    const messages = await nimStore.nim.V2NIMMessageService.getMessageListByRefers([
      payload.messageRefer
    ])
    return messages[0] || null
  }
}

export const collectionStore = new CollectionStore()
