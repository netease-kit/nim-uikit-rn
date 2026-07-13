## Why

RN 已补齐图片、视频、文件上传过程中的气泡内环形进度，但原生端发送中状态还有气泡前面的消息发送 loading。iOS 在图片、视频、文件发送中都会展示该外侧 loading；Android 图片、视频默认展示，文件消息显式关闭外侧 sending status。RN 需要按平台严格对齐，避免发送中状态少一层原生视觉反馈。

## What Changes

- 图片消息发送中：保留气泡内 loading，并在气泡前显示平台原生规格的外侧发送 loading。
- 视频消息发送中：保留气泡内确定性环形上传进度，并在气泡前显示平台原生规格的外侧发送 loading。
- 文件消息发送中：iOS 显示气泡前 22dp 灰色 activity loading；Android 继续不显示气泡前 loading，只保留文件图标区域内的环形进度。
- 发送成功或失败后外侧 loading 随消息发送状态自动消失。

## Capabilities

### Modified Capabilities

- `chat-message-content`: 附件消息发送中应同时呈现原生平台要求的气泡内进度和气泡前发送 loading。

## Impact

- 受影响代码：`src/NEUIKit/rn/chat-message-bubble.tsx`
- 受影响行为：图片、视频、文件发送中的视觉状态
- 不影响下载态、发送失败重试、已读未读状态和 Android 文件消息的外侧 sending status 关闭行为
