## Why

当前仓库缺少对 agent skill 来源范围的明确约束，容易导致不同 agent 在执行任务时使用仓库未认可的外部 skill，带来流程不一致和不可审计的问题。需要把 skill 来源限制沉淀为仓库级规则。

## What Changes

- 在 `AGENTS.md` 明确：只能使用平台内置 skill，以及 `skills.md` 中列出的白名单 skill。
- 新增仓库根目录 `skills.md`，作为可用非内置 skill 的白名单文件。
- 白名单初始为空，未列入 `skills.md` 的非内置 skill 一律不得使用。

## Capabilities

### Modified Capabilities

- `agent-workflow`: 收敛 agent skill 的允许来源。

## Impact

- 受影响文件：`AGENTS.md`、`skills.md`
- 受影响行为：仓库内 agent 的 skill 选择和执行边界
- 无新增依赖，无运行时代码变更
