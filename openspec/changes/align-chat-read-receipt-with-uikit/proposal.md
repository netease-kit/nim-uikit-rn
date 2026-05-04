## Why

会话详情页消息的已读未读目前用文字直接显示，这和本地 UIKit/H5 的消息回执实现不一致，也破坏了聊天气泡右下角的视觉基线。需要把 RN 聊天页的消息回执改为和 UIKit 一致的图标与进度表现。

## What Changes

- 将会话详情页消息回执从文字标签改为 UIKit 基线的图标/扇形进度样式。
- 保持单聊与群聊的回执数据来源不变，但统一改成 UIKit 的展示规则。
- 保留群聊未全员已读时进入阅读详情页的交互。

## Capabilities

### New Capabilities

- `chat-message-read-receipt`: 规定会话详情页消息回执的 RN 展示方式需要与 UIKit/H5 基线一致。

### Modified Capabilities

- None.

## Impact

- Affected code: `app/chat/[id].tsx`, `src/NEUIKit/rn/chat.tsx`
- Affected UX: chat detail message read-receipt rendering and team read-detail entry
- No API or dependency changes
