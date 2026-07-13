import { makeAutoObservable, runInAction } from 'mobx'
import { Platform } from 'react-native'

import {
  getForwardPreview,
  getMessageKey,
  sanitizeMergedForwardSerializedMessage
} from '@/utils/messageForward'
import {
  V2NIMCollection,
  V2NIMConversationType,
  V2NIMMessage,
  V2NIMMessageType
} from '@/utils/nim-sdk'

import { conversationStore } from './ConversationStore'
import { friendStore } from './FriendStore'
import { nimStore } from './NIMStore'
import { teamStore } from './TeamStore'
import { userStore } from './UserStore'

export type MessageCollectionPayload = {
  messageRefer?: {
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
  message?: string
  conversationName?: string
  senderName?: string
  avatar?: string
}

const NATIVE_COLLECTION_TYPE_OFFSET = 1000
const COLLECTION_PAGE_LIMIT = 100
const COLLECTION_QUERY_ALL_TYPES = 0

type NativeCollectionPayload = {
  message?: string
  conversationName?: string
  senderName?: string
  avatar?: string
}

class CollectionStore {
  collections: V2NIMCollection[] = []
  loading = false

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true })
  }

  private buildCollectionPayload(message: V2NIMMessage): MessageCollectionPayload {
    const serializedMessage = this.serializeCollectionMessage(message)

    return {
      message: serializedMessage || undefined,
      conversationName: this.getCollectionConversationName(message),
      senderName: this.getCollectionSenderName(message),
      avatar: this.getCollectionSenderAvatar(message),
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

  getCollectionSenderName(
    message?: V2NIMMessage | null,
    snapshotName = '',
    options?: {
      senderId?: string
      teamId?: string
    }
  ) {
    const senderId = message?.senderId || options?.senderId || ''

    if (!senderId) {
      return snapshotName
    }

    const messageSnapshotName = message ? this.getMessageSenderSnapshotName(message) : ''
    let inferredTeamId = options?.teamId || ''

    if (
      !inferredTeamId &&
      message &&
      message.conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM
    ) {
      inferredTeamId = this.getConversationTargetId(message.conversationId) || message.receiverId
    }
    const isTeamConversation = !!inferredTeamId
    const selfProfile = userStore.selfProfile?.accountId === senderId ? userStore.selfProfile : null
    const user = userStore.users.get(senderId)
    const friend = friendStore.friends.get(senderId)
    const teamMember = inferredTeamId
      ? teamStore.getMembers(inferredTeamId).find((item) => item.accountId === senderId)
      : null
    const alias = friend?.alias || ''
    const userNickname = user?.name || selfProfile?.name || friend?.userProfile?.name || ''

    if (isTeamConversation) {
      return (
        alias ||
        teamMember?.teamNick ||
        messageSnapshotName ||
        userNickname ||
        snapshotName ||
        senderId
      )
    }

    return alias || userNickname || snapshotName || messageSnapshotName || senderId
  }

  getCollectionSenderAvatar(message?: V2NIMMessage | null, snapshotAvatar = '') {
    const senderId = message?.senderId || ''

    if (!senderId) {
      return snapshotAvatar
    }

    const selfProfile = userStore.selfProfile?.accountId === senderId ? userStore.selfProfile : null
    const user = userStore.users.get(senderId)
    const friend = friendStore.friends.get(senderId)

    return (
      snapshotAvatar || user?.avatar || selfProfile?.avatar || friend?.userProfile?.avatar || ''
    )
  }

  getCollectionConversationName(message?: V2NIMMessage | null, snapshotName = '') {
    if (!message?.conversationId) {
      return snapshotName
    }

    const conversation = conversationStore.getConversation(message.conversationId)
    const targetId = this.getConversationTargetId(message.conversationId) || message.receiverId

    if (message.conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM) {
      return teamStore.getTeam(targetId)?.name || snapshotName || conversation?.name || targetId
    }

    if (message.conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P) {
      const peerId =
        targetId && targetId !== nimStore.getLoginUser() ? targetId : message.senderId || targetId
      const peerMessage = peerId === message.senderId ? message : null

      return (
        snapshotName ||
        conversation?.name ||
        this.getCollectionSenderName(peerMessage, peerId) ||
        peerId
      )
    }

    return snapshotName || conversation?.name || targetId || message.conversationId
  }

  parseCollectionPayload(collection: V2NIMCollection) {
    try {
      const data = JSON.parse(collection.collectionData) as MessageCollectionPayload &
        NativeCollectionPayload
      const messageType =
        data.messageType ??
        (collection.collectionType > NATIVE_COLLECTION_TYPE_OFFSET
          ? collection.collectionType - NATIVE_COLLECTION_TYPE_OFFSET
          : undefined)

      return {
        ...data,
        messageType,
        preview: data.preview || this.getNativePreviewText(data, messageType),
        senderId: data.senderId || data.messageRefer?.senderId || '',
        conversationId: data.conversationId || data.messageRefer?.conversationId || '',
        conversationName: data.conversationName || '',
        senderName: data.senderName || '',
        avatar: data.avatar || ''
      } as MessageCollectionPayload
    } catch {
      return null
    }
  }

  isCollected(message: V2NIMMessage) {
    return !!this.findMessageCollection(message)
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
        limit: COLLECTION_PAGE_LIMIT,
        collectionType: COLLECTION_QUERY_ALL_TYPES
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

  async collectMessage(message: V2NIMMessage) {
    if (!nimStore.nim) {
      return null
    }

    const existing = this.findMessageCollection(message)

    if (existing) {
      await nimStore.nim.V2NIMMessageService.removeCollections([existing])
    }

    const collection = await nimStore.nim.V2NIMMessageService.addCollection({
      collectionType: this.getMessageCollectionType(message),
      collectionData: JSON.stringify(this.buildCollectionPayload(message)),
      uniqueId: this.getMessageCollectionUniqueId(message)
    })

    runInAction(() => {
      this.collections = [
        collection,
        ...this.collections.filter(
          (item) =>
            item.collectionId !== existing?.collectionId && item.uniqueId !== collection.uniqueId
        )
      ]
    })

    return collection
  }

  async addMessageCollection(message: V2NIMMessage) {
    return this.collectMessage(message)
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
    const existing = this.findMessageCollection(message)

    if (existing) {
      await this.removeCollection(existing)
      return false
    }

    await this.collectMessage(message)
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

    const serializedMessage = payload.message
    if (serializedMessage) {
      const message = this.deserializeCollectionMessage(serializedMessage)

      if (message) {
        return message
      }
    }

    if (!payload.messageRefer) {
      return null
    }

    const messages = await nimStore.nim.V2NIMMessageService.getMessageListByRefers([
      payload.messageRefer
    ])
    return messages[0] || null
  }

  private getMessageCollectionType(message: V2NIMMessage) {
    return (message.messageType || 0) + NATIVE_COLLECTION_TYPE_OFFSET
  }

  private getMessageCollectionUniqueId(message: V2NIMMessage) {
    return message.messageServerId || getMessageKey(message)
  }

  private findMessageCollection(message: V2NIMMessage) {
    const uniqueIds = new Set(
      [this.getMessageCollectionUniqueId(message), getMessageKey(message), message.messageServerId]
        .map((item) => item || '')
        .filter(Boolean)
    )

    return this.collections.find((item) => !!item.uniqueId && uniqueIds.has(item.uniqueId)) || null
  }

  private serializeCollectionMessage(message: V2NIMMessage) {
    if (!nimStore.nim) {
      return ''
    }

    try {
      return nimStore.nim.V2NIMMessageConverter.messageSerialization(message) || ''
    } catch {
      return ''
    }
  }

  private deserializeCollectionMessage(serializedMessage: string) {
    if (!nimStore.nim) {
      return null
    }

    const candidates =
      Platform.OS === 'android'
        ? [sanitizeMergedForwardSerializedMessage(serializedMessage), serializedMessage]
        : [serializedMessage, sanitizeMergedForwardSerializedMessage(serializedMessage)]

    for (const candidate of Array.from(new Set(candidates))) {
      try {
        return nimStore.nim.V2NIMMessageConverter.messageDeserialization(candidate)
      } catch {
        continue
      }
    }

    return null
  }

  private getConversationTargetId(conversationId: string) {
    try {
      return nimStore.nim?.V2NIMConversationIdUtil.parseConversationTargetId(conversationId) || ''
    } catch {
      const parts = conversationId.split('|')
      return parts[1] || ''
    }
  }

  private getMessageSenderSnapshotName(message: V2NIMMessage) {
    const messageWithSenderName = message as V2NIMMessage & {
      senderName?: string
      fromNick?: string
      nickFromMsg?: string
    }

    return (
      messageWithSenderName.senderName ||
      messageWithSenderName.fromNick ||
      messageWithSenderName.nickFromMsg ||
      ''
    )
  }

  private getNativePreviewText(payload: NativeCollectionPayload, messageType?: number) {
    switch (messageType) {
      case V2NIMMessageType.V2NIM_MESSAGE_TYPE_TEXT: {
        const message = payload.message ? this.deserializeCollectionMessage(payload.message) : null
        return message?.text || ''
      }
      default:
        return ''
    }
  }
}

export const collectionStore = new CollectionStore()
