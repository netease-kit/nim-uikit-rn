## Why

昨天已经为 Android 聊天图片详情页补了稳定预览修复，但当前 RN 媒体查看器在 iOS 上仍保留缩放容器这一额外实现分支。图片详情是核心聊天能力，iOS 需要同步收敛到相同的稳定全屏预览路径，避免继续保留缩放层带来的渲染异常风险。

## What Changes

- 调整 RN 聊天图片详情页在 iOS 上的图片渲染实现，并移除图片详情页的缩放容器。
- 保留现有的左右翻页、关闭和保存能力。
- 将改动范围限制在图片详情预览，不改变聊天缩略图、视频预览和消息收发链路。

## Capabilities

### New Capabilities

### Modified Capabilities

- `chat-detail`: 聊天图片详情页需要在 iOS 上也稳定展示真实图片内容，并移除图片详情页的缩放交互，与 Android 修复后的平台策略保持一致。

## Impact

- Affected code: `app/chat/media-viewer.tsx`
- Affected behavior: iOS chat image detail rendering
- No API, dependency, or backend impact.
