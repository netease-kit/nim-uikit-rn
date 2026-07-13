## Why

数字人会话当前沿用了普通 P2P 会话的在线状态展示逻辑，导致会话列表页和聊天详情页会展示“在线/离线”状态，但该状态对数字人会话不适用。

## What Changes

- 数字人会话在会话列表页不再展示在线状态。
- 数字人单聊在聊天详情页头部不再展示在线/离线状态。
- 数字人会话不再参与对应的在线状态订阅列表。

## Capabilities

### Modified Capabilities

- `conversation-list`: 数字人会话不展示在线状态。
- `chat-detail`: 数字人单聊头部不展示在线状态。

## Impact

- Affected code: `app/(tabs)/index.tsx`, `app/chat/[id].tsx`, `src/NEUIKit/rn/identity.ts`
- Affected behavior: AI conversation status display in RN
- No API, dependency, or backend impact.
