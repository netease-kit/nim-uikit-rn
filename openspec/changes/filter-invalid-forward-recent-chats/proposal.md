## Why

转发选择页“最近聊天”当前会展示已失效会话，例如已删除好友或已退出/解散群聊。用户点击后才得到不可转发提示，列表本身不应展示这些无效目标。

## What Changes

- “最近聊天”会话列表在构造转发目标时过滤无效会话。
- 点对点会话仅保留仍是好友或本人会话的目标。
- 群聊会话仅保留本地仍存在群资料的目标。

## Capabilities

### New Capabilities

### Modified Capabilities

- `chat-forwarding-and-selection`: 转发选择页最近聊天会话有效性过滤。

## Impact

- Affected code: `app/chat/forward.tsx`
- Affected behavior: 转发选择页最近聊天列表展示
- No API or dependency changes.
