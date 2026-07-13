## Why

会话列表当前只要会话里出现过一次 `@我`，就可能持续显示 `[有人@我]`，即使对应消息已经被读过。这个行为会误导用户，需要把 `@我` 标记严格收敛到“当前未读消息里仍包含 @我”。

## What Changes

- 收紧会话列表 `[有人@我]` 标记规则，只在当前未读消息范围内仍存在 `@我` 时显示。
- 在未读清零、未读扣减或会话同步更新后，同步清理已经不属于未读范围的本地 mention 标记。
- 保持现有打开会话、清未读后立即移除 `[有人@我]` 的交互结果。

## Capabilities

### New Capabilities

### Modified Capabilities

- `conversation-list-behavior`: 补充 `[有人@我]` 仅由未读 `@我` 消息驱动的要求。

## Impact

- 受影响代码：`stores/ConversationStore.ts`、`app/(tabs)/index.tsx`，必要时涉及 `stores/MessageStore.ts`
- 受影响行为：会话列表 `[有人@我]` 标记的展示与清理
- 无新增依赖，无外部 API 变更
