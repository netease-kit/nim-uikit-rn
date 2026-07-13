## Why

当前聊天历史页只有手动点击“加载更早消息”才会继续分页，连续滚动查看历史时会在分页边界形成停顿。

## What Changes

- 在聊天历史页中，接近列表顶部时自动预取更早消息。
- 保留现有手动“加载更早消息”入口作为兜底。

## Capabilities

### Modified Capabilities

- `chat-history`: 历史记录页在接近顶部时需要提前请求更早消息，减少分页边界等待。

## Impact

- Affected code: `app/chat/history.tsx`
- Affected behavior: chat history pagination smoothness in RN
- No API, dependency, or backend impact.
