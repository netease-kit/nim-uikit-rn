# React Router Web Pack

适用于：
- React Web
- React Router
- H5 / Web 项目

## 推荐首批文件

```text
src/pages/LoginPage.tsx
src/pages/ConversationsPage.tsx
src/pages/ChatPage.tsx
src/routes/index.tsx
src/stores/AuthStore.ts
src/stores/SessionStore.ts
src/stores/MessageStore.ts
src/services/AuthService.ts
src/services/SessionService.ts
src/services/MessageService.ts
src/utils/storage.ts
src/utils/network.ts
src/constants/config.ts
```

## 推荐路由关系

- `/login`
- `/conversations`
- `/chat/:sessionId`

## 适配重点

- 登录态恢复要考虑浏览器刷新
- 会话和聊天页要考虑宽屏布局
- 文件下载、预览、通知权限遵循浏览器能力

## 首批模板组合

- `auth-service-template.md`
- `session-service-template.md`
- `message-service-template.md`
- `auth-store-template.md`
- `session-store-template.md`
- `message-store-template.md`

页面模板可按 React Router 改写：
- `LoginPage`
- `ConversationsPage`
- `ChatPage`

## 最少验证

- 浏览器直达 `/login` 正常
- 登录成功跳转 `/conversations`
- 点击会话进入 `/chat/:sessionId`
- 刷新后登录态和当前路由恢复策略明确
