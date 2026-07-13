## Why

当前聊天页顶部反诈提醒只有静态文案，没有 Android/iOS 端已有的“点击举报”入口；同时消息命中反垃圾后的失败提示仍然带有举报按钮。现有本地举报页只是占位表单，也不符合“在应用内内嵌打开真实举报页面”的目标行为。

## What Changes

- 对齐聊天页顶部反诈提醒，补充可点击的举报链接，并在应用内通过内嵌 WebView 打开举报页面。
- 对齐消息反垃圾失败提示，移除其举报按钮。
- 对齐消息反垃圾命中后的错误提示样式，保留纯文字提示而不显示额外背景框。
- 将当前仅用于占位的举报页面替换为实际承载举报 URL 的内嵌浏览页。

## Capabilities

### Modified Capabilities

- `chat-detail`: 细化聊天页顶部反诈提醒的举报入口行为。
- `chat-message-actions-and-receipts`: 调整反垃圾提示的举报行为与错误提示样式，不再从提示气泡进入举报流程。

## Impact

- 受影响代码：`app/chat/[id].tsx`, `src/NEUIKit/rn/chat-message-bubble.tsx`, `app/chat/report.tsx`
- 受影响行为：聊天页顶部反诈提醒、消息反垃圾提示样式、举报入口跳转
