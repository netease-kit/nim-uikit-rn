## Why

聊天页的多选状态由来源聊天页面本地维护。当前批量转发进入选择会话页后，无论转发成功还是失败，返回聊天页时都没有清理来源页的多选状态，导致用户仍停留在多选模式。

## What Changes

- 为批量转发结果返回来源聊天页增加一次性退出多选信号。
- 在批量转发成功或失败返回后，自动退出来源聊天页的多选状态。
- 保持单条转发和其他聊天页返回路径不受影响。

## Capabilities

### Modified Capabilities

- `chat-detail`: 批量转发完成或失败返回聊天页后，需要自动退出多选状态。

## Impact

- Affected code: `app/chat/[id].tsx`, `app/chat/forward.tsx`, `stores/ForwardStore.ts`
- Affected behavior: batch forward return flow from chat detail
- No API, dependency, or backend impact.
