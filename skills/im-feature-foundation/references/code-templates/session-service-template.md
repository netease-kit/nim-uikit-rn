# Session Service Template

```ts
export type SessionSummary = {
  sessionId: string
  title: string
  avatar?: string
  unreadCount: number
  updatedAt: number
  muted?: boolean
  stickTop?: boolean
  lastMessageText?: string
}

export class SessionService {
  async listSessions(): Promise<SessionSummary[]> {
    // TODO: query session list from SDK or backend
    return []
  }

  async clearUnread(sessionId: string): Promise<void> {
    // TODO: clear unread count
  }

  async toggleStickTop(sessionId: string, value: boolean): Promise<void> {
    // TODO: update stick-top state
  }

  async toggleMute(sessionId: string, value: boolean): Promise<void> {
    // TODO: update mute state
  }
}
```

## 要点

- service 只处理会话能力，不承担页面排序和展示逻辑
- 页面展示转换优先放 store 或 selector
