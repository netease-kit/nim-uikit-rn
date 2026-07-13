## ADDED Requirements

### Requirement: Chat Detail Smoke Cases Must Be Executed With Causal Verification

聊天详情页烟雾用例执行 SHALL 逐条验证前置条件、触发链路、实际页面行为和修复后的复验结果，而不是仅凭静态文案、代码存在性或局部组件判断通过。

#### Scenario: Verifying one chat-detail smoke case

- **WHEN** an agent executes a testcase under `TestCases/10.0.0/聊天详情页`
- **THEN** it MUST inspect the testcase preconditions and the code paths that control the resulting page flow
- **AND** it MUST identify whether the current failure is caused by page rendering, global routing, store state, or another upstream behavior
- **AND** it MUST re-verify the same testcase after repair before advancing to the next testcase
