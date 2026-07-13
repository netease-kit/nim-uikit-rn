## Why

聊天页进入多选模式后，部分消息子区域仍会触发跳转、打开详情或链接等原始交互，和多选模式下“仅消息气泡主体可切换选中态，其他点击均无反应”的预期不一致。

## What Changes

- 收紧聊天页多选模式下的消息点击行为
- 保留消息气泡主体点击的选中/取消选中能力
- 禁用多选模式下头像、回复引用、失败图标、链接、好友验证入口、回执区域等非气泡主体交互

## Capabilities

### New Capabilities

无

### Modified Capabilities

- `chat-forwarding-and-selection`: 补充聊天页多选模式下消息点击区域的交互约束

## Impact

- `src/NEUIKit/rn/chat-message-bubble.tsx`
- `src/NEUIKit/rn/chat.tsx`
