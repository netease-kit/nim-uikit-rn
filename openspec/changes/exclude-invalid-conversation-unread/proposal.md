## Why

当前会话列表会过滤一部分无效会话，同时对免打扰会话不展示普通未读提醒，但底部消息 tab 红点统计没有完全复用同一套可见提醒条件，导致列表中已看不到可感知未读时，tab 仍可能显示红点。

## What Changes

- 统一无效会话的排除判定。
- 在底部消息 tab 红点统计时，同步剔除被列表过滤掉的无效会话。
- 在底部消息 tab 红点统计时，不再将免打扰会话计入可见提醒数。

## Capabilities

### Modified Capabilities

- `conversation-list`: 补充无效会话与免打扰会话对底部消息 tab 红点统计的排除要求。

## Impact

- 受影响代码：`stores/ImStoreV2Bridge.ts`, `stores/ConversationStore.ts`, `app/(tabs)/_layout.tsx`
- 受影响行为：底部消息 tab 红点与会话列表可见未读状态的一致性
