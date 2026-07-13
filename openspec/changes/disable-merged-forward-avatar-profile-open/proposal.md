## Why

合并转发详情页展示的是转发记录中的历史消息快照，点击其中的发送者头像不应进入当前用户关系下的名片页。当前复用聊天消息气泡后，头像点击仍会触发名片导航，与预期交互不一致。

## What Changes

- 合并转发详情页中的消息发送者头像仅用于身份展示，不再响应点击打开名片。
- 保留合并转发详情页中消息内容点击打开图片、视频、文件、位置或嵌套聊天记录的能力。
- 保留普通聊天页、收藏、标记等其他消息列表中的头像点击名片能力。

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `chat-forwarding-and-selection`: 合并转发详情页的发送者头像交互。

## Impact

- Affected code: `app/chat/merged-forward-detail.tsx`, `src/NEUIKit/rn/chat-message-bubble.tsx`
- Affected behavior: merged-forward detail sender avatar press handling
- No API, SDK, storage, dependency, or message payload impact.
