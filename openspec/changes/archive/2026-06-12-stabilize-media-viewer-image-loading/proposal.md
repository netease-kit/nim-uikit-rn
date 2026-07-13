## Why

当前聊天图片详情页存在高概率黑屏、长时间停留在加载中，以及同一张已经展示过的图片再次进入仍重复出现 loading 的问题，影响图片详情的基本可用性。

## What Changes

- 稳定 RN 媒体查看器中的图片详情渲染，避免首次进入或左右滑动时出现黑屏。
- 让图片详情页对已加载过的图片优先复用缓存结果，避免每次重新进入都重复显示 loading 覆盖层。
- 保持现有图片左右翻页、缩放、关闭和保存能力不变。

## Capabilities

### Modified Capabilities

- `chat-detail`: 聊天图片详情页需要稳定展示图片内容，并减少已加载图片的重复 loading。

## Impact

- Affected code: `app/chat/media-viewer.tsx`
- Affected behavior: image rendering and loading feedback in RN media viewer
- No API, dependency, or backend impact.
