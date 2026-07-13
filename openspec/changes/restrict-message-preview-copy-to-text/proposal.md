## Why

聊天长按菜单和标记页菜单已经只对文本消息提供复制入口。消息预览页仍按 `message.text || content` 判断复制能力，可能让非文本消息预览也出现复制按钮，导致不同入口的复制规则不一致。

## What Changes

- 消息预览页对真实 IM 消息仅在消息类型为文本时显示复制入口。
- 原始地址预览这类没有真实 IM 消息、由路由 `content` 提供的内容仍可复制。

## Capabilities

### Modified Capabilities

- `message-preview-entry-behavior`: 消息预览页复制入口规则。

## Impact

- Affected code: `app/chat/message-preview.tsx`
- Affected behavior: 消息预览页复制按钮显示条件
- No API or dependency changes.
