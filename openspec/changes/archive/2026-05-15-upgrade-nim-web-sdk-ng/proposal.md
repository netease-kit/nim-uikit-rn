## Why

当前仓库仍使用较早的 `nim-web-sdk-ng` 版本，和 npm 上最新发布版本存在差距。升级到最新版本可以让 RN Demo 与当前 SDK 能力、类型声明和缺陷修复保持一致，减少后续排查因版本滞后带来的偏差。

## What Changes

- 将 `nim-web-sdk-ng` 依赖升级到 npm 最新发布版本。
- 更新锁文件，确保安装结果与声明版本一致。
- 重新验证受影响的 TypeScript 路径，确认现有 RN Demo 代码仍与升级后的 SDK 类型兼容。

## Capabilities

### New Capabilities

### Modified Capabilities

- `nim-offline-push-foundation`: 依赖基线升级到最新 `nim-web-sdk-ng` 版本，确保离线推送相关接入建立在当前 SDK 发布版本之上。

## Impact

- Affected code: `package.json`, `package-lock.json`
- Affected dependency: `nim-web-sdk-ng`
- Affected validation: TypeScript checks for SDK-consuming stores and utilities
