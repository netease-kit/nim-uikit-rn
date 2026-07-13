## Why

当前 React Native 聊天详情页只会在进入页面时清一次会话未读，新消息在当前会话内到达后不会立即重置该会话未读，导致用户退回会话列表时仍看到红点或未读数量，和“正在阅读当前会话”的实际状态不一致。

## What Changes

- 聊天详情页在当前活跃会话收到新消息后，立即重置该会话未读状态。
- 未读重置逻辑统一走当前启用的会话源，避免本地会话与云会话模式下表现不一致。
- 聊天详情页保留现有已读回执发送逻辑，但不再依赖返回会话列表后再清除未读。

## Capabilities

### New Capabilities

### Modified Capabilities

- `conversation-list-behavior`: 当前打开中的会话在收到新消息后，列表未读状态需要即时归零。
- `chat-timeline-and-history`: 聊天详情页在活跃阅读期间需要同步驱动未读清零，而非仅在首次进入时清理。

## Impact

- 受影响代码：`app/chat/[id].tsx`、`app/_layout.tsx`、`stores/ConversationStore.ts`、`stores/ImStoreV2Bridge.ts`
- 受影响行为：聊天详情页阅读状态、会话列表红点与未读数量展示
- 无新增依赖，无接口协议变更
