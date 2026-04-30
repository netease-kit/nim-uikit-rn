# Message Store Template

```ts
import { makeAutoObservable, runInAction } from 'mobx'

import { MessageEntity, MessageService } from '@/services/MessageService'

type MessageState = {
  list: MessageEntity[]
  isSync: boolean
  isLoading: boolean
}

export class MessageStore {
  messagesMap: Record<string, MessageState> = {}

  constructor(private messageService: MessageService) {
    makeAutoObservable(this, {}, { autoBind: true })
  }

  getConversationState(sessionId: string): MessageState {
    if (!this.messagesMap[sessionId]) {
      this.messagesMap[sessionId] = {
        list: [],
        isSync: false,
        isLoading: false
      }
    }

    return this.messagesMap[sessionId]
  }

  async loadHistory(sessionId: string) {
    const state = this.getConversationState(sessionId)
    state.isLoading = true

    try {
      const list = await this.messageService.listHistory(sessionId)
      runInAction(() => {
        state.list = list
        state.isSync = true
      })
    } finally {
      runInAction(() => {
        state.isLoading = false
      })
    }
  }

  async sendText(sessionId: string, text: string) {
    const state = this.getConversationState(sessionId)
    const pending: MessageEntity = {
      messageId: '',
      clientId: `local-${Date.now()}`,
      sessionId,
      senderId: 'self',
      type: 'text',
      text,
      createdAt: Date.now(),
      status: 'sending'
    }

    runInAction(() => {
      state.list.push(pending)
    })

    try {
      const result = await this.messageService.sendText(sessionId, text)
      runInAction(() => {
        state.list = state.list.map((item) => (item.clientId === pending.clientId ? result : item))
      })
    } catch {
      runInAction(() => {
        pending.status = 'failed'
      })
      throw new Error('Send failed')
    }
  }
}
```

## 要点

- 本地发送态要先入列表
- 成功后替换，失败后可重试
