## Why

“我的”页面当前仍展示“收藏”模块，但该入口不再需要出现在个人中心主菜单中，会增加页面噪音。

## What Changes

- 从“我的”页面菜单中移除“收藏”模块入口。
- 保留“关于云信”和“设置”模块，不调整其顺序与跳转行为。
- 不移除收藏能力本身，仅移除“我的”页中的该入口。

## Capabilities

### New Capabilities

- `my-menu`: 定义“我的”页面主菜单的展示项。

### Modified Capabilities

- None.

## Impact

- Affected code: `app/(tabs)/my.tsx`
- Affected specs: `openspec/changes/remove-my-collection-module/specs/my-menu/spec.md`
- No API, dependency, or backend impact.
