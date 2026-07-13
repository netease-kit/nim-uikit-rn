## Why

当前 RN 聊天图片详情页在部分 Android 真机上仍会出现图片内容被渲染成全黑的问题，影响图片查看的基本可用性，需要补齐 Android 端的稳定预览能力。

## What Changes

- 调整 RN 聊天图片详情页在 Android 上的图片渲染实现，避免有效图片被渲染成全黑内容。
- 保持现有图片左右翻页、缩放、关闭和保存能力不变。
- 限制改动范围在图片详情预览场景，不改变聊天页缩略图和视频查看逻辑。

## Capabilities

### New Capabilities

### Modified Capabilities

- `chat-detail`: 聊天图片详情页需要在 Android 上稳定展示真实图片内容，不能出现图片内容全黑。

## Impact

- Affected code: `app/chat/media-viewer.tsx`
- Affected behavior: Android chat image detail rendering
- No API, dependency, or backend impact.
