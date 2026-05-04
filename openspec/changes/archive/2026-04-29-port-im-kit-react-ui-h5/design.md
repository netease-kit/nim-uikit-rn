## Context

当前仓库是一个 Expo Router + React Native + MobX + `nim-web-sdk-ng` 的 IM Demo。本地离线 Figma 导出 [design/figma/instant-messaging](../../../design/figma/instant-messaging) 是 RN 页面视觉设计源。参考项目 `nim-uikit-web/im-kit-react-ui-h5` 已经覆盖完整 UIKit 能力，当前改造要求将其 `src/NEUIKit` 完整复制到本仓库 [src/NEUIKit](../../../src/NEUIKit) 作为 UIKit 基线；页面 UI 必须同时满足 Figma 视觉稿和 NEUIKit 组件体系，当二者不一致时改造 NEUIKit 或 RN 适配层以对齐 Figma。IM 状态管理和基础方法优先使用 `@xkit-yx/im-store-v2`、`@xkit-yx/utils` 承接。与此同时，`TestCases.xlsx` 是当前 RN 交付的权威验收基线，并且在若干点上比参考实现更严格，例如短信验证码登录、权限分支和推送偏好行为。

这次变更是跨路由、跨状态层、跨设备能力和跨运行时配置的整体升级。需要在保留 Expo Router 的前提下，将当前 Demo 改造成同时满足本地 Figma 视觉稿和 `src/NEUIKit` UI 能力源、以 `@xkit-yx/im-store-v2` 为 IM 领域状态源的 RN UIKit 容器。H5 参考实现提供优先组件和行为，RN 平台差异通过适配层解决；视觉差异通过改造 NEUIKit/RN 适配层收敛到 Figma。

## Goals / Non-Goals

**Goals:**

- 在当前 Expo RN 仓库内基于 `src/NEUIKit` 实现会话、通讯录、聊天、群组、个人中心、权限与推送入口等核心 UIKit 能力。
- 使用本地离线 Figma 作为 RN 页面布局、间距、颜色、字号和状态截图的视觉来源，并通过 NEUIKit/RN 适配层落地。
- 优先使用和改造 `src/NEUIKit` 组件；组件不满足时先增强 UIKit 组件或建立 RN 适配，而不是绕开 UIKit 写页面私有实现。
- 优先使用 `@xkit-yx/im-store-v2` 和 `@xkit-yx/utils` 承接状态管理、数据模型和基础方法。
- 让登录、会话、通讯录、聊天、设置和推送偏好等行为以测试用例为准可追溯到对应 spec。
- 为后续继续补齐剩余细节用例提供稳定的页面路由、状态分层和基础服务封装。

**Non-Goals:**

- 不把 H5 DOM、Umi 路由、`window`、`localStorage` 或 `.less` 假设直接泄漏到 RN 页面。
- 不引入独立后端工程；短信验证码依旧复用参考实现所使用的远端 user-center 接口。
- 不在当前阶段实现测试用例之外的产品扩展能力。

## Decisions

### 1. 同时满足本地 Figma 视觉设计源与 `src/NEUIKit` UI 能力源

选择：

- 将离线 Figma 导出移入 [design/figma/instant-messaging](../../../design/figma/instant-messaging)，作为 UI 页面视觉、状态截图和切图查阅入口。
- 将 `nim-uikit-web/im-kit-react-ui-h5/src/NEUIKit` 完整复制到 [src/NEUIKit](../../../src/NEUIKit)。
- 页面布局、间距、颜色、字号和状态表现对齐本地 Figma 导出。
- 页面 UI、列表行、消息渲染、底部面板、头像、图标、提示和共享工具都优先从 `src/NEUIKit` 复用、迁移或适配。
- 当 Figma 与 NEUIKit 现状不一致时，修改 NEUIKit 组件或 RN 适配层以对齐 Figma，而不是绕过 NEUIKit 写页面私有实现。
- 当现有组件不满足 RN 能力时，先扩展或适配 NEUIKit 组件，再接入页面。

