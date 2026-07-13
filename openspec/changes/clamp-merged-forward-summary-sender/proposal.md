## Why

合并转发消息卡片摘要中，发送者昵称过长时会挤占正文内容，影响摘要可读性。摘要行需要限制昵称宽度并在超出时省略，正文仍保留原有摘要行数预算。

## What Changes

- 合并转发消息卡片摘要行将发送者昵称与正文内容分开渲染。
- 摘要中的昵称最多占摘要行可用宽度的 40%。
- 摘要中的昵称最多显示一行，超出显示省略号。

## Capabilities

### New Capabilities

### Modified Capabilities

- `chat-message-content`: 合并转发消息卡片摘要发送者昵称宽度和省略规则。

## Impact

- Affected code: `src/NEUIKit/rn/chat-message-bubble.tsx`
- Affected behavior: 聊天页合并转发消息卡片摘要展示
- No API or dependency changes.
