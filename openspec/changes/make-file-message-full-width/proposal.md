## Why

当前 RN 聊天页的文件消息宽度被固定最小值和最大值约束，无法占满当前消息可用宽度，和期望表现不一致。

## What Changes

- 将 RN 文件消息卡片宽度调整为占满当前消息可用宽度。
- 保持文件消息现有的边框、图标和文本排版不变。

## Capabilities

### Modified Capabilities

- `chat-detail`: 文件消息卡片宽度需要按消息区域可用宽度全宽展示。

## Impact

- Affected code: `src/NEUIKit/rn/chat-message-bubble.tsx`
- Affected behavior: file message layout width in RN chat detail
- No API, dependency, or backend impact.