原因：

- 用户明确要求以离线 Figma 作为 UI 设计来源，并以 NEUIKit 作为基础 UIKit 组件，理论上这些组件应覆盖所有页面能力。
- 保留一份完整基线可以让 RN 改造与 H5 行为保持可追溯，避免页面继续产生平行的一次性实现。

备选：

- 继续维护 `components/` 或页面内私有 UI。
  放弃原因：会绕开 UIKit 组件体系，导致 RN 与 H5 能力逐步分叉。

### 2. 优先使用 `@xkit-yx/im-store-v2` 和 `@xkit-yx/utils`

选择：

- IM 领域状态、数据模型、会话/消息/好友/群组能力优先来自 `@xkit-yx/im-store-v2`。
- 基础工具、防抖、文件类型、消息工具等能力优先来自 `@xkit-yx/utils`。
- 本仓库现有 `stores/` 逐步收敛为 Expo/RN 适配层或迁移桥，不长期复制 im-store-v2 已有能力。

原因：

- 用户明确要求使用 `@xkit-yx/im-store-v2`、`@xkit-yx/utils` 实现状态管理和基础方法。
- H5 UIKit 组件本身已经围绕该 store 和工具层设计，继续复用可以减少行为漂移。

风险：

- 该 store 与 H5 Provider、DOM 存储、Umi 路由存在耦合，需要 RN 适配层隔离平台差异。
- `mobx-react` 等 H5 依赖与 React 19 存在 peer dependency 声明差异，依赖安装需要固定并验证 Expo 编译。

### 3. 路由结构按 capability 拆平为“主壳 + 子页面”

选择：

- 保留 `app/_layout.tsx` 作为根入口。
- 把 authenticated shell 扩展为 `/(tabs)` 下的会话、通讯录、我的三栏。
- 新增 `conversation/search`、`contacts/*`、`friend/*`、`team/*`、`user/*`、`chat/*` 等页面路由。

原因：

- 参考项目本身也是“主壳 + 细分能力页”的结构。
- Expo Router 原生支持文件路由，适合让每个测试模块对应一个真实页面，而不是把所有弹层和列表塞进单页。

备选：

- 把大量详情能力继续塞进 `app/(tabs)/index.tsx` 和 `app/chat/[id].tsx`。
  放弃原因：页面职责过载，状态与导航耦合会迅速失控。

### 4. 登录链路改为“手机号验证码换取 IM 账号令牌，再走 NIM 登录”

选择：

- 复用参考实现的 user-center API 形态，先通过短信验证码接口拿到 `imAccid/imToken`，再调用 `nim.V2NIMLoginService.login`。
- 使用本地持久化保存登录态与偏好设置，并在应用启动时自动恢复。

原因：

- `TestCases.xlsx` 明确要求验证码登录、自动登录、未注册手机号提示、退出登录和多端登录结果处理。
- 当前 Demo 的账号密码登录与验收基线不一致，必须替换为测试驱动链路。

备选：

- 保留现有账号密码登录，只在 UI 上补充手机号表单。
  放弃原因：行为不符合测试用例，也无法满足未注册手机号登录与验证码倒计时等要求。

### 5. 统一 NIM 事件总线，根布局负责绑定，领域 store 负责归档

选择：

- 在 `app/_layout.tsx` 或独立 service 中集中绑定 NIM 登录态、连接态、消息、会话、好友申请、用户资料、群组、设置变化等事件。
- 每类事件只桥接到对应 store，不在页面里直接注册 SDK 监听器。

原因：

- 当前最小 Demo 已经把 NIM 事件放在根布局，继续沿用这个总入口更容易控制订阅与清理。
- 这样可以保证多页面共享状态一致，并且为推送点击回流、后台恢复、自动登录等跨页面能力提供统一入口。

备选：

