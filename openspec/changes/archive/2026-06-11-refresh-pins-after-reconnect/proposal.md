## Why

聊天页和标记列表页当前只在实时收到 `onMessagePinNotification` 时更新消息标记状态。用户断网期间如果错过其他端的标记或取消标记操作，恢复联网后页面不会自动补同步，必须退出再进入页面才能看到正确状态。

## What Changes

- 在现有登录同步、连接恢复和前台恢复链路中补充当前已加载会话的消息标记状态刷新。
- 让聊天页在断网期间错过远端标记变更后，恢复联网时无需离开页面即可更新标记状态。
- 让标记列表页在停留期间断网并恢复联网后，无需重新进入页面即可更新列表内容。

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `chat-message-actions-and-receipts`: 增加断网错过消息标记事件后的重连补同步要求，覆盖聊天页和标记列表页。

## Impact

影响 `app/_layout.tsx` 的全局同步事件桥接，以及 `stores/MessageStore.ts` 的消息标记刷新能力。无新增外部依赖，无 API 破坏性变更。
