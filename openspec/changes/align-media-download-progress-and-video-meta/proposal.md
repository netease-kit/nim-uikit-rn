## Why

当前 RN 的图片消息、视频消息、文件消息在发送或下载中的提示样式与 Android 端差异较大；视频卡片还额外展示了名称，且时长样式不符合 Android 表现。

## What Changes

- 对齐图片、视频、文件消息的发送/下载中覆盖层样式，参考 Android 端结构进行优化。
- 调整视频消息卡片，不再显示视频名称，仅保留时长角标。
- 调整视频时长展示样式，贴近 Android 端右下角角标样式。

## Capabilities

### Modified Capabilities

- `chat-detail`: 图片、视频、文件消息的进度覆盖层需要与 Android 端视觉结构对齐。
- `chat-detail`: 视频消息卡片信息展示需要与 Android 端一致，只保留时长角标。

## Impact

- Affected code: `src/NEUIKit/rn/chat-message-bubble.tsx`
- Affected behavior: image/video/file message progress and video card meta in RN chat detail
- No API, dependency, or backend impact.
