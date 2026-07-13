## Why

聊天页进入消息多选模式后，多选框在自己发送的消息上没有固定贴在屏幕最左侧，导致左右消息的选择控件位置不一致。

## What Changes

- 将聊天页多选框固定到消息行最左侧。
- 为多选态底部工具栏补齐安全区底部预留。

## Capabilities

### Modified Capabilities

- `chat-detail`: 消息多选模式下的选择控件和底部操作栏布局需要统一对齐屏幕安全区。

## Impact

- Affected code: `src/NEUIKit/rn/chat-message-bubble.tsx`, `app/chat/[id].tsx`
- Affected behavior: chat multi-select layout
- No API, dependency, or backend impact.
