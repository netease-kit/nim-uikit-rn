# IM2 RN Demo Architecture

本文档描述当前仓库的真实代码边界、运行拓扑和改动落点。它服务于开发者和 AI agent，不替代产品需求；涉及行为、流程或工作流变更时，仍应先走 OpenSpec。

## 0. 项目概览

这是一个单体 Expo 应用，不包含独立的后端子工程。核心业务链路如下：

1. 应用启动后在根布局中加载字体、控制 Splash，并初始化 NIM SDK
2. 登录页读取 [constants/NIMConfig.ts](constants/NIMConfig.ts) 中的默认账号并执行登录
3. 登录成功后进入 Tab 容器中的会话列表页
4. 会话页可同步历史消息、创建点对点会话、清除未读并跳转聊天页
5. 聊天页基于消息 store 展示消息并发送文本消息

技术上，这是 `expo-router` + MobX + `nim-web-sdk-ng` 的前端应用。UI 视觉设计源来自 [design/figma/instant-messaging](design/figma/instant-messaging)，UIKit 基线来自 [src/NEUIKit](src/NEUIKit)，二者必须同时满足；当二者不一致时，改造 `src/NEUIKit` 或 RN 适配层以对齐 Figma。IM 领域状态与基础工具优先使用 `@xkit-yx/im-store-v2` 和 `@xkit-yx/utils`。不要按“前后端分层仓库”的思路理解它。

## 0.1 首次阅读

接手任务时，优先按下面顺序建立上下文：

1. [AGENTS.md](AGENTS.md)：仓库工作流、OpenSpec 门槛、验证规则
2. [README.md](README.md)：环境准备、启动方式、配置说明
3. 本文档的 `0`、`0.1`、`0.5`
4. UI 相关任务同时看 [design/figma/instant-messaging](design/figma/instant-messaging) 中的离线 Figma 与导出图，以及 [src/NEUIKit](src/NEUIKit) 中与需求匹配的 UIKit 组件、交互、工具和样式基线
5. 如果 Figma 与 NEUIKit 不一致，确认需要调整的 NEUIKit 组件或 RN 适配层
6. 与需求直接相关的页面、UIKit 适配代码或 store 文件
7. 若任务跨越行为或流程边界，再进入 `openspec/changes/`

按任务类型继续深入：

- 启动、配置、AppKey、Expo Go 兼容性：看 [README.md](README.md)、[app.json](app.json)、[constants/NIMConfig.ts](constants/NIMConfig.ts)
- 路由和导航：看 [app/\_layout.tsx](app/_layout.tsx)、[app/(tabs)/\_layout.tsx](<app/(tabs)/_layout.tsx>)
- 页面 UI、列表行、消息渲染、底部面板、头像、图标和基础交互：同时看 [design/figma/instant-messaging](design/figma/instant-messaging) 和 [src/NEUIKit](src/NEUIKit)，不一致时改 NEUIKit/RN 适配层对齐 Figma
- 登录流程：看 [app/login.tsx](app/login.tsx)、[stores/NIMStore.ts](stores/NIMStore.ts)
- 会话列表：看 [app/(tabs)/index.tsx](<app/(tabs)/index.tsx>)、[stores/ConversationStore.ts](stores/ConversationStore.ts)
- 聊天消息：看 [app/chat/[id].tsx](app/chat/[id].tsx)、[stores/MessageStore.ts](stores/MessageStore.ts)

## 0.5 边界规则

