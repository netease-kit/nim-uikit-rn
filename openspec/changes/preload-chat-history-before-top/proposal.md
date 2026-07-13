## Why

当前 RN 聊天页仅在消息列表几乎贴到顶部时才请求更早消息，快速连续上滑时容易在分页边界出现等待和卡顿。

## What Changes

- 在聊天页消息列表中，将更早消息的请求时机从“到达顶部”提前到“接近顶部”。
- 保持现有消息顺序、分页方向和提示行为不变。

## Capabilities

### Modified Capabilities

- `chat-detail`: 聊天页滚动到历史分页边界前，需要提前请求更早消息以减少滚动停顿。

## Impact

- Affected code: `app/chat/[id].tsx`
- Affected behavior: chat history pagination smoothness in RN
- No API, dependency, or backend impact.
