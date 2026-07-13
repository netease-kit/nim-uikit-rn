## Why

iPhone 真机从系统相册选择 HEIC/HEIF 图片发送时，RN 在发送前用本地图片扩展名白名单拦截并 toast `不支持该格式`。原生 iOS IMUIKit 的图片支持列表包含 `heic`，RN 不应在 iOS 相册图片发送入口提前拒绝该格式。

## What Changes

- iOS 图片发送格式校验补齐 HEIC/HEIF/TIFF 支持。
- Android 图片发送格式校验保持现有 jpg/jpeg/png/gif 范围，不扩大 Android 风险面。
- 相册选择和拍照返回的图片 MIME 校验同步按平台使用对应白名单。

## Capabilities

### Modified Capabilities

- `chat-message-content`: iOS 相册 HEIC/HEIF/TIFF 图片应允许作为图片消息发送。

## Impact

- Affected code: `app/chat/[id].tsx`
- Affected behavior: iPhone 真机系统相册选择图片后的发送前格式校验
- No native dependency, backend, or SDK API changes.
