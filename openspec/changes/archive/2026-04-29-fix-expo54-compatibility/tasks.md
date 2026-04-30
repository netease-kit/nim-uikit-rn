## 1. 准备工作

- [x] 1.1 备份当前 `package.json` 和 `package-lock.json`（或记录当前版本快照）
- [x] 1.2 确认 Expo 54 最新稳定版本号（`npm info expo versions --json | tail -5`）
- [x] 1.3 确认 Expo Go 在客户设备（iPhone 16 / iOS 18.3.1）上的版本，提示用户更新至最新版

## 2. 升级 Expo 及官方子包

- [x] 2.1 修改 `package.json` 中 `expo` 版本为 `~54.0.0`
- [x] 2.2 执行 `npx expo install --fix` 自动对齐所有 `expo-*` 子包版本
- [x] 2.3 执行 `npm install` 安装更新后的依赖
- [x] 2.4 执行 `npx expo install --check` 确认无版本不兼容警告

## 3. 升级第三方原生库

- [x] 3.1 将 `react-native-reanimated` 更新至 Expo 54 兼容版本（参考 `expo install` 输出）
- [x] 3.2 将 `react-native-gesture-handler` 更新至 Expo 54 兼容版本
- [x] 3.3 将 `react-native-screens` 更新至 Expo 54 兼容版本
- [x] 3.4 将 `react-native-safe-area-context` 更新至 Expo 54 兼容版本
- [x] 3.5 将 `react-native-webview` 更新至 Expo 54 兼容版本（如有变更）

## 4. 配置文件更新

- [x] 4.1 检查 `babel.config.js` 是否需要更新（Expo 54 是否有新的 babel preset 要求）
- [x] 4.2 检查 `metro.config.js` 是否需要更新 `@expo/metro-config` 版本或配置项
- [x] 4.3 检查 `app.json` 是否需要添加 Expo 54 新增的配置字段

## 5. 修复 Expo Go / iOS 18.3.1 兼容性

- [ ] 5.1 在 Node v24 环境下执行 `npx expo start`，确认 Metro bundler 正常启动
- [ ] 5.2 使用 iPhone 16（iOS 18.3.1）最新版 Expo Go 扫码测试，观察是否能成功加载
- [ ] 5.3 若加载失败，检查错误日志，判断是否为 New Architecture 兼容问题
- [ ] 5.4 若为 New Architecture 问题，在 `app.json` 中临时设置 `newArchEnabled: false` 并重新测试
- [ ] 5.5 记录最终解决方案（是否需要保持 `newArchEnabled: false` 或有其他修复方式）

## 6. 功能回归验证

- [ ] 6.1 验证 NIM SDK 登录功能正常（输入 AppKey 和账号密码可成功登录）
- [ ] 6.2 验证消息列表页正常渲染，滚动流畅
- [ ] 6.3 验证消息收发功能正常（发送文字消息，对方可收到）
- [ ] 6.4 验证手势交互正常（滑动删除、下拉刷新等）
- [ ] 6.5 验证动态岛/刘海区域安全区域适配正确，无内容遮挡

## 7. 文档与收尾

- [x] 7.1 更新项目 README，说明 Expo 54 和 Expo Go 版本要求
- [x] 7.2 记录 `newArchEnabled` 的最终配置决策及原因
- [ ] 7.3 提交所有变更，PR 描述中注明升级的版本变更列表
