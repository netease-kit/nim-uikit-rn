# 网易云信 IM2 React Native Demo

这是一个基于 Expo Router、React Native、MobX 和 `nim-web-sdk-ng` 的即时通讯演示项目，用于验证云信 IM 登录、会话列表、消息收发和 Expo 多端运行流程。

如果你是贡献者或 AI agent：

- 项目结构和代码边界请先看 [ARCHITECTURE.md](ARCHITECTURE.md)
- Spec 驱动开发和仓库工作流请看 [AGENTS.md](AGENTS.md)
- UI 改动必须同时满足 [design/figma/instant-messaging](design/figma/instant-messaging) 视觉稿和 [src/NEUIKit](src/NEUIKit) 组件体系；不一致时调整 NEUIKit/RN 适配层对齐 Figma
- 变更提案、设计和任务拆解在 `openspec/changes/`

## 项目能力

- 登录云信 IM 账号
- 展示会话列表并清理未读
- 创建点对点会话
- 进入聊天页并发送文本消息
- 支持 Expo iOS、Android、Web 调试入口
- 基于 MobX 管理 NIM 初始化、会话状态和消息状态

## 技术栈

| 类别      | 当前实现                     |
| --------- | ---------------------------- |
| App 框架  | Expo SDK 55                  |
| 路由      | `expo-router`                |
| UI 运行时 | React 19 + React Native 0.83 |
| 状态管理  | MobX + `mobx-react-lite`     |
| IM SDK    | `nim-web-sdk-ng`             |
| 代码规范  | ESLint + Prettier            |
| 包管理器  | npm                          |

## 环境要求

| 依赖                 | 要求                                               |
| -------------------- | -------------------------------------------------- |
| Node.js              | `>=18`，推荐 `v20 LTS`，当前仓库已验证可兼容 `v24` |
| npm                  | 跟随 Node.js 安装                                  |
| Expo Go              | 需要支持 Expo SDK 55 的最新版本                    |
| iOS / Android 模拟器 | 按 Expo 官方要求安装，非必需                       |

> 说明：项目当前启用了 `newArchEnabled: true`。如果 Expo Go 在特定设备上启动异常，可暂时在 [app.json](app.json) 中将其改为 `false` 做兼容性排查。

## 启动前配置

### 1. 创建云信应用并开通 IM

