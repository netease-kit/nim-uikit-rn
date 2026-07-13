---
name: im-feature-foundation
description: 面向全新项目，从零到一规划和实现 IM 产品功能的基础母 skill。只要用户希望在一个新项目中开发 IM 能力，或提到“从零实现聊天/会话/好友/群组/消息/通知功能”“不依赖参考项目搭建 IM 功能”“先出功能 spec 再逐步实现 IM 模块”“按功能粒度开发 IM 产品并补齐测试用例”，都应主动使用这个 skill。输出至少必须包含该功能或模块的核心实现路径和测试用例，并且在缺少现成代码时先定义项目架构、模块契约和数据模型。
compatibility:
  tools:
    - exec_command
    - apply_patch
  assumptions:
    - 可用于全新项目，也可用于已有项目的 IM 能力补齐
    - 不依赖参考项目即可工作
---

# IM Feature Foundation

这是一个跨项目的 IM 功能母 skill。

它的职责不是复述某个仓库现状，而是帮助模型在没有参考项目的情况下，仍然能：

- 定义 IM 产品的功能边界
- 规划最小可落地的工程结构
- 按功能粒度推进实现
- 为每个功能补齐测试用例和验收口径

## 何时使用

出现以下任一类请求时，直接使用本 skill：

- “在新项目里从零实现 IM 功能”
- “帮我搭一个聊天/消息/会话系统”
- “先给 IM 模块写 spec，再逐步实现”
- “我要做登录、会话、聊天、好友、群组这些能力”
- “没有参考项目，直接告诉我这些功能怎么开发”
- “按功能粒度开发 IM 产品，并补齐测试用例”

如果用户只说“做一个 IM”而没有更多上下文，也要使用本 skill，并先收敛成一个最小功能集。

## 总体工作方式

优先按以下顺序推进，而不是直接跳到某个页面实现：

1. 明确产品范围
2. 选择最小功能集
3. 定义架构蓝图
4. 定义模块契约和数据模型
5. 为单个功能输出核心实现路径
6. 补测试用例和验收标准
7. 如用户要求落地，再进入实现

## 默认资料读取顺序

如果仓库内已有材料，按下面顺序取事实：

1. 用户明确要求
2. 测试用例文档
3. 已有 spec / PRD / 设计文档
4. 当前项目代码
5. 本 skill 内置 reference

如果没有现成代码和文档，就以本 skill 的 reference 作为默认基线。

## 功能分层基线

默认把 IM 系统拆成以下功能层：

- 鉴权层：登录、登出、会话恢复、账号态
- 会话层：会话列表、未读、置顶、免打扰、删除
- 聊天层：消息列表、发送、撤回、转发、pin、回执、历史
- 联系人层：好友、申请、备注、黑名单
- 群组层：建群、群资料、群成员、群设置、退群/解散
- 设置层：通知、外观、开关项、资料、关于、收藏
- 基础设施层：路由、状态管理、SDK/接口适配、存储、权限、网络

如果用户的目标只是做 MVP，优先给出最小功能集，不要默认一次性上完整功能。

## 输出要求

除非用户明确指定别的格式，否则输出必须包含这些部分：

## 功能说明

- 功能名称
- 目标
- 适用范围
- 非范围

## 核心实现路径

1. 入口
2. 状态流转
3. 数据来源与写回
4. UI/交互更新
5. 异常与边界处理

## 模块契约

- 页面/路由职责
- 状态层职责
- 服务层职责
- 工具层职责

## 实施步骤

- 用 3-7 步说明最小落地顺序

## 测试用例

- 正常流程
- 边界情况
- 异常流程
- 回归检查

## 验收标准

- 可观察结果
- 不通过条件

## 风险与依赖

- 外部依赖
- 技术风险
- 兼容性风险

## 新项目默认流程

当用户没有给现成项目结构时，按这个顺序工作：

1. 先用 `references/architecture-blueprint.md` 定义工程骨架
2. 再用 `references/bootstrap-checklist.md` 确定从 0 到 1 的启动顺序
3. 再用 `references/feature-map.md` 选定功能范围
4. 再用 `references/data-models.md` 明确核心实体
5. 再用 `references/sdk-abstraction.md` 定义 SDK / 接口适配层
6. 如需跨端方案，补读 `references/cross-platform-adaptation.md`
7. 如需直接起代码骨架，补读 `references/code-skeleton-template.md`
8. 如需直接起首批文件，补读 `references/code-templates/README.md` 和相关模板
   如果已明确技术栈，优先读取对应起步包
9. 如用户要一个现成起步方案，优先参考 `references/mvp-login-session-chat-spec.md`
10. 最后按单个功能输出实现路径和测试用例

不要在没有架构和数据模型的情况下直接开始大面积写页面。

## Spec 规则

如果用户要求“先落 spec”，优先按 `references/delivery-workflow.md` 和 `references/testing-matrix.md` 输出 spec 级内容。

Spec 至少要包含：

- 背景
- 用户故事
- 功能范围 / 非范围
- 模块契约
- 核心实现路径
- 数据模型影响
- 测试用例
- 验收标准

## 实现规则

当用户已经要求开发功能时：

- 不停留在抽象分析
- 直接先给最小架构和功能落点
- 再给单个功能的落地步骤
- 如果仓库已有代码，优先适配现有边界
- 如果仓库没有代码，先创建稳定的模块契约

## 测试设计规则

测试用例不能只写“成功/失败”，至少覆盖：

- 用户主路径
- 空数据
- 非法输入
- SDK / 接口失败
- 网络异常
- 权限不足
- 刷新或重进后的状态
- 相邻模块回归影响

如果用户没有测试材料，优先使用 `references/testing-matrix.md` 里的功能矩阵补齐。

## 参考文件

按需读取：

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

## 低质量输出警戒

避免以下问题：

- 只有页面建议，没有状态和服务层落点
- 没有数据模型
- 没有测试用例
- 直接把所有功能混成一个大任务
- 没有主路径 / 边界 / 异常拆分
- 没有说明为什么模块要这样划分

## 示例

**示例 1：**
输入：我要在一个全新的 React Native 项目里从零实现聊天、会话和登录功能，先给我最小实现方案。

输出至少应包含：

- MVP 功能范围
- 工程结构建议
- 登录、会话、聊天的模块契约
- 每个模块的核心实现路径
- 登录、会话列表、聊天发送的测试用例

**示例 2：**
输入：先别写代码，给我一份“消息撤回”功能 spec，不依赖任何参考项目。

输出至少应包含：

- 撤回功能边界
- 消息状态变化模型
- 页面、状态层、服务层职责
- 正常撤回、超时撤回、权限不足、刷新回显等测试用例

**示例 3：**
输入：帮我规划一个 IM 产品的好友和群组模块，从 0 到 1 落地，并给出测试点。

输出至少应包含：

- 好友与群组的功能清单
- 数据模型
- 模块职责划分
- 实施顺序
- 对应测试矩阵

**示例 4：**
输入：我要做一个跨端 IM，新项目先给我目录骨架和跨端适配策略。

输出至少应包含：

- 工程目录建议
- 跨端 adapter 列表
- 主模块落点
- 基础测试面

**示例 5：**
输入：新项目已经建好了，你直接给我登录、会话和聊天首批文件模板。

输出至少应包含：

- service 模板
- store 模板
- page 模板
- 三条主链路的最小调用关系

**示例 6：**
输入：我要在 Expo Router 项目里做 IM，直接给我第一批文件模板和最小路由关系。

输出至少应包含：

- Expo Router 目录建议
- login / conversations / chat 页面模板
- Auth / Session / Message 的 store/service 模板
- 最少验证步骤
