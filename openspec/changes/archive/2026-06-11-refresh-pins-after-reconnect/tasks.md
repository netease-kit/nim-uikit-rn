## 1. Spec

- [ ] 1.1 为 `chat-message-actions-and-receipts` 增加断网后消息标记补同步场景，覆盖聊天页和标记列表页。

## 2. Implementation

- [ ] 2.1 为 `MessageStore` 增加可复用的按会话批量刷新消息标记状态能力。
- [ ] 2.2 在根布局现有的登录同步、连接恢复和前台恢复链路中触发消息标记补同步。

## 3. Validation

- [ ] 3.1 运行 `npx tsc --noEmit`。
- [ ] 3.2 运行 `npm run lint`。
- [ ] 3.3 运行 `OPENSPEC_TELEMETRY=0 openspec validate refresh-pins-after-reconnect --type change --no-interactive`。