在 [网易云信控制台](https://app.yunxin.163.com/) 中完成以下操作：

1. 创建应用，拿到 `App Key`
2. 为该应用开通 IM 产品
3. 创建可登录的 IM 账号

如果你需要批量或服务端注册账号，可参考云信文档中的账号注册接口说明；如果只是本地体验，也可以直接在控制台创建测试账号。

### 2. 按示例项目要求手动配置 AppKey

仓库已经移除了默认内置的 `AppKey`。这是刻意保留的空配置，避免示例项目继续携带共享 AppKey。

- 你第一次克隆后，会看到 [constants/NIMConfig.ts](constants/NIMConfig.ts) 顶部的 `const appKey = ''`
- 只需要修改这一个常量，`NIMConfig.appkey` 和短信登录请求头里的 `NIMConfig.userCenter.appKey` 会同时复用它
- 不要把你自己的 AppKey 再提交回仓库

请把它改成你自己的云信应用 AppKey：

```ts
const appKey = 'your_app_key_here'

export const NIMConfig = {
  appkey: appKey,
  defaultLogin: {
    mobile: '',
    smsCode: ''
  },
  userCenter: {
    appKey,
    baseUrl: 'https://yiyong-user-center.netease.im'
  }
}
```

未配置 AppKey 时，应用不会再偷偷使用仓库里的共享值，而是直接给出明确错误：

- NIM SDK 初始化会提示先在 `constants/NIMConfig.ts` 配置 AppKey
- 登录页请求短信验证码时也会直接提示同样的配置错误

建议同时检查以下字段是否符合当前环境：

- `defaultLogin`: 登录页默认填充的手机号和验证码
- `testEnvironment`: 测试环境的 LBS 和链路配置
- `debugLevel`: 本地排查问题时可保留 `debug`

### 3. 准备短信登录测试账号

当前示例项目的登录页走手机号验证码登录，因此除了 AppKey 以外，还需要确认：

- 云信应用已经开通 IM
- 关联的用户中心/短信能力可用
- 你准备的测试手机号能够正常接收验证码

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动 Expo 开发服务

```bash
npm run start
```

启动后可以在终端中选择：

- `i` 打开 iOS 模拟器
- `a` 打开 Android 模拟器
- `w` 打开 Web
- 使用 Expo Go 扫码在真机上运行

如果你明确知道目标平台，也可以直接使用：

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

`npm run reset-project` 是 Expo 模板自带的重置脚本，不属于本项目的日常开发流程，通常不要执行。

Web 启动依赖 `react-native-reanimated` 与 `react-native-worklets` 的版本匹配。当前项目固定了 `react-native-worklets`，如果 Web bundle 报 `Cannot find module 'react-native-worklets/plugin'`，先执行 `npm install` 同步依赖。

## 主要目录

```text
app/                 Expo Router 路由和页面
  _layout.tsx        根导航、字体加载、Splash、NIM 事件绑定
  login.tsx          登录页
  (tabs)/index.tsx   会话列表页
  chat/[id].tsx      聊天详情页
stores/              MobX 状态层
constants/           运行时配置、主题色、头像常量
components/          可复用 UI 组件
hooks/               主题和平台相关 hooks
utils/               通用工具函数
assets/              图片、字体等静态资源
design/figma/        离线 Figma 设计源和页面导出图
openspec/            Spec 驱动开发 artifacts
```

更完整的模块职责、改动落点和边界约束见 [ARCHITECTURE.md](ARCHITECTURE.md)。

## 开发与验证建议

修改代码后，至少根据改动范围执行以下检查：

- 文档或配置改动：`npm run format:check`
- 页面、状态或配置改动：`npm run lint`
- TypeScript 相关改动：`npx tsc --noEmit`
- Expo 依赖或运行时配置改动：`npx expo install --check`
- 功能实现完成后：主动启动受影响目标验证运行状态；通用变更至少运行 `npm run start`，Web 相关变更运行 `npm run web` 并访问 `http://localhost:8081` 确认页面返回 HTTP 200

如果改动涉及登录、会话或聊天链路，建议至少手动验证：

1. 登录页可正常登录
2. 会话列表可正常展示和进入
3. 聊天页可以发送文本消息

## Spec 驱动开发

当改动影响以下内容时，先创建或更新 OpenSpec change，再落代码或文档：

- 页面路由和导航
- 登录、会话、消息等用户可见流程
- `constants/NIMConfig.ts` 或 [app.json](app.json) 的运行时行为
- 仓库文档、工作流约束、启动命令

常用命令：

```bash
OPENSPEC_TELEMETRY=0 openspec list
OPENSPEC_TELEMETRY=0 openspec new change <change-name>
OPENSPEC_TELEMETRY=0 openspec status --change <change-name> --json
OPENSPEC_TELEMETRY=0 openspec validate <change-name> --type change --no-interactive
```

具体规则见 [AGENTS.md](AGENTS.md)。

## 常见问题

### Expo Go 无法启动

- 确认设备上的 Expo Go 已更新到支持 SDK 55 的最新版本
- 确认本地 Metro 已成功启动
- 如特定设备在 New Architecture 下异常，可临时将 [app.json](app.json) 中的 `newArchEnabled` 改为 `false` 进行对比验证

### 登录失败或 NIM 未初始化

- 先确认 [constants/NIMConfig.ts](constants/NIMConfig.ts) 顶部的 `appKey` 已替换成你自己的云信应用 AppKey
- 如果页面直接提示“示例项目未内置 AppKey”，说明你还没有完成这一步
- 检查 [constants/NIMConfig.ts](constants/NIMConfig.ts) 中的测试环境地址是否适用于当前环境
- 查看终端和设备日志中的 NIM 初始化或登录报错

### 不清楚应该改哪个文件

先看 [ARCHITECTURE.md](ARCHITECTURE.md) 的“首次阅读”和“改动路由”章节，再进入对应代码路径。
