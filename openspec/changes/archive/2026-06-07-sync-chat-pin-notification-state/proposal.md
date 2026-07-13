## Why

聊天详情页已经监听 SDK 的消息标记通知，但收到其他端标记或取消标记后，当前可见消息气泡可能不刷新标记状态。根因是标记数据按单一 `messageClientId || messageServerId` 存储和读取，而跨端通知与当前本地消息可能分别命中 serverId/clientId，导致气泡查询不到已更新的标记信息。

## What Changes

- 标记消息状态按消息 refer 的 clientId 和 serverId 双 key 兼容存储、删除和查询。
- 聊天详情页收到标记通知后，即使当前消息列表已存在该消息，也替换对应消息对象以触发可见气泡刷新。
- 标记列表继续基于去重后的标记数据展示，避免双 key 造成重复条目。

## Capabilities

### Modified Capabilities

- `chat-message-actions-and-receipts`: 补齐聊天详情页实时同步他人标记/取消标记消息状态的要求。

## Impact

- 受影响代码：`stores/MessageStore.ts`、`src/NEUIKit/rn/chat-message-bubble.tsx`
- 受影响行为：同一聊天详情页中，其他用户标记或取消标记消息后的实时标记状态展示
