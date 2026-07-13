## Why

聊天页的文本发送和转发确认当前主要依赖页面 state 防重复提交。在 React 状态尚未完成更新的短时间窗口内，连续点击发送或确认按钮，仍可能并发进入异步提交流程，最终造成重复发送或重复转发。

## What Changes

- 为聊天文本发送增加同步互斥保护，避免连续触发同一次文本提交。
- 为转发确认增加同步互斥保护，避免同一批转发目标被重复提交。
- 补充聊天消息提交流程的幂等约束，防止后续调整页面交互时再次引入重复提交。

## Capabilities

### New Capabilities

### Modified Capabilities

- `chat-message-behavior`: 补充聊天发送与转发确认的防重复提交要求。

## Impact

- 受影响代码：`app/chat/[id].tsx`、`app/chat/forward.tsx`
- 受影响行为：聊天文本发送、聊天消息转发确认
- 无新增依赖，无外部 API 变更
