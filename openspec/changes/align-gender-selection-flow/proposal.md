## Why

性别选择页当前只有 `男`、`女` 两项，且依赖 `保存` 按钮提交，不符合测试用例要求的 `未知 / 男 / 女` 选项和“修改后点击返回即生效”的交互。这样会导致 `0023-0028` 这一组用例持续失败。

## What Changes

- 为性别页补齐 `未知` 选项。
- 未设置时默认选中 `未知`，已设置时跟随上次选择。
- 将提交时机调整为“返回时保存变更”，无改动直接返回，无网络时提示失败并停留当前页。

## Capabilities

### New Capabilities

### Modified Capabilities

- `profile-home-and-account`: 明确性别页提供 `未知 / 男 / 女`，并在返回时完成保存。

## Impact

- Affected code: `app/user/gender.tsx`, `app/user/my-detail.tsx`
- Affected specs: `openspec/specs/profile-home-and-account/spec.md`
- No API or dependency changes
