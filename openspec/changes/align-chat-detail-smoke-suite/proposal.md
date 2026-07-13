## Why

聊天详情页烟雾用例需要逐条按真实前后逻辑验证，而不是只看静态文案或局部组件是否存在。当前 `0460-断网聊天页面显示` 暴露出一个全局链路问题：断网时根路由守卫会把已登录用户误判为未登录并跳离聊天页，导致页面既不稳定停留，也无法展示预期的断网提示。

## What Changes

- 修正聊天详情页在断网场景下的页面稳定性，保证已有登录会话的用户不会因为瞬时断线被根布局重定向出聊天页。
- 为聊天详情页补充与 testcase 对齐的页面级网络提示，优先依据真实网络状态展示“当前网络不可用，请检查你的网络设置”。
- 建立聊天详情页烟雾修复的执行记录与任务约束，明确必须逐条验证当前用例前置条件、触发链路、修复点和复验结果。

## Capabilities

### New Capabilities

- `chat-detail-smoke-execution`: 约束聊天详情页烟雾用例按单条、修复优先、记录前后逻辑的方式执行

### Modified Capabilities

- `chat-timeline-and-history`: 调整离线聊天页稳定性要求，断网时必须停留在聊天详情页并展示离线提示，而不是被错误跳转

## Impact

- Affected code: `app/_layout.tsx`, `app/chat/[id].tsx`
- Affected workflow artifacts: `openspec/changes/align-chat-detail-smoke-suite/*`, `TestCases/10.0.0/聊天详情页/执行记录.md`
