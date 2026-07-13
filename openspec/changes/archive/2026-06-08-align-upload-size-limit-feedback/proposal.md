# Proposal

## Why

RN Android 发送超大文件时可能进入 SDK 上传失败路径，聊天气泡只显示失败感叹号，没有像 Android/iOS 原生端一样在发送前提示具体的文件大小限制。

## What Changes

- 对齐 Android/iOS 原生端：图片、视频、文件在发送前统一执行 200M 大小校验。
- 当文件大小超限时显示 `当前文件大小超出200M发送限制，请重新选择` 并中断发送。
- 对 picker 未直接返回大小的资源，使用本地文件信息兜底读取大小，避免超大文件进入上传失败态。

## Capabilities

### Modified Capabilities

- `chat-send-failure-feedback`: 超大附件发送前校验与提示。
- `chat-composer-actions`: 聊天页图片、拍摄、文件入口发送行为。

## Impact

- Affected code: `app/chat/[id].tsx`, `utils/app-language.ts`
- Affected behavior: chat image/video/file pre-send validation and oversized attachment feedback
- No SDK API, backend, message schema, or stored message migration impact.
