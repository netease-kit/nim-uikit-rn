## Why

`/chat/read-detail` 当前自己拼接昵称，和会话列表页使用的 UIKit 昵称解析逻辑不同，导致同一个用户在不同页面可能显示出不同名字。仓库里还有几处成员列表和历史消息页使用了同类手写逻辑，继续放着会反复出现同样问题。

## What Changes

- 将 `/chat/read-detail` 的昵称显示切换为与会话列表同源的 `getUIKitAppellation` 逻辑。
- 检查并修正其他使用同类手写昵称链的成员展示页面，使其与 UIKit 昵称解析保持一致。

## Capabilities

### New Capabilities

- `member-appellation-alignment`: 规定成员昵称展示页需要复用 UIKit 昵称解析逻辑，而不是各页各自手写兜底顺序。

### Modified Capabilities

- None.

## Impact

- Affected code: `app/chat/read-detail.tsx`, `app/team/members.tsx`, `app/team/settings.tsx`, `app/chat/history.tsx`, `app/session/p2p-settings.tsx`, `app/chat/forward.tsx`
- Affected UX: member list, read-detail, chat history, and sender-display naming consistency
- No API or dependency changes
