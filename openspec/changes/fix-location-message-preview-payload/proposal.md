## Why

当前 RN 发送的位置消息在 RN 自己的会话列表中可以正常显示，但 Android 原生会话列表预览直接读取 `lastMessage.text` 作为位置标题。现有 RN 发送链路只创建了位置附件地址，没有补齐位置标题到 `message.text`，导致 Android 侧显示为 `[位置消息]null`。

## What Changes

- 对齐 RN 位置消息发送 payload 与 Android/iOS UIKit 参考实现。
- 发送位置消息时保留附件地址字段，并显式写入位置标题到 `message.text`。
- 对齐位置消息重发逻辑，避免重发后再次丢失标题字段。

## Capabilities

### Modified Capabilities

- `chat-location-messages`: 细化 RN 位置消息发送 payload 对跨端会话列表预览的一致性要求。

## Impact

- 受影响代码：`stores/MessageStore.ts`
- 受影响行为：RN 发送的位置消息在 Android 原生会话列表、RN 会话列表、详情页和重发链路中的标题展示一致性
