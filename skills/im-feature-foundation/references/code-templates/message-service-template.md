# Message Service Template

```ts
export type MessageEntity = {
  messageId: string
  clientId: string
  sessionId: string
  senderId: string
  type: 'text' | 'image' | 'file'
  text?: string
  createdAt: number
  status: 'sending' | 'sent' | 'failed' | 'revoked'
}

export class MessageService {
  async listHistory(sessionId: string): Promise<MessageEntity[]> {
    // TODO: query history messages
    return []
  }

  async sendText(sessionId: string, text: string): Promise<MessageEntity> {
    // TODO: send text message
    throw new Error('Not implemented')
  }

  async retrySend(message: MessageEntity): Promise<MessageEntity> {
    // TODO: retry failed message
    throw new Error('Not implemented')
  }
}
```

## 要点

- 返回统一领域消息模型
- 失败重试能力要从一开始预留
