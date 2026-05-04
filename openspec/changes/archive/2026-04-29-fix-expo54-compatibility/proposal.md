## Why

当前项目使用 Expo 53，客户反映两个问题：(1) 不适配 Expo 54；(2) 使用 Expo Go 沙盒在 iPhone 16 / iOS 18.3.1 上无法运行。随着 Expo 54 正式发布，以及 iOS 18.x 对 React Native New Architecture 的兼容要求，需要将依赖升级并修复运行时兼容性问题。

## What Changes

- 将 `expo` 从 `~53.0.x` 升级至 `~54.0.x`
- 随 Expo 54 同步升级所有 `expo-*` 子包（expo-router、expo-blur、expo-constants 等）
- 将 `react-native` 升级至与 Expo 54 对应的版本（预期 0.79.x 或 Expo 54 指定版本）
- 将 `react-native-reanimated`、`react-native-gesture-handler`、`react-native-screens` 等第三方 RN 原生库更新至与 Expo 54 兼容的版本
- 将 `react-native-safe-area-context` 更新至兼容版本
- 修复 iOS 18.3.1 + Expo Go 沙盒启动失败问题（通常由 Metro bundler 配置或 New Architecture 兼容问题引起）
- 验证 `newArchEnabled: true` 在 Expo 54 + iOS 18.3.1 下可正常工作
- 更新 `babel.config.js` 及 `metro.config.js`（如有必要）以适配 Expo 54 的工具链变化

## Capabilities

### New Capabilities

- `expo54-upgrade`: 将项目从 Expo 53 升级至 Expo 54，包括所有官方及第三方依赖的版本对齐，并修复 Expo Go / iOS 18.3.1 兼容性问题

### Modified Capabilities

（无现有 spec 需要变更）

## Impact

- **依赖**: `package.json` 中几乎所有 `expo-*` 包及部分 `react-native-*` 包版本变更
- **配置**: `app.json` 可能需要调整 `newArchEnabled` 或新增 Expo 54 专属字段
- **构建工具**: `babel.config.js`、`metro.config.js` 可能需要适配 Expo 54 工具链
- **Expo Go 兼容性**: 需确认 Expo Go 客户端版本支持 Expo SDK 54，以及 iOS 18.3.1 下的 Hermes / JSI 兼容性
- **开发体验**: Node v24 + Expo 54 的工具链兼容性需验证
