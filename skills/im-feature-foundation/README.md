# im-feature-foundation

这是一个面向新项目的 IM 功能母 skill。

它不依赖参考项目，目标是在没有现成实现的情况下，仍然能指导模型：

- 规划 IM 架构
- 拆分功能模块
- 给出核心实现路径
- 补齐测试用例

## 适合的场景

- 从零做一个聊天 / IM 产品
- 新项目中补齐登录、会话、聊天、好友、群组、设置功能
- 先做 spec，再逐步实现 IM 模块
- 需要用功能粒度推进开发，而不是一次性做整套系统

## 默认能力

这个 skill 默认会：

1. 帮你选最小功能集
2. 给出工程结构建议
3. 定义模块契约
4. 定义数据模型
5. 输出单个功能的核心实现路径
6. 补测试用例和验收标准

## 参考文件

- `references/architecture-blueprint.md`
- `references/bootstrap-checklist.md`
- `references/feature-map.md`
- `references/data-models.md`
- `references/sdk-abstraction.md`
- `references/cross-platform-adaptation.md`
- `references/code-skeleton-template.md`
- `references/code-templates/README.md`
- `references/code-templates/expo-router-rn-pack.md`
- `references/code-templates/react-router-web-pack.md`
- `references/testing-matrix.md`
- `references/delivery-workflow.md`
- `references/mvp-login-session-chat-spec.md`
- `references/validated-mvp-example.md`
- `references/validated-web-mvp-example.md`
- `references/advanced-message-features.md`
- `references/media-and-file-features.md`
- `references/relationship-and-team-extensions.md`
- `references/notification-and-preference-features.md`

## 示例触发语句

- 帮我在新项目里从零实现一个 IM 的 MVP
- 先给我规划登录、会话、聊天三个模块的实现路径和测试用例
- 不依赖参考项目，给我一份好友和群组模块的 spec
- 按功能粒度帮我做消息撤回、转发和已读回执
- 直接给我一个“登录 + 会话 + 聊天”的最小样板 spec
- 从零给我一份“消息撤回 + 转发 + 已读回执”的实现方案和测试用例
- 帮我规划图片、文件和视频消息能力
- 给我一份好友备注、黑名单、群管理功能的落地方案
- 我要做一个跨端 IM，新项目先给我目录骨架和适配策略
- 新项目已经建好了，直接给我登录、会话、聊天三条主链路的首批文件模板
- 我要在 Expo Router 项目里直接起 IM 的第一批文件
- 先给我一个已经验证过结构自洽的 IM MVP 示例
- 给我一个已经验证过结构自洽的 React Router Web IM MVP 示例
