## Why

合并转发发送失败时存在一条单独的内部失败分支。该分支展示了“系统异常，转发失败”，并且返回来源聊天页前没有触发批量转发的多选退出清理，导致被拉黑或群禁言等业务失败场景下提示不符合预期，且仍停留在多选页面。

## What Changes

- 合并转发发送失败时统一只提示“转发失败”。
- 合并转发发送失败返回来源聊天页时，沿用批量转发失败的多选退出清理。
- 保持逐条转发、单条转发、网络不可用等已有路径不变。

## Capabilities

### Modified Capabilities

- `chat-forwarding-and-selection`: 合并转发业务发送失败时的提示和多选退出行为。

## Impact

- Affected code: `app/chat/forward.tsx`
- Affected behavior: merged-forward failure handling from chat multi-select mode
- No API, dependency, or backend impact.
