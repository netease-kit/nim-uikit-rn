## Why

“我的”页当前缺少测试用例要求的“收藏”入口，导致 `TestCases/10.0.0/我的/0001-我的页面UI.md` 无法通过。当前实现也与现有 `profile-home-and-account`、`message-collection` 规格基线不一致，需要恢复该入口。

## What Changes

- 在“我的”页主菜单中恢复“收藏”入口。
- 保持“关于云信”“设置”入口及其现有跳转行为不变。
- 复用现有 `app/user/collection.tsx` 作为收藏页入口，不新增新的收藏页面实现。

## Capabilities

### New Capabilities

- `my-menu`: 定义“我的”页主菜单包含收藏入口的测试回归要求。

### Modified Capabilities

- `profile-home-and-account`: 恢复“我的”页总览中包含收藏入口的要求。

## Impact

- Affected code: `app/(tabs)/my.tsx`
- Affected specs: `openspec/specs/profile-home-and-account/spec.md`
- Related existing route: `app/user/collection.tsx`
