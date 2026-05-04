## Why

项目配置中的实际版本号仍然是 `1.0.0`，与当前页面展示和目标发布版本不一致，需要统一为 `10.0.0-beta`。

## What Changes

- 将项目包版本更新为 `10.0.0-beta`。
- 将 Expo 应用版本更新为 `10.0.0-beta`。
- 将 Android `versionName` 更新为 `10.0.0-beta`。

## Capabilities

### New Capabilities

- `project-versioning`: 定义当前项目的对外版本号配置。

### Modified Capabilities

- None.

## Impact

- Affected code: `package.json`, `package-lock.json`, `app.json`, `android/app/build.gradle`
- Affected specs: `openspec/changes/update-project-version-to-10-beta/specs/project-versioning/spec.md`
- No API or backend impact.
