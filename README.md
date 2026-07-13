# 网易云信 IM2 React Native Demo

这是一个基于 Expo Router、React Native、MobX 和 `nim-web-sdk-ng` 的 IM Demo，覆盖短信验证码登录、会话列表、聊天、通讯录、转发、收藏、群设置等核心流程。

如果你要接入或二次开发，先看这些文档：

- [docs/integration-guide.md](docs/integration-guide.md)：接入步骤、脱敏配置、原生文件准备
- [docs/feature-support-matrix.md](docs/feature-support-matrix.md)：当前功能支持矩阵
- [ARCHITECTURE.md](ARCHITECTURE.md)：代码边界、路由和 store 归属
- [AGENTS.md](AGENTS.md)：仓库工作流和 OpenSpec 规则

## 环境要求

| 依赖                 | 要求                         |
| -------------------- | ---------------------------- |
| Node.js              | `>=18`，推荐 `v20 LTS`       |
| npm                  | 跟随 Node.js 安装            |
| Expo Go              | 支持 Expo SDK 55 的最新版本  |
| iOS / Android 模拟器 | 按 Expo 官方要求安装，非必需 |

> 说明：项目当前启用了 `newArchEnabled: true`。如果特定设备上的 Expo Go 启动异常，可暂时在 [app.json](app.json) 中将其改为 `false` 做兼容性排查。
>
> 仓库根目录已包含 `.npmrc` 中的 `legacy-peer-deps=true`，用于兼容当前 `mobx-react` 与 React 19 的 peer 约束。

## 快速开始

1. 按 [docs/integration-guide.md](docs/integration-guide.md) 配置你自己的 `AppKey`、短信登录环境和可选原生能力。
2. 安装依赖：

```bash
npm install
```

3. 启动开发服务：

```bash
npm run start
```

如果你要直接跑指定平台，也可以使用：

```bash
npm run ios
npm run android
npm run web
```

## 常用命令

| 命令                       | 用途                     |
| -------------------------- | ------------------------ |
| `npm run start`            | 启动 Expo 开发服务       |
| `npm run ios`              | 启动并连接 iOS 目标      |
| `npm run android`          | 启动并连接 Android 目标  |
| `npm run web`              | 以 Web 模式运行          |
| `npm run lint`             | 运行 ESLint              |
| `npm run lint:fix`         | 自动修复 ESLint 问题     |
| `npm run format`           | 使用 Prettier 格式化仓库 |
| `npm run format:check`     | 校验格式是否一致         |
| `npx tsc --noEmit`         | TypeScript 类型检查      |
| `npx expo install --check` | 检查 Expo 依赖是否对齐   |

## 目录入口

```text
app/                 Expo Router 路由和页面
stores/              MobX 状态层
services/            短信登录和业务接口封装
constants/           运行时配置、主题色、头像常量
src/NEUIKit/         UIKit 基线组件和 RN 适配层
docs/                接入文档与功能矩阵
design/figma/        离线 Figma 视觉源
openspec/            Spec 驱动开发 artifacts
```

## 配置说明

- 仓库默认不再内置共享 `AppKey`。如果未配置 [constants/NIMConfig.ts](constants/NIMConfig.ts)，NIM 初始化和短信验证码接口都会直接提示你先补全配置。
- 短信登录使用 `NIMConfig.userCenter` 下的用户中心配置；如果你接的是私有环境，需要同步替换 `baseUrl`、路径和 scope。
- 离线推送、华为推送、签名文件、`agconnect-services.json` 等原生敏感材料已从同步内容里排除，按 [docs/integration-guide.md](docs/integration-guide.md) 手动补齐。

## 开发与验证

- 文档或配置改动：`npm run format:check`
- 页面、状态或配置改动：`npm run lint`
- TypeScript 相关改动：`npx tsc --noEmit`
- Expo 依赖或运行时配置改动：`npx expo install --check`
- 功能完成后：至少运行 `npm run start`；Web 相关变更再运行 `npm run web` 并访问 `http://localhost:8081`

如果改动涉及登录、会话或聊天链路，建议至少手动验证登录、会话列表、聊天发消息三个流程。