- 路由结构由 `app/` 目录拥有，不要把导航逻辑分散到 `components/`
- 页面视觉表现以 [design/figma/instant-messaging](design/figma/instant-messaging) 为本地设计源，覆盖布局、间距、字号、颜色和状态截图
- 页面 UI 必须同时满足本地 Figma 视觉稿和 [src/NEUIKit](src/NEUIKit) 组件体系；与 H5/NEUIKit 现状不一致时，除非 OpenSpec 或测试用例另有要求，修改 NEUIKit 组件或 RN 适配层使其 UI 与 Figma 保持一致
- 页面能力必须优先复用或适配 [src/NEUIKit](src/NEUIKit)；如果现有 UIKit 组件不满足 RN 能力，先扩展或适配 UIKit 组件，再接入页面
- `src/NEUIKit` 是从 H5 UIKit 复制的基线目录，改造时要隔离 DOM、`window`、`localStorage`、Umi 路由和 `.less` 等 Web-only 假设
- 会话、通讯录和聊天页的头像与昵称展示统一走 `src/NEUIKit/rn` 适配层，页面优先使用 `UIKitUserAvatar`、`UIKitAppellation`、`UIKitListRow` 和 `getUIKitConversationIdentity`
- 昵称优先级对齐 H5 `Appellation`：好友备注、群昵称、用户资料昵称、消息携带昵称、账号；头像优先级对齐 H5 `Avatar`：显式头像、im-store 用户头像、本地用户/好友资料头像、稳定色块兜底
- IM 领域状态、会话/消息/好友/群组模型和通用 IM 方法优先来自 `@xkit-yx/im-store-v2` 与 `@xkit-yx/utils`
- 本仓库的 `stores/` 只能作为 Expo/RN 适配层或迁移桥，不应长期复制 `@xkit-yx/im-store-v2` 已有能力
- NIM SDK 初始化和实例生命周期由 [stores/NIMStore.ts](stores/NIMStore.ts) 拥有
- 会话集合、未读计数、会话头像装饰由 [stores/ConversationStore.ts](stores/ConversationStore.ts) 拥有
- 消息集合、同步状态和发送逻辑由 [stores/MessageStore.ts](stores/MessageStore.ts) 拥有
- AppKey、默认登录账号、测试环境链路配置由 [constants/NIMConfig.ts](constants/NIMConfig.ts) 拥有
- Expo 运行时配置和 New Architecture 开关由 [app.json](app.json) 拥有
- 通用主题和样式基元放在 `components/`、`hooks/`、`constants/Colors.ts`
- 不要把业务逻辑塞进模板残留工具，例如 [scripts/reset-project.js](scripts/reset-project.js)
- 不要编辑 `.expo/`、`node_modules/` 或其他生成产物

## 1. 运行时拓扑

### 1.1 根布局

[app/\_layout.tsx](app/_layout.tsx) 是整个应用的根入口，负责：

- 加载字体资源
- 控制 `SplashScreen`
- 设置根 `Stack`
- 监听 NIM 登录状态、连接状态、消息接收和本地会话同步
- 将 NIM 事件桥接到 `conversationStore` 和 `messageStore`

这里是“应用生命周期”和“NIM 事件接入点”的汇合处。涉及全局初始化或路由入口切换时，先看这里。

### 1.2 登录链路

[app/login.tsx](app/login.tsx) 负责：

- 展示账号密码输入
- 等待 `nimStore.isInitialized`
- 对密码做 MD5 后调用 `V2NIMLoginService.login`
- 登录成功后跳转 `/(tabs)`

登录页只应该持有页面级输入和交互状态。NIM 实例本身不在这里创建。

### 1.3 会话链路

[app/(tabs)/index.tsx](<app/(tabs)/index.tsx>) 负责：

- 展示会话列表
- 清理未读
- 进入指定会话
- 在首次进入会话前拉取消息列表
- 创建新的点对点会话
- 退出登录

如果你要改会话页的 UI、导航、会话创建入口或列表格式，先从这个文件入手，再看 `ConversationStore` 和 `MessageStore`。

### 1.4 聊天链路

[app/chat/[id].tsx](app/chat/[id].tsx) 负责：

- 根据路由参数查找当前会话
- 从 `MessageStore` 读取并格式化消息
- 展示消息气泡
- 发送文本消息
- 在消息更新后自动滚动到底部

聊天页负责展示和交互编排；真正的消息发送和去重逻辑在 `MessageStore`。

## 2. 路由层

