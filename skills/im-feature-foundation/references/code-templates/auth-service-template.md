# Auth Service Template

```ts
export type LoginPayload = {
  account: string
  credential: string
}

export type AuthSession = {
  userId: string
  token: string
}

export class AuthService {
  async login(payload: LoginPayload): Promise<AuthSession> {
    // TODO: call IM SDK or backend auth API
    throw new Error('Not implemented')
  }

  async logout(): Promise<void> {
    // TODO: clear remote auth state if needed
  }

  async restoreSession(): Promise<AuthSession | null> {
    // TODO: restore local persisted session
    return null
  }
}
```

## 要点

- `login` 只返回统一 session，不把底层 SDK 结果直接暴露给 UI
- `restoreSession` 负责恢复本地会话，不和页面耦合
