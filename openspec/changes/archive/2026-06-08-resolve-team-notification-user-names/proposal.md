## Why

群邀请通知文本依赖本地已有用户/群成员资料同步生成。B 与被邀请成员 C 不是好友，也不在其他共同群时，B 本地没有 C 的用户资料，A 邀请 C 入群的通知会把 C 显示为 accid。

## What Changes

- 从群通知消息中提取操作者和目标成员账号。
- 在聊天页和通知气泡渲染时预取这些账号的用户资料。
- 保持通知文本格式和会话列表通知预览不变。

## Capabilities

### Modified Capabilities

- `team-conversation-notifications`: 群通知里被邀请成员即使不是好友/共同群成员，也需要显示昵称。

## Impact

- Affected code: `app/chat/[id].tsx`, `src/NEUIKit/rn/chat-message-bubble.tsx`, `utils/teamNotification.ts`
- Affected behavior: team invite notification display in chat detail
- No API, dependency, or backend impact.
