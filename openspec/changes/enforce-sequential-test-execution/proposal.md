## Why

当前仓库已经把测试用例作为多个页面与交互验收的重要基线，但 `AGENTS.md` 还没有明确限制 agent 在执行测试用例时的推进节奏。缺少这条规则时，agent 容易一次并行或连续推进多条用例，导致前一条尚未通过、修复未验证完成，就继续处理下一条，增加问题交叉、回归范围不清和验收记录不可信的风险。

## What Changes

- 为 agent 工作流补充“测试用例必须单次只执行一条”的规则。
- 明确每条测试用例必须在通过，或修复后重新验证通过后，才能进入下一条。
- 将该规则纳入 `agent-spec-workflow` 能力，作为仓库级验证与执行约束。

## Capabilities

### New Capabilities

### Modified Capabilities

- `agent-spec-workflow`: 补充测试用例串行执行和逐条验证闭环要求。

## Impact

- 受影响文档：`AGENTS.md`
- 受影响工作流：agent 执行测试用例、修复缺陷、回归验证的推进顺序
- 无代码行为变化，无新增依赖
