# Session Store Template

```ts
import { makeAutoObservable, runInAction } from 'mobx'

import { SessionService, SessionSummary } from '@/services/SessionService'

export class SessionStore {
  sessions: SessionSummary[] = []
  isLoading = false

  constructor(private sessionService: SessionService) {
    makeAutoObservable(this, {}, { autoBind: true })
  }

  async refresh() {
    runInAction(() => {
      this.isLoading = true
    })

    try {
      const sessions = await this.sessionService.listSessions()
      runInAction(() => {
        this.sessions = sessions
          .slice()
          .sort((a, b) => Number(!!b.stickTop) - Number(!!a.stickTop) || b.updatedAt - a.updatedAt)
      })
    } finally {
      runInAction(() => {
        this.isLoading = false
      })
    }
  }

  async clearUnread(sessionId: string) {
    await this.sessionService.clearUnread(sessionId)
    runInAction(() => {
      const target = this.sessions.find((item) => item.sessionId === sessionId)
      if (target) target.unreadCount = 0
    })
  }
}
```

## 要点

- store 处理排序、未读聚合、展示态同步
- service 只提供原子能力
