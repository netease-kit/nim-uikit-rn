## Why

会话详情页消息气泡两侧的头像当前使用了独立的包裹尺寸和更小的头像大小，和会话列表页的 UIKit 头像展示方式不一致，视觉上会出现错位。这个问题已经在真实页面中可见，需要把聊天页头像对齐到同一套列表页基线。

## What Changes

- 将会话详情页消息气泡中的头像尺寸、包裹宽高和水平间距调整为与会话列表页一致的 UIKit 展示方式。
- 去除聊天页头像外层与列表页不一致的额外占位背景，避免头像在左右消息气泡中出现偏移。

## Capabilities

### New Capabilities

- `chat-message-avatar-alignment`: 规定会话详情页消息头像需要与会话列表页使用一致的 UIKit 头像展示规格。

### Modified Capabilities

- None.

## Impact

- Affected code: `app/chat/[id].tsx`
- Affected UX: chat detail message bubble avatar rendering
- No API, dependency, or store changes
