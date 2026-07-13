## Why

从聊天设置页进入的标记消息页面用于快速浏览已标记内容。当前标记页复用聊天详情气泡完整渲染，回复消息会展示被引用内容，长文本/表情消息也会撑开卡片，不符合标记列表的预览场景。

## What Changes

- 标记页中的回复消息不展示被引用内容。
- 标记页中的文本和表情消息最多展示 3 行。
- 文本和表情内容超出 3 行时以尾部省略号展示。
- 普通聊天详情页气泡展示不受影响。

## Capabilities

### Modified Capabilities

- `pinned-message-preview-behavior`: 标记消息列表的回复和长文本预览规则。

## Impact

- Affected code: `app/chat/pins.tsx`, `src/NEUIKit/rn/chat-message-bubble.tsx`, `src/NEUIKit/rn/chat.tsx`
- Affected behavior: 标记页面消息预览展示
- No API or dependency changes.
