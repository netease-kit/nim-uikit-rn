## Why

聊天页进入设置页、已读未读成员列表，或 App 切到后台时，聊天页组件仍可能保持挂载。当前 RN 仅用 `activeConversationId` 表示正在阅读会话，导致这些不可见状态下收到该会话新消息也会发送已读回执。

## What Changes

- 将聊天页 active 会话状态收窄为“聊天页聚焦且 App 前台 active”。
- 进入聊天设置页、已读未读成员列表或切后台时清除 active 会话，收到新消息不发送已读回执。
- 保持用户真正停留在聊天页前台时，新消息仍会自动发送已读回执。

## Capabilities

### Modified Capabilities

- `chat-message-read-receipt`: 约束主动发送已读回执的页面可见性条件。

## Impact

- Affected code: `app/chat/[id].tsx`, `app/_layout.tsx`
- Affected behavior: incoming-message read receipt sending for active chat
- No API, dependency, or backend impact.
