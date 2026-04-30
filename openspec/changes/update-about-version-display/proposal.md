## Why

`/user/aboutNetease` 页面当前展示的版本号不是目标版本，需要更新为新的对外展示值。

## What Changes

- 将“关于云信”页面中的版本号展示更新为 `10.0.0-beta`。
- 不调整该页面的其他内容和交互。

## Capabilities

### New Capabilities

- `about-version-display`: 定义“关于云信”页面的版本号展示值。

### Modified Capabilities

- None.

## Impact

- Affected code: `app/user/aboutNetease.tsx`
- Affected specs: `openspec/changes/update-about-version-display/specs/about-version-display/spec.md`
- No API, dependency, or backend impact.
