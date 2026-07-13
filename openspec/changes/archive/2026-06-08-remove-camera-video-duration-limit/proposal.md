## Why

RN Android 摄像入口在录制到 60 秒时自动停止并提示达到上限，录制完成后仍可能进入发送流程并出现上传失败；这与 Android、iOS 原生端只按文件大小限制发送视频的行为不一致。

## What Changes

- 移除 RN 摄像入口对视频录制时长的限制。
- 移除 RN 视频发送前的 iOS 120 秒时长拦截。
- 保留并补齐视频发送前 200MB 文件大小限制，录制视频也在发送前按文件大小校验。
- Android 自定义摄像页不再在 60 秒时自动停止录制，视频时长仅作为消息元数据传递。

## Capabilities

### New Capabilities

### Modified Capabilities

- `chat-composer-actions`: 聊天页拍摄/摄像入口的视频录制与发送限制行为。

## Impact

- Affected code: `app/chat/[id].tsx`, `android/app/src/main/java/com/netease/yunxin/app/im/camera/NIMCameraCaptureActivity.kt`
- Affected behavior: chat composer camera video recording and video send validation
- No backend API, message payload schema, dependency, or route structure impact.
