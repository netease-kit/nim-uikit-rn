## Why

会话列表曾修复过“后续普通消息撤回后仍保留较早未读 @ 提醒”的问题，但当前未读 @ 判断仍按消息数组最后 N 条截取。普通消息撤回后本地列表会保留撤回占位，可能把较早的未读 @ 消息挤出判断窗口，导致 `[有人@我]` 消失。

## What Changes

- 会话列表未读 @ 判断改为按“未撤回、非自己发送的未读消息窗口”计算。
- 本地会话 store 的 `aitMsgs` 同步与额外 mention 状态使用同一未读窗口。
- 保持已撤回的 @ 消息不再显示 `[有人@我]` 的既有行为。

## Capabilities

### Modified Capabilities

- `conversation-list-behavior`: 会话预览的 @ 提醒在后续普通消息撤回后仍需保留，只要未读范围内仍存在未撤回的 @ 本人消息。

## Impact

- Affected code: `stores/ConversationStore.ts`, `app/(tabs)/index.tsx`
- Affected behavior: conversation list mention badge/prefix calculation
- No API, dependency, backend, or SDK initialization impact.
