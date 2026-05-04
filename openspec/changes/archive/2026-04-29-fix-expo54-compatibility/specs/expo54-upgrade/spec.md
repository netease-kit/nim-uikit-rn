## ADDED Requirements

### Requirement: Expo SDK 版本升级至 54

项目 `package.json` 中 `expo` 的版本 SHALL 为 `~54.0.x`，且所有 `expo-*` 官方子包版本 SHALL 与 Expo 54 的 `bundledNativeModules` 版本矩阵一致。

#### Scenario: 执行版本对齐检查无报错

- **WHEN** 在项目根目录执行 `npx expo install --check`
- **THEN** 输出结果中不包含任何 "version mismatch" 或 "incompatible" 警告

#### Scenario: Metro bundler 正常启动

- **WHEN** 在 Node v24 环境下执行 `npx expo start`
- **THEN** Metro bundler 成功启动，不抛出 Node.js 兼容性错误，并输出可扫描的 QR 码

### Requirement: Expo Go 在 iPhone 16 / iOS 18.3.1 上可正常运行

安装最新版 Expo Go 客户端后，使用 iPhone 16（iOS 18.3.1）扫描 QR 码，应用 SHALL 能够成功加载并进入首页。

#### Scenario: Expo Go 成功加载应用

- **WHEN** iPhone 16（iOS 18.3.1）上已安装最新版 Expo Go，且 Metro bundler 正在运行
- **THEN** 扫描 QR 码后 Expo Go 成功下载 JS bundle 并渲染应用首屏，无崩溃或白屏

#### Scenario: New Architecture 兼容性验证

- **WHEN** `app.json` 中 `newArchEnabled: true`，在 Expo Go 中加载应用
- **THEN** 应用正常运行；若 Expo Go 不支持，系统 SHALL 提供明确的错误提示或降级说明

### Requirement: 第三方原生库与 Expo 54 兼容

`react-native-reanimated`、`react-native-gesture-handler`、`react-native-screens`、`react-native-safe-area-context` 的版本 SHALL 符合 Expo 54 兼容版本要求。

#### Scenario: 动画和手势交互正常

- **WHEN** 应用在 Expo Go 中运行，用户执行滑动、拖拽等手势操作
- **THEN** 动画渲染流畅，无 JS/Native 报错，无界面冻结

#### Scenario: 安全区域适配正常

- **WHEN** 应用在 iPhone 16（有刘海/动态岛）的 Expo Go 中运行
- **THEN** 页面内容不被系统 UI 遮挡，安全区域 insets 正确

### Requirement: NIM SDK 在升级后功能正常

`nim-web-sdk-ng` 在 Expo 54 + React Native 升级后 SHALL 保持功能完整，包括登录、消息收发等核心功能。

#### Scenario: NIM 登录成功

- **WHEN** 用户在升级后的应用中输入有效的 AppKey 和账号密码
- **THEN** NIM SDK 登录成功，返回正常的登录状态，无 JS 引擎兼容性报错

#### Scenario: 消息收发正常

- **WHEN** NIM 登录成功后，用户在会话界面发送文字消息
- **THEN** 消息成功发送并在界面上正确展示，对方可以收到消息

### Requirement: Node v24 工具链兼容

所有构建脚本和开发工具 SHALL 在 Node v24 环境下正常运行，无废弃 API 警告或致命错误。

#### Scenario: npm install 无兼容性报错

- **WHEN** 在 Node v24 环境下执行 `npm install`
- **THEN** 安装过程无 `ERR!` 级别报错，所有依赖成功安装

#### Scenario: expo start 无 Node 兼容警告

- **WHEN** 在 Node v24 环境下执行 `npx expo start`
- **THEN** 启动输出中无 Node.js 版本不兼容的警告信息
