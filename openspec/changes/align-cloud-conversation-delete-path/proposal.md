## Why

当前仓库已经开启 `enableV2CloudConversation: true`，但会话列表页执行置顶、清未读、删除时仍优先选择 `localConversationStore`。这会让 `0284-删除会话` 在云会话模式下落到本地删除语义，无法满足“重装/重登后仍不出现，并按新消息重新出现”的预期。

## What Changes

- 会话列表页在云会话模式下优先选择 `conversationStore` 执行会话操作。
- 仅在未启用云会话或云会话仓库不可用时，回退到 `localConversationStore`。

## Capabilities

### Modified Capabilities

- `conversation-list`: 补充会话操作在云会话模式下的 store 选择要求。

## Impact

- 受影响代码：`app/(tabs)/index.tsx`
- 受影响行为：会话删除、置顶、清未读在云会话模式下的执行路径
- 无新增依赖，无接口协议变更
