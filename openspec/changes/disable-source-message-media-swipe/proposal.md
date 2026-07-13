## Why

源消息详情页用于查看某一条被引用或定位到的原始消息。当前从该页面打开图片时会进入会话级图片浏览器，用户可以左右滑到同会话的其他图片，这与“只查看源消息”的上下文不一致。

## What Changes

- 源消息详情页打开图片或视频时，为媒体预览入口声明单媒体模式。
- 媒体预览页在单媒体模式下只展示当前消息对应的媒体，不组装会话内其他图片。
- 普通聊天页、合并转发详情、历史记录、收藏等入口的图片横滑浏览能力保持不变。

## Capabilities

### New Capabilities

- `source-message-media-preview`: 约束源消息详情页进入媒体预览时的单媒体查看行为。

### Modified Capabilities

- None.

## Impact

- Affected code: `app/chat/source-message.tsx`, `app/chat/media-viewer.tsx`
- Affected behavior: source-message detail media preview only
- No dependency, SDK, backend, or data-model impact.
