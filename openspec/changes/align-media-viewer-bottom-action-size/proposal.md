## Why

当前 RN 图片/视频查看器底部操作按钮尺寸过大，且在白色图片/视频内容上缺少足够对比度，和 Android 端底部图标按钮视觉不一致。

## What Changes

- 收小 RN 图片/视频查看器底部操作按钮尺寸。
- 对齐 Android 端底部操作区的图标级尺寸、间距和深色圆底可见性表现。

## Capabilities

### Modified Capabilities

- `chat-detail`: 图片/视频查看器底部操作按钮尺寸和可见性需要与 Android 端保持一致级别。

## Impact

- Affected code: `app/chat/media-viewer.tsx`
- Affected behavior: image/video viewer bottom action sizing and visibility in RN
- No API, dependency, or backend impact.
