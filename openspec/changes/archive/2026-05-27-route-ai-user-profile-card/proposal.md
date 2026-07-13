## Why

RN 当前在聊天消息头像点击和数字人单聊设置页“查看好友名片”入口上，仍然复用了普通好友名片页，导致数字人跳转页面样式和功能与 Android 端不一致。

## What Changes

- 为 RN 增加独立的数字人名片页路由。
- 数字人聊天消息头像点击时，跳转到数字人名片页。
- 数字人单聊设置页点击“查看好友名片”时，跳转到数字人名片页。
- 我的数字人列表点击数字人时，跳转到数字人名片页，而不是直接进入聊天页。
- 账号名片跳转前增加数字人路由判断，避免数字人误跳普通好友名片。
- 数字人名片页仅保留顶部身份信息和去聊天入口，不展示额外资料项。
- 陌生人名片页不展示“陌生人名片”标题、备注名和加入黑名单入口。
- 数字人名片页不展示页面标题文案。

## Capabilities

### Modified Capabilities

- `chat-detail`: 数字人头像点击应跳转数字人名片页。
- `p2p-settings`: 数字人单聊设置页查看名片应跳转数字人名片页。
- `ai-user-list`: 我的数字人列表点击数字人应跳转数字人名片页。
- `ai-conversation`: RN 提供专用数字人名片页展示。

## Impact

- Affected code: `app/contacts/ai-users.tsx`, `app/friend/ai-card.tsx`, `app/session/p2p-settings.tsx`, `src/NEUIKit/rn/chat-message-bubble.tsx`, `src/NEUIKit/rn/identity.ts`
- Affected behavior: AI user profile navigation in RN
- No API, dependency, or backend impact.