| 文件                                                | 责任                                               |
| --------------------------------------------------- | -------------------------------------------------- |
| [app/\_layout.tsx](app/_layout.tsx)                 | 根 Stack、初始路由、字体加载、Splash、NIM 事件桥接 |
| [app/login.tsx](app/login.tsx)                      | 登录页                                             |
| [app/(tabs)/\_layout.tsx](<app/(tabs)/_layout.tsx>) | Tab 容器和 Tab 样式                                |
| [app/(tabs)/index.tsx](<app/(tabs)/index.tsx>)      | 会话列表主页                                       |
| [app/chat/[id].tsx](app/chat/[id].tsx)              | 聊天详情页                                         |
| [app/+not-found.tsx](app/+not-found.tsx)            | 路由兜底页                                         |

路由改动的基本原则：

- 增减页面或调整导航层级，先改 `app/` 路由文件
- 不要在 store 中直接拼装路由结构
- 不要在底层通用组件中偷偷发起页面跳转

## 3. 状态层

### 3.1 `@xkit-yx/im-store-v2` 与 `@xkit-yx/utils`

职责：

- 作为 IM 领域状态、数据模型和基础方法的优先来源
- 承接会话、消息、好友、群组等 UIKit 能力所需的 store 行为
- 提供文件、消息、节流、防抖等基础工具能力

边界：

- 新增 IM 状态能力前先检查 `@xkit-yx/im-store-v2`
- 新增基础工具前先检查 `@xkit-yx/utils`
- RN 平台差异通过适配层处理，不在页面中重写 store 能力

### 3.1.1 NEUIKit 身份展示适配

[src/NEUIKit/rn/identity.ts](src/NEUIKit/rn/identity.ts) 负责将 H5 UIKit 的头像和称谓规则适配到 RN 页面：

- `getUIKitAppellation` 优先调用 `imStoreV2Bridge.rootStore.uiStore.getAppellation`，缺失时再回退到本地好友、用户、群成员和消息昵称数据
- `getUIKitAvatarUri` 优先读取显式头像和 im-store 用户头像，缺失时回退到本地用户、本人资料和好友资料头像
- `UIKitUserAvatar`、`UIKitAppellation` 和 `UIKitListRow` 是会话列表、通讯录和聊天消息头像/昵称展示的统一入口

页面不应私有复制头像颜色、昵称优先级或会话标题解析逻辑；如果 H5 规则需要补齐，先扩展 `src/NEUIKit/rn`，再接入具体页面。

### 3.2 [stores/NIMStore.ts](stores/NIMStore.ts)

职责：

- 创建 `V2NIM` 实例
- 暴露 `nim` 和 `isInitialized`

边界：

- 这里只做 SDK 初始化，不承载页面级交互状态

### 3.3 [stores/ConversationStore.ts](stores/ConversationStore.ts)

职责：

- 存储会话列表
- 同步会话列表
- 更新会话信息
- 处理未读清理
- 为缺失头像的会话补充随机头像

边界：

- 这里只处理“会话集合”的状态，不处理消息详情渲染

### 3.4 [stores/MessageStore.ts](stores/MessageStore.ts)

职责：

- 按会话管理消息列表
- 标记消息是否已同步
- 发送文本消息
- 去重并按时间排序

边界：

- 这里只处理消息数据，不负责页面导航

## 4. 配置与基础设施

| 文件 / 目录                                                      | 作用                                              |
| ---------------------------------------------------------------- | ------------------------------------------------- |
| [constants/NIMConfig.ts](constants/NIMConfig.ts)                 | AppKey、默认登录账号、测试环境配置                |
| [app.json](app.json)                                             | Expo 运行时配置、插件、New Architecture、平台参数 |
| [constants/Colors.ts](constants/Colors.ts)                       | Light / Dark 主题色                               |
| [design/figma/instant-messaging](design/figma/instant-messaging) | 离线 Figma UI 视觉设计源、页面状态导出图          |
| [src/NEUIKit](src/NEUIKit)                                       | H5 UIKit 基线组件、交互、静态资源、工具和样式参考 |
| `@xkit-yx/im-store-v2`                                           | UIKit IM 领域状态、数据模型和 store 基线          |
| `@xkit-yx/utils`                                                 | UIKit 基础工具方法                                |
| `components/Themed*.tsx`                                         | 主题感知的文本和容器基元                          |
| `components/ui/*`                                                | Tab icon、Tab 背景等平台 UI 辅助组件              |
| `hooks/*`                                                        | 平台和主题相关 hooks                              |
| [utils/index.ts](utils/index.ts)                                 | 随机头像等通用工具                                |
| `assets/`                                                        | 图片、字体等静态资源                              |

