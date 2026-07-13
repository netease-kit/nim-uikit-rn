## Why

RN Android/iOS 会话列表删除会话后，RN 会把 conversationId 记录到本地隐藏集合以避免 SDK 刷新立即把已删行加回来。但后续该会话收到新消息时，隐藏集合没有解除，导致新消息也不能让会话重新显示。

## What Changes

- 收到新消息时，恢复对应的普通本地隐藏会话。
- 保留无效群、退群、解散等团队会话排除逻辑，不因为普通消息刷新而恢复不可进入的团队会话。

## Capabilities

### New Capabilities

### Modified Capabilities

- `conversation-list-behavior`: 删除会话后收到新消息必须重新显示会话。

## Impact

- 受影响代码：`stores/ConversationStore.ts`、`app/_layout.tsx`
- 受影响行为：Android/iOS 删除会话后的新消息恢复展示
- 无新增依赖，无接口协议变更
