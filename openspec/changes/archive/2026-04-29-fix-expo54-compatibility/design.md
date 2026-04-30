## Context

本项目是一个基于 Expo 53 + React Native 0.79 + expo-router 5 的 IM Demo 应用，集成了云信 NIM SDK（`nim-web-sdk-ng`）。当前配置中已启用 New Architecture（`newArchEnabled: true`）。

客户反馈两个关键问题：

1. 项目不适配 Expo 54（依赖版本落后）
2. 在 iPhone 16 / iOS 18.3.1 上无法通过 Expo Go 沙盒运行

经分析，Expo 54 对应 React Native 0.79.x（与现有版本基本一致），升级主要集中在 expo-\* 子包的版本对齐和部分 API 变更。iOS 18.3.1 的兼容性问题通常源于 Hermes 引擎版本、New Architecture JSI 绑定或 Expo Go 客户端本身不支持该 SDK 版本。

## Goals / Non-Goals

**Goals:**

- 将 `expo` 升级至 `~54.0.x`，并对齐所有 `expo-*` 官方子包
- 修复 Expo Go 在 iPhone 16 / iOS 18.3.1 上无法启动的问题
- 确保 Node v24 环境下的构建工具链兼容
- 确保 `react-native-reanimated`、`react-native-gesture-handler` 等第三方库与 Expo 54 兼容
- 验证 `nim-web-sdk-ng` 在升级后仍可正常工作

**Non-Goals:**

- 不引入新功能或 UI 变更
- 不升级 React 版本（维持 19.0.0）
- 不修改 NIM SDK 的业务逻辑代码

## Decisions

### 决策 1：使用 `npx expo install --fix` 驱动依赖升级

**选择**: 通过官方 `expo install --fix` 命令自动对齐所有 expo-managed 依赖至 Expo 54 建议版本，而非手动逐包修改 `package.json`。

**理由**: Expo 维护了每个 SDK 版本对应的依赖版本矩阵（`bundledNativeModules.json`），手动修改容易遗漏或版本不兼容。`expo install --fix` 是官方推荐做法。

**备选方案**: 手动更新 `package.json` → 风险高，易遗漏隐性依赖。

### 决策 2：降级或禁用 New Architecture 作为 Expo Go 兼容性 Workaround

**选择**: 若 Expo Go + iOS 18.3.1 在 `newArchEnabled: true` 下仍无法运行，则在 `app.json` 中临时设置 `newArchEnabled: false` 作为 Expo Go 调试环境的兼容方案。

**理由**: Expo Go 沙盒对 New Architecture 的支持依赖 Expo Go 客户端版本。iPhone 16 / iOS 18.3.1 上的 Expo Go 如果版本较旧，可能不支持最新的 JSI/Hermes 绑定。禁用 New Arch 可快速验证是否为架构兼容问题。

**备选方案**: 创建 Development Build（EAS Build）→ 彻底解决沙盒限制，但成本更高，需要构建时间。

### 决策 3：Metro 配置更新策略

**选择**: 检查并更新 `metro.config.js` 以使用 Expo 54 推荐的 `@expo/metro-config` 版本，确保 Node v24 与 Metro 的 `require` 解析兼容。

**理由**: Node v24 对某些 CommonJS/ESM 混合模块的处理有变化，可能影响 Metro bundler 的启动。

## Risks / Trade-offs

- **[风险] Expo Go 版本限制** → Expo Go 只能运行与其内置 SDK 版本匹配的项目。若用户设备上的 Expo Go 版本不支持 SDK 54，需要更新 Expo Go 客户端。缓解：文档中明确说明 Expo Go 版本要求。
- **[风险] `nim-web-sdk-ng` 与新版 Hermes 不兼容** → NIM Web SDK 可能依赖某些在 Hermes 下不支持的 JS 特性。缓解：升级后运行全量功能验证测试。
- **[风险] Node v24 + Expo 54 工具链冲突** → Metro bundler 或 babel 插件可能在 Node v24 下有已知 bug。缓解：查阅 Expo 54 发布说明和 GitHub Issues。
- **[权衡] `npx expo install --fix` 可能升级 react-native-reanimated 等到新 major 版本** → 新 major 版本可能有 breaking changes。缓解：升级后运行 UI 回归测试，重点验证动画和手势交互。

## Migration Plan

1. 备份当前 `package.json` 和 `package-lock.json`
2. 更新 `package.json` 中 `expo` 版本至 `~54.0.0`
3. 执行 `npx expo install --fix` 自动对齐所有依赖
4. 执行 `npm install` 安装更新后的依赖
5. 更新 `babel.config.js` 和 `metro.config.js`（如 Expo 54 有要求）
6. 在 Expo Go（最新版）上进行 iPhone 16 / iOS 18.3.1 测试
7. 若仍失败，设置 `newArchEnabled: false` 并重新测试
8. 全量功能回归验证（NIM 登录、消息收发、界面渲染）

**回滚策略**: 恢复备份的 `package.json`，重新执行 `npm install`。

## Open Questions

- Expo 54 正式版是否已经发布？（截至本文档编写时，需确认 expo@54.x 的最新稳定版号）
- 客户设备上安装的 Expo Go 版本是多少？是否为最新版本？
- 当前失败的具体错误信息是什么？（Metro 启动失败？JS bundle 加载失败？原生模块崩溃？）
