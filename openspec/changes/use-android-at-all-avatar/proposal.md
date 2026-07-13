## Why

聊天页输入 `@` 后的“选择提醒的人”弹窗中，“所有人”候选头像需要与 Android 端默认 @ 选择弹窗一致。Android 默认样式使用 `ic_team_all` 的 42dp 蓝色圆形双人头像，RN 侧需要复用同款视觉，保持跨端一致。

## What Changes

- 从 Android 端 `ic_team_all.xml` 生成 RN 静态头像资源。
- 注册 RN UIKit 图标资源 `icon-team-all-avatar`。
- 聊天页 @ 选择弹窗中“所有人”候选使用 Android 默认样式同款头像。

## Capabilities

### New Capabilities

### Modified Capabilities

- `chat-message-content`: @ 选择弹窗中“所有人”候选头像跨端一致展示。

## Impact

- Affected code: `app/chat/[id].tsx`, `src/NEUIKit/rn/icon.tsx`, `src/NEUIKit/static/icons/icon-team-all-avatar.png`
- Affected behavior: 聊天页 @ 选择弹窗“所有人”候选头像展示
- No API or dependency changes.
