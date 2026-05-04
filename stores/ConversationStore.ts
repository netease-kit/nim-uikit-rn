import { makeAutoObservable, runInAction } from 'mobx'

import { getRandomAvatar } from '@/utils'
import {
  V2NIMConversationType,
  V2NIMLocalConversation,
  V2NIMP2PMessageMuteMode,
  V2NIMTeamMessageMuteMode,
  V2NIMTeamType
} from '@/utils/nim-sdk'

import { nimStore } from './NIMStore'

class ConversationStore {
  conversations: V2NIMLocalConversation[] = []
  totalUnread = 0
  isLoading = false
  isLoadingMore = false
  hasMore = true
  nextOffset = 0

  private readonly pageSize = 50

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true })
  }

  private decorateConversation(conversation: V2NIMLocalConversation) {
    return {
      ...conversation,
      avatar:
        conversation.avatar ||
        this.getConversation(conversation.conversationId)?.avatar ||
        getRandomAvatar()
    }
  }

  private recalculateSummary() {
    this.totalUnread = this.conversations.reduce((sum, item) => sum + (item.unreadCount || 0), 0)
  }

  private mergeConversations(incoming: V2NIMLocalConversation[], append: boolean) {
    const merged = new Map<string, V2NIMLocalConversation>()

    if (append) {
      this.conversations.forEach((conversation) => {
        merged.set(conversation.conversationId, conversation)
      })
    }

    incoming.forEach((conversation) => {
      merged.set(conversation.conversationId, this.decorateConversation(conversation))
    })

    this.conversations = this.sortConversations(Array.from(merged.values()))
    this.recalculateSummary()
  }

  private sortConversations(conversations: V2NIMLocalConversation[]) {
    return conversations.slice().sort((left, right) => {
      if (!!left.stickTop !== !!right.stickTop) {
        return left.stickTop ? -1 : 1
      }

      const leftTime = left.sortOrder || left.lastMessage?.messageRefer?.createTime || 0
      const rightTime = right.sortOrder || right.lastMessage?.messageRefer?.createTime || 0

      return rightTime - leftTime
    })
  }

  // 同步会话列表
  syncConversations = (conversations: V2NIMLocalConversation[], append = false) => {
    runInAction(() => {
      this.mergeConversations(conversations, append)
    })
  }

  private canQueryConversations() {
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

  async refreshConversations() {
    if (!this.canQueryConversations()) {
      return
    }

    const nim = nimStore.nim

    if (!nim) {
      return
    }

    runInAction(() => {
      this.isLoading = true
    })

    try {
      const result = await nim.V2NIMLocalConversationService.getConversationList(0, this.pageSize)

      runInAction(() => {
        this.nextOffset = result.offset
        this.hasMore = !result.finished
      })

      this.syncConversations(result.conversationList, false)
    } catch (error) {
      if (error instanceof Error && error.message.toLowerCase().includes('illegal state')) {
        return
      }

      throw error
    } finally {
      runInAction(() => {
        this.isLoading = false
      })
    }
  }

  async loadMoreConversations() {
    if (!this.canQueryConversations() || this.isLoading || this.isLoadingMore || !this.hasMore) {
      return
    }

    const nim = nimStore.nim

    if (!nim) {
      return
    }

    runInAction(() => {
      this.isLoadingMore = true
    })

    try {
      const result = await nim.V2NIMLocalConversationService.getConversationList(
        this.nextOffset,
        this.pageSize
      )

      runInAction(() => {
        this.nextOffset = result.offset
        this.hasMore = !result.finished
      })

      this.syncConversations(result.conversationList, true)
    } catch (error) {
      if (error instanceof Error && error.message.toLowerCase().includes('illegal state')) {
        return
      }

      throw error
    } finally {
      runInAction(() => {
        this.isLoadingMore = false
      })
    }
  }

  // 添加会话
  addConversation = (conversation: V2NIMLocalConversation) => {
    runInAction(() => {
      this.mergeConversations([conversation], true)
    })
  }

  async createConversation(conversationId: string) {
    if (!nimStore.nim) {
      return null
    }

    const conversation =
      await nimStore.nim.V2NIMLocalConversationService.createConversation(conversationId)
    this.addConversation(conversation)
    return conversation
  }

  // 更新会话
  updateConversation = (id: string, updates: Partial<V2NIMLocalConversation>) => {
    runInAction(() => {
      const index = this.conversations.findIndex((conv) => conv.conversationId === id)
      if (index !== -1) {
        this.conversations[index] = this.decorateConversation({
          ...this.conversations[index],
          ...updates
        } as V2NIMLocalConversation)
      } else {
        this.conversations.push(
          this.decorateConversation({
            ...(updates as V2NIMLocalConversation),
            conversationId: id
          })
        )
      }

      this.conversations = this.sortConversations(this.conversations)
      this.recalculateSummary()
    })
  }

  async toggleStickTop(conversationId: string, stickTop: boolean) {
    if (!nimStore.nim) {
      return
    }

    await nimStore.nim.V2NIMLocalConversationService.stickTopConversation(conversationId, stickTop)
    await this.refreshConversations()
  }

  async toggleMute(conversationId: string, mute: boolean) {
    if (!nimStore.nim) {
      return
    }

    const conversationType =
      nimStore.nim.V2NIMConversationIdUtil.parseConversationType(conversationId)
    const targetId = nimStore.nim.V2NIMConversationIdUtil.parseConversationTargetId(conversationId)

    if (conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P) {
      await nimStore.nim.V2NIMSettingService.setP2PMessageMuteMode(
        targetId,
        mute
          ? V2NIMP2PMessageMuteMode.V2NIM_P2P_MESSAGE_MUTE_MODE_ON
          : V2NIMP2PMessageMuteMode.V2NIM_P2P_MESSAGE_MUTE_MODE_OFF
      )
    } else if (conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM) {
      await nimStore.nim.V2NIMSettingService.setTeamMessageMuteMode(
        targetId,
        V2NIMTeamType.V2NIM_TEAM_TYPE_ADVANCED,
        mute
          ? V2NIMTeamMessageMuteMode.V2NIM_TEAM_MESSAGE_MUTE_MODE_ON
          : V2NIMTeamMessageMuteMode.V2NIM_TEAM_MESSAGE_MUTE_MODE_OFF
      )
    }

    await this.refreshConversations()
  }

  // 删除会话
  deleteConversation = async (id: string, clearMessage = false) => {
    if (nimStore.nim) {
      await nimStore.nim.V2NIMLocalConversationService.deleteConversation(id, clearMessage)
    }

    runInAction(() => {
      this.conversations = this.conversations.filter((conv) => conv.conversationId !== id)
      this.recalculateSummary()
    })
  }

  // 清除未读消息
  clearUnread = async (conversationId: string) => {
    if (nimStore.nim) {
      await nimStore.nim.V2NIMLocalConversationService.clearUnreadCountByIds([conversationId])
    }

    runInAction(() => {
      const conversation = this.conversations.find((c) => c.conversationId === conversationId)
      if (conversation) {
        conversation.unreadCount = 0
      }

      this.recalculateSummary()
    })
  }

  getConversation(conversationId: string) {
    return this.conversations.find((item) => item.conversationId === conversationId) || null
  }

  search(keyword: string) {
    const normalizedKeyword = keyword.trim().toLowerCase()

    if (!normalizedKeyword) {
      return this.conversations
    }

    return this.conversations.filter((item) => {
      const name = (item.name || '').toLowerCase()
      const target = (item.conversationId || '').toLowerCase()
      const messageText = (item.lastMessage?.text || '').toLowerCase()
      return (
        name.includes(normalizedKeyword) ||
        target.includes(normalizedKeyword) ||
        messageText.includes(normalizedKeyword)
      )
    })
  }
}

export const conversationStore = new ConversationStore()
