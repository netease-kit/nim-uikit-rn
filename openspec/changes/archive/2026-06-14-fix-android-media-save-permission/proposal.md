## Why

Android 真机在未授权相册权限时，从聊天媒体预览页保存图片或视频会调用 `ExpoMediaLibrary.saveToLibraryAsync` 并被原生模块拒绝，错误为 `Missing MEDIA_LIBRARY write permission.`。Android 原生端在 Android Q/API 29 及以上保存媒体时不再先申请旧的外部存储写权限，而是直接通过 `MediaStore` 写入系统相册；RN 侧需要对齐该策略，避免 Android 13+ 和 Android 15 设备保存失败。

## What Changes

- 新增 RN Android 原生保存模块，使用 `MediaStore.Images` 或 `MediaStore.Video` 插入系统媒体库并复制本地文件内容。
- 聊天媒体预览页在 Android 上使用该原生保存模块保存图片和视频。
- 保持 iOS 保存逻辑不变。
- 保留现有保存成功和失败文案，不新增用户可见流程。

## Capabilities

### New Capabilities

### Modified Capabilities

- `chat-media-save`: Android 聊天媒体保存应对齐原生端 MediaStore 策略，Android Q 及以上不依赖旧写存储权限。

## Impact

- Affected code: `app/chat/media-viewer.tsx`, `utils/native-media-library-saver.ts`, `android/app/src/main/java/com/netease/yunxin/app/im/media/*`, `android/app/src/main/java/com/netease/yunxin/app/im/MainApplication.kt`
- Affected behavior: Android 聊天图片和视频保存到系统相册
- No API or dependency changes.
