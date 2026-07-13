# Code Skeleton Template

用于在全新项目中生成第一批 IM 代码骨架。

## 推荐目录结构

```text
app/
  login.tsx
  conversations/
    index.tsx
    search.tsx
  chat/
    [sessionId].tsx
  contacts/
    index.tsx
  teams/
    index.tsx
    settings.tsx
  settings/
    index.tsx
    notifications.tsx
stores/
  AuthStore.ts
  SessionStore.ts
  MessageStore.ts
  FriendStore.ts
  TeamStore.ts
  PreferenceStore.ts
  index.ts
services/
  AuthService.ts
  SessionService.ts
  MessageService.ts
  FriendService.ts
  TeamService.ts
domain/
  models/
    User.ts
    Session.ts
    Message.ts
    Team.ts
  types/
    Result.ts
    Pagination.ts
utils/
  storage.ts
  network.ts
  time.ts
  message.ts
  permissions.ts
  files.ts
constants/
  config.ts
  featureFlags.ts
```

## 各层首批文件职责

### app/login.tsx

- 登录页
- 表单输入
- 错误提示
- 调用 AuthStore

### app/conversations/index.tsx

- 会话列表页
- 下拉刷新
- 会话点击跳转

### app/chat/[sessionId].tsx

- 聊天详情页
- 消息列表
- 输入框
- 发送按钮

### stores/AuthStore.ts

- 登录态
- 登录恢复
- 登出

### stores/SessionStore.ts

- 会话列表
- 未读数
- 置顶 / 免打扰 / 删除

### stores/MessageStore.ts

- 历史消息
- 发送态
- 失败重试
- 高级消息能力扩展入口

### services/\*

- 屏蔽底层 SDK / API 差异

### domain/models/\*

- 统一领域模型
- 不直接暴露原始接口数据结构到 UI

## 最小生成顺序

1. `domain/models/*`
2. `services/AuthService.ts`、`services/SessionService.ts`、`services/MessageService.ts`
3. `stores/AuthStore.ts`、`stores/SessionStore.ts`、`stores/MessageStore.ts`
4. `app/login.tsx`
5. `app/conversations/index.tsx`
6. `app/chat/[sessionId].tsx`
7. `utils/storage.ts`、`utils/network.ts`
8. `constants/config.ts`

## 标准模块扩展顺序

MVP 之后建议补：

1. `FriendStore.ts` + `contacts/*`
2. `TeamStore.ts` + `teams/*`
3. `PreferenceStore.ts` + `settings/*`
4. 消息高级能力 utils / page

## 代码骨架生成原则

- 每个 store 只负责一类业务域
- 每个 service 只封装一类能力
- 页面先做最小可交互版本
- 高级功能先留扩展点，不要一开始写满

## 可直接复用的首批模板

- `references/code-templates/auth-service-template.md`
- `references/code-templates/session-service-template.md`
- `references/code-templates/message-service-template.md`
- `references/code-templates/auth-store-template.md`
- `references/code-templates/session-store-template.md`
- `references/code-templates/message-store-template.md`
- `references/code-templates/login-page-template.md`
- `references/code-templates/conversations-page-template.md`
- `references/code-templates/chat-page-template.md`

## 最少测试面

- 骨架生成后，三条主链路文件完整存在
- store 与 service 引用关系清晰
- 页面到 store 的调用链路闭环成立
