# Code Templates

这些模板用于把 `im-feature-foundation` 从“会规划”推进到“能直接起步”。

优先使用顺序：

1. service 模板
2. store 模板
3. page 模板

推荐首批文件：

- `auth-service-template.md`
- `session-service-template.md`
- `message-service-template.md`
- `auth-store-template.md`
- `session-store-template.md`
- `message-store-template.md`
- `login-page-template.md`
- `conversations-page-template.md`
- `chat-page-template.md`
- `expo-router-rn-pack.md`
- `react-router-web-pack.md`

使用原则：

- 先复制模板结构，再按项目实际 SDK / API 适配
- 先保证链路闭环，再补高级功能
- 不要在页面里直接写底层 SDK 调用

## 技术栈起步包

- `expo-router-rn-pack.md`
  适合 React Native + Expo + Expo Router
- `react-router-web-pack.md`
  适合 React Web + React Router
