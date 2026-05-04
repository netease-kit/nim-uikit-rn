## Why

`/user/setting` 页面当前没有为顶部状态栏安全区预留空间，导致页面内容可能贴到系统状态栏区域。

## What Changes

- 为 `/user/setting` 页面补充顶部安全区内边距。
- 同时为页面底部保留最小安全区内边距，避免内容贴近底部系统区域。
- 不调整页面菜单项和设置项本身的结构与行为。

## Capabilities

### New Capabilities

- `user-setting-layout`: 定义设置页安全区留白规则。

### Modified Capabilities

- None.

## Impact

- Affected code: `app/user/setting.tsx`
- Affected specs: `openspec/changes/reserve-setting-safe-area-top/specs/user-setting-layout/spec.md`
- No API, dependency, or backend impact.
