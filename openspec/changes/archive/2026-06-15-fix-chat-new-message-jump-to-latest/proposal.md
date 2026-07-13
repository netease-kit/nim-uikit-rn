## Why

RN Android 聊天页在浏览历史消息时收到新消息，点击 `x条新消息` 提示后有概率只把提示切换成快速到底图标，但时间线仍停留在历史位置，破坏了返回最新消息的交互闭环。

## What Changes

- 修复聊天页点击新消息提示后未稳定回到最新消息位置的问题。
- 在提示点击触发最新消息揭示和列表重排时，补充可靠的回底部对齐策略，避免 Android 倒序列表被可见内容锚点抵消滚动。

## Capabilities

### New Capabilities

### Modified Capabilities

- `chat-timeline-and-history`: 明确点击新消息提示后必须稳定回到最新消息位置，即使点击过程伴随最新消息重新插入时间线和提示态切换。

## Impact

- 受影响代码：`app/chat/[id].tsx`
- 受影响行为：聊天页历史浏览中的新消息提示点击返回最新消息
