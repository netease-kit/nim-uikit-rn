## Why

RN 聊天设置页切换会话免打扰后，会话列表的免打扰标识依赖当前激活的会话数据源刷新。现有实现只稳定刷新本地 `conversationStore`，当列表实际展示的是 `imStoreV2Bridge` 会话数据时，列表页可能继续显示旧的 `mute` 状态，导致返回列表后看不到免打扰标识。

## What Changes

- 为 RN 会话层补充统一的“按当前激活数据源刷新会话列表”能力。
- 调整聊天设置页及相关入口的免打扰切换逻辑，确保切换成功后刷新当前实际使用的会话数据源。
- 调整全局免打扰变更事件处理，确保单聊和群聊免打扰状态变化后，会话列表展示及时同步。

## Capabilities

### Modified Capabilities

- `conversation-list`: 会话列表在免打扰状态变更后需要及时显示或移除免打扰标识。
- `session-settings`: 单聊/群聊设置页切换消息提醒后，返回会话列表时状态需要与设置结果一致。

## Impact

- 受影响代码：`stores/ImStoreV2Bridge.ts`、`stores/ConversationStore.ts`、`app/_layout.tsx`、`app/session/p2p-settings.tsx`、`app/team/settings.tsx`、`app/friend/friend-card.tsx`
- 受影响行为：会话免打扰状态展示同步
- 无新增依赖，无协议变更
