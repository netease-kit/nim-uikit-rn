## Why

RN 聊天页文件和视频消息在发送过程中复用了进度遮罩里的暂停图标，导致文件类型区域或视频遮罩上显示 `暂停` 语义的图标。发送中状态应该表达上传/发送进行中，而不是暂停。

## What Changes

- 文件消息发送中时，接入 SDK 上传进度回调，在文件图标前的进度区域展示严格对齐 Android 的 20dp 确定性环形进度和中心 pause thumb。
- 视频消息发送中时，接入 SDK 上传进度回调，在视频预览遮罩中展示严格对齐 Android 的 42dp 确定性环形进度和中心 pause thumb。
- 文件和视频消息下载中时，使用下载进度回调展示同规格确定性环形进度；图片消息下载保持原生一致，不在气泡中新增下载环形进度。
- 发送成功后随 `sendingState` 变为成功自动移除 loading。

## Capabilities

### Modified Capabilities

- `chat-message-content`: 附件消息发送中应展示发送 loading，而不是暂停图标。

## Impact

- 受影响代码：`src/NEUIKit/rn/chat-message-bubble.tsx`
- 受影响代码：`app/chat/[id].tsx`、`utils/fileTransfer.ts`
- 受影响行为：文件消息、视频消息发送和下载中的视觉状态
- 不影响图片消息下载态、图片消息发送 loading、发送失败态、附件打开和重发逻辑
