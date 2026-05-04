# Auth Store Template

```ts
import { makeAutoObservable, runInAction } from 'mobx'

import { AuthService, AuthSession } from '@/services/AuthService'

export class AuthStore {
  session: AuthSession | null = null
  isReady = false
  isLoggingIn = false

  constructor(private authService: AuthService) {
    makeAutoObservable(this, {}, { autoBind: true })
  }

  get isAuthenticated() {
    return !!this.session
  }

  async bootstrap() {
    const session = await this.authService.restoreSession()
    runInAction(() => {
      this.session = session
      this.isReady = true
    })
  }

  async login(account: string, credential: string) {
    runInAction(() => {
      this.isLoggingIn = true
    })

    try {
      const session = await this.authService.login({ account, credential })
      runInAction(() => {
        this.session = session
      })
    } finally {
      runInAction(() => {
        this.isLoggingIn = false
      })
    }
  }

  async logout() {
    await this.authService.logout()
    runInAction(() => {
      this.session = null
    })
  }
}
```

## 要点

- store 负责编排，不写底层鉴权细节
- `bootstrap` 是登录态恢复入口
