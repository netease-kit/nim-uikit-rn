## Why

当前仓库 `constants/NIMConfig.ts` 已启用 `enableV2CloudConversation: true`，但 React Native 桥接层读取会话列表和总未读时仍优先使用 `localConversationStore`。这会导致云端会话模式下的删除、置顶和未读语义偏离测试预期，尤其影响 `0284-删除会话`、`0285-删除置顶会话`、`0287-无网络删除会话` 等用例。

## What Changes

- 当 RootStore 开启云端会话时，RN 桥接层优先使用 `conversationStore` 读取会话列表与总未读。
- 仅在未开启云端会话时，继续回退到 `localConversationStore`。

## Capabilities

### New Capabilities

### Modified Capabilities

- `conversation-list`: 补充云端会话模式下的 store 选择要求。

## Impact

- 受影响代码：`stores/ImStoreV2Bridge.ts`
- 受影响行为：云端会话模式下的会话列表数据源、总未读和删除/置顶语义
- 无新增依赖，无接口协议变更