## 5. 支撑目录

- `.claude/`、`.codex/`、`.opencode/`：不同 agent 环境的仓库资产
- `design/figma/instant-messaging/`：离线 Figma 设计源，AI 和贡献者改 UI 时必须与 `src/NEUIKit` 一起参考
- `openspec/`：Spec 驱动开发 artifacts
- `scripts/reset-project.js`：Expo 模板保留脚本，正常开发通常不需要执行

## 6. 改动路由

如果你要做下面这些事，优先修改这些文件：

- 调整启动路由、根布局、全局监听：`app/_layout.tsx`
- 调整 Tab 容器、Tab 样式：`app/(tabs)/_layout.tsx`
- 调整登录表单、登录交互、登录错误提示：对照 `design/figma/instant-messaging` 和 `src/NEUIKit/login`，再改 `app/login.tsx`
- 调整会话列表展示、创建会话、退出登录：对照 `design/figma/instant-messaging`、`src/NEUIKit/conversation` 和 `@xkit-yx/im-store-v2`，再改 `app/(tabs)/index.tsx`
- 调整聊天展示、发送消息、自动滚动：对照 `design/figma/instant-messaging`、`src/NEUIKit/chat` 和 `@xkit-yx/im-store-v2`，再改 `app/chat/[id].tsx`
- 调整通讯录、好友、群组、个人中心能力：对照 `design/figma/instant-messaging`、`src/NEUIKit/contact`、`src/NEUIKit/friend`、`src/NEUIKit/team`、`src/NEUIKit/user`
- 调整 NIM 初始化、AppKey、测试环境：`stores/NIMStore.ts`、`constants/NIMConfig.ts`
- 调整会话状态结构：优先 `@xkit-yx/im-store-v2`，必要时再改 `stores/ConversationStore.ts` 适配层
- 调整消息同步或发送逻辑：优先 `@xkit-yx/im-store-v2`，必要时再改 `stores/MessageStore.ts` 适配层
- 调整主题色和基础 UI：同时对照 `design/figma/instant-messaging` 与 `src/NEUIKit/common`；不一致时优先改 NEUIKit/RN 适配层，必要时再改 `constants/Colors.ts`、`components/`、`hooks/`
- 调整仓库工作流文档：`README.md`、`ARCHITECTURE.md`、`AGENTS.md`、`CLAUDE.md`

## 7. 验证矩阵

| 改动类型                                                | 最少验证                                                                                                           |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| README / ARCHITECTURE / AGENTS / CLAUDE / OpenSpec 文档 | `npm run format:check` + `openspec validate`                                                                       |
| 页面、路由、UI 组件                                     | `npm run lint` + `npx tsc --noEmit` + 相关 Expo 目标启动验证 + 手动页面验证                                        |
| Store、NIM 配置、运行时配置                             | `npm run lint` + `npx tsc --noEmit` + `npx expo install --check` + 相关 Expo 目标启动验证 + 手动登录/会话/聊天验证 |
| Expo 依赖或 `app.json`                                  | `npx expo install --check` + 实际启动验证                                                                          |

功能实现完成后，agent 必须主动启动受影响目标验证运行状态：通用变更至少运行 `npm run start`，Web 相关变更运行 `npm run web` 并访问 `http://localhost:8081` 触发 bundle，确认返回 HTTP 200 或明确记录本地环境阻塞原因。

## 8. 何时必须先走 OpenSpec

以下变更在动手前应先创建或更新 OpenSpec change：

- 新页面、路由结构或导航行为变化
- 登录、会话、聊天等用户可见流程变化
- `constants/NIMConfig.ts` 或 [app.json](app.json) 的运行时行为变化
- 仓库工作流、文档入口、验证规则变化

不需要 OpenSpec 的典型情况：

- 纯文案修正
- 局部重构但不改变行为
- 仅补测试或仅修格式
