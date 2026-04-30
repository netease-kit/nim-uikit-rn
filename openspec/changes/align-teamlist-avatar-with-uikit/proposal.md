## Why

`/contacts/teamlist` 当前使用的是固定群图标占位，而不是实际群头像渲染逻辑，导致该页面与会话列表、群设置页的头像显示不一致。

## What Changes

- 将 `/contacts/teamlist` 的群头像渲染改为复用 UIKit 的群头像组件。
- 优先显示群真实头像，缺失时使用 UIKit 的统一回退头像样式，而不是固定图标描边圆。

## Capabilities

### New Capabilities

- `teamlist-avatar`: 定义我的群聊列表页的群头像展示规则。

### Modified Capabilities

- None.

## Impact

- Affected code: `app/contacts/teamlist.tsx`
- Affected specs: `openspec/changes/align-teamlist-avatar-with-uikit/specs/teamlist-avatar/spec.md`
- No API, dependency, or backend impact.
