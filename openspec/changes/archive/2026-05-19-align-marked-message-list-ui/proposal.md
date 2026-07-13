## Why

当前聊天设置页进入的标记消息列表仍沿用“消息气泡 + 操作按钮条”的过渡实现，和本地 Figma 标记页视觉稿不一致，也没有把常用操作收敛到参考图中的三点菜单里。

## What Changes

- 将聊天设置页进入的标记消息列表重构为参考稿样式的卡片列表
- 调整标记列表卡片的头像、昵称、时间、正文预览和留白层级，对齐本地 Figma 视觉稿
- 将标记消息操作收敛到卡片右上角的更多菜单，提供取消标记、复制、转发能力

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `chat-timeline-and-history`: tighten the pinned-message page layout and action-sheet behavior to match the settings-entry design reference

## Impact

- `app/chat/pins.tsx`
- `app/session/p2p-settings.tsx`
- `app/team/settings.tsx`
- `src/NEUIKit/rn/components.tsx`
- `openspec/specs/chat-timeline-and-history/spec.md`
