# im2-feature-implementation

这个 Skill 用来把 `im2-rn-demo` 当前仓库里“一个功能通常如何实现”提炼出来，并复用为后续功能开发标准。

适合的请求：

- 按当前项目的方式实现某个功能
- 先看当前仓库里类似功能怎么做的
- 先给某个功能写 spec
- 参考旧项目把某个模块迁到当前仓库
- 给出当前仓库中的核心实现路径和测试用例
- 按当前 route/store/service 边界拆分开发步骤

## 默认输出

触发后，默认至少输出这些内容：

- 功能说明
- 核心实现路径
- 实施步骤
- 测试用例
- 验收标准
- 风险与依赖

## 仓库内资料优先级

推荐按这个顺序取事实：

1. `AGENTS.md`
2. `ARCHITECTURE.md`
3. 当前仓库测试用例
4. 当前仓库真实代码
5. 当前仓库 Spec / 设计文档
6. 参考项目实现

如果测试用例与参考实现冲突，以测试用例为准。
如果参考实现与当前仓库边界冲突，以当前仓库边界为准。

## 配套模板

- `references/spec-template.md`
- `references/testcase-template.md`
- `references/project-implementation-map.md`
- `references/login-implementation.md`
- `references/conversation-implementation.md`
- `references/chat-implementation.md`
- `references/friend-implementation.md`
- `references/team-implementation.md`
- `references/settings-implementation.md`

## 示例触发语句

- 先看当前仓库里登录是怎么实现的，再告诉我短信登录应该怎么接
- 先给“消息转发”功能写 spec，至少包含当前仓库中的核心实现路径和测试用例
- 参考旧项目，把“群公告”功能迁到当前仓库，先给最小实现方案
- 按当前项目的 route/store 边界拆一下“好友备注”，给出改动路径和测试点