- 每个页面按需直接监听 SDK。
  放弃原因：生命周期碎片化，容易重复订阅、遗漏取消订阅和引起跨页状态不一致。

### 6. 设备能力使用 Expo 官方模块承载

选择：

- 本地存储使用 `@react-native-async-storage/async-storage`。
- 剪贴板使用 `expo-clipboard`。
- 图片/相机权限和选择使用 `expo-image-picker`。
- 通知授权与点击回流使用 `expo-notifications`。
- 网络检测使用 `@react-native-community/netinfo` 或 Expo 兼容方案。
- 文件选择按可行性选择 `expo-document-picker`。

原因：

- 这些能力与测试用例直接相关，Expo 官方模块在当前仓库和 Expo SDK 55 下更稳定。
- 保持 Expo 体系一致，避免引入额外原生桥接复杂度。

备选：

- 使用纯 React Native 社区包替代所有 Expo 能力模块。
  放弃原因：需要更多原生配置，增加当前 Expo 管理工作流成本。

### 7. 以测试用例为行为基准，Web 参考实现只作为实现参考

选择：

- 所有 capability 的需求描述和异常分支以 `TestCases.xlsx` 为准。
- 当 H5 行为与用例冲突时，RN 实现以用例要求覆盖 H5 默认行为。

原因：

- 这是用户明确要求，也是当前仓库的实际验收标准。
- H5 项目是参考，不是 RN 版本的最终合同。

## Risks / Trade-offs

- [范围极大，单次改动容易失控] → 通过 capability spec 拆分、领域 store 分层、页面职责约束来控制复杂度。
- [短信验证码与未注册手机号弹窗依赖远端 user-center 接口] → 保持接口封装独立，失败时提供明确错误态，并在配置层隔离基础 URL 与请求头。
- [Expo 推送在不同平台、Expo Go、真机和构建产物之间行为不同] → 当前变更先保证授权、偏好、点击回流和配置入口完整，真机离线推送留作手工验证重点。
- [媒体与文件消息对权限、上传、缩略图和平台差异敏感] → 优先通过统一消息发送器和附件适配层隔离平台差异。
- [H5 NEUIKit 和 im-store-v2 存在 Web-only 假设] → 通过 RN 适配层隔离 DOM、Umi、`window`、`localStorage`、`.less` 和浏览器事件。

## Migration Plan

1. 引入新 capability 的 OpenSpec 文档，冻结行为合同。
2. 将 H5 `src/NEUIKit` 复制到当前仓库 `src/NEUIKit`，并固定 `@xkit-yx/im-store-v2`、`@xkit-yx/utils` 等基础依赖。
3. 建立 NEUIKit RN 适配边界，隔离 Web-only API 和 `.less` 样式。
4. 扩展配置和依赖，补齐登录持久化、剪贴板、媒体选择、通知和网络检测基础能力。
5. 重构路由为三栏主壳 + 子页面，页面优先从 NEUIKit 适配组件组合。
6. 先完成主链路：短信登录、会话列表、通讯录主页、我的主页、聊天详情。
7. 再补齐次级链路：好友验证、黑名单、群组设置、资料编辑、权限与推送偏好。
8. 运行 `openspec validate`、`npm run lint`、`npx tsc --noEmit`，并列出必须真机验证的权限和推送场景。

回滚策略：

- 路由和 store 变更都保持在当前仓库内，可通过 Git 回退整个 change。
- 配置与依赖调整保持最小增量，不删除现有 NIM 基础配置字段，必要时可暂时回退到最小 Demo 路径。

## Open Questions

- 当前 RN 目标是否要求在 Expo Go 内完成全部媒体和通知能力验证，还是默认以开发构建/真机验证为准。
- 数字人相关能力在 RN 中是否与普通联系人完全共用 UI，只通过数据标识区分。
- 收藏入口是否需要落为完整消息收藏功能，还是当前阶段仅提供入口和占位页即可满足当前测试范围。
