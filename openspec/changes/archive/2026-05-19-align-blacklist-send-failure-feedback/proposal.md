## Why

当前聊天发送失败会弹出“发送失败/重发失败”弹窗，但消息本身通常已经被标记为失败，部分错误还会追加对应 tips，造成重复反馈，也与期望的消息内联失败反馈不一致。需要改为统一保留消息失败态和 tips 提示，不再弹出额外发送失败弹窗。

## What Changes

- 调整聊天场景下的发送失败反馈。
- 发送失败时保留失败消息状态与已有 tips 消息。
- 移除聊天页和位置发送页的发送失败、重发失败弹窗。

## Capabilities

### New Capabilities

- `chat-inline-send-failure-feedback`: 定义聊天发送失败的内联反馈规则

### Modified Capabilities

- `chat-send-failure-feedback`: 更新聊天发送失败时的反馈要求

## Impact

- 影响 `stores/MessageStore.ts` 的发送失败反馈判断能力。
- 影响 `app/chat/[id].tsx` 与 `app/chat/location-picker.tsx` 中消息发送失败后的反馈逻辑。
- 不改变失败消息状态、失败重发入口或 tips 消息追加逻辑。
