## Why

转发选择页“最近转发”会话项当前间距偏大、头像偏大，导致常见手机宽度下一行无法正好展示 5 个会话，横向空间利用不足。

## What Changes

- “最近转发”会话项按屏幕宽度动态计算单项宽度。
- 最近转发区域一行以 5 个会话为布局目标。
- 最近转发头像适当缩小，减少项间距。

## Capabilities

### New Capabilities

### Modified Capabilities

- `chat-forwarding-and-selection`: 转发选择页最近转发会话布局密度。

## Impact

- Affected code: `app/chat/forward.tsx`
- Affected behavior: 转发选择页最近转发横向会话列表展示
- No API or dependency changes.
