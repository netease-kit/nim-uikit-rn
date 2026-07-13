# Expo Router RN Pack

适用于：

- React Native
- Expo
- Expo Router

## 推荐首批文件

```text
app/login.tsx
app/(tabs)/conversations.tsx
app/chat/[sessionId].tsx
stores/AuthStore.ts
stores/SessionStore.ts
stores/MessageStore.ts
services/AuthService.ts
services/SessionService.ts
services/MessageService.ts
utils/storage.ts
utils/permissions.ts
utils/network.ts
constants/config.ts
```

## 推荐跳转关系

- 登录成功：`/login` -> `/(tabs)/conversations`
- 点击会话：`/(tabs)/conversations` -> `/chat/[sessionId]`
- 退出登录：主流程 -> `/login`

## 适配重点

- 登录态恢复要结合启动页或根 layout
- 聊天页输入框要考虑键盘避让
- 文件、媒体、通知、权限都要做移动端适配

## 首批模板组合

- `auth-service-template.md`
- `session-service-template.md`
- `message-service-template.md`
- `auth-store-template.md`
- `session-store-template.md`
- `message-store-template.md`
- `login-page-template.md`
- `conversations-page-template.md`
- `chat-page-template.md`

## 最少验证

- `login` 页面可渲染
- 会话页可进入
- 聊天页可根据 `sessionId` 加载
- 登录、会话、聊天三条主链路能串起来
