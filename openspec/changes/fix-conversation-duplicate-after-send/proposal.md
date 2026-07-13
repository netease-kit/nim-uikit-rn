## Why

会话详情页发送消息后立即返回会话列表时，列表会短暂出现一个额外的空白会话项，下拉刷新后才消失。这个问题会直接破坏会话列表的稳定性，也说明本地消息发送态和会话预览同步之间存在错误的临时数据写入。

## What Changes

- 修复聊天页发送消息后的本地会话预览同步，避免生成没有有效会话身份的额外会话项。
- 保证从聊天页返回会话列表时，同一会话只显示一次，不依赖手动下拉刷新恢复正确状态。
- 为该回归补充规范约束，明确发送成功后的会话列表不得出现瞬时重复会话。

## Capabilities

### New Capabilities

### Modified Capabilities

- `conversation-list-behavior`: 补充发送消息后返回列表时的去重与稳定展示要求。

## Impact

- 受影响代码：`stores/MessageStore.ts`、可能涉及 `stores/ConversationStore.ts`
- 受影响行为：聊天页发送消息后的本地会话列表预览同步
- 无新增依赖，无外部 API 变更
