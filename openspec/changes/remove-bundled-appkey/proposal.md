## Why

这个示例仓库当前仍在源码里携带共享 AppKey，和示例项目不内置敏感运行时配置的要求不一致，也会让首次接手者误以为项目可以直接依赖仓库内置凭据运行。现在需要把默认 AppKey 移除，并把本地配置方式写清楚。

## What Changes

- 移除仓库跟踪源码中的默认 AppKey，不再内置共享值
- 在 NIM 初始化和短信登录请求前增加显式校验，未配置 AppKey 时直接返回清晰错误
- 更新 README，明确说明示例项目为什么默认留空 AppKey、应该改哪里、未配置时会出现什么提示

## Capabilities

### New Capabilities

- `nim-demo-bootstrap-configuration`: 规定示例仓库的 AppKey 必须由本地开发者显式配置，仓库默认不再内置共享值

### Modified Capabilities

- None

## Impact

影响 `constants/NIMConfig.ts`、`stores/NIMStore.ts`、`services/auth.ts`、`src/NEUIKit/common/utils/init.ts` 和 `README.md` 的初始化与配置说明。
