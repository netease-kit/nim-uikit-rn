## Why

申请加入不需要同意的群组后，应用会立即进入群聊页。此时 SDK 的群资料、成员关系和消息同步可能还处于短暂未完成状态，聊天页会把临时的无权限/成员不存在错误误判为群已解散或用户已离开，导致弹窗并清除刚加入的会话。

## What Changes

- 免同意入群成功后记录短时“刚加入群组”状态。
- 聊天页在该短时窗口内忽略由初始化查询/历史消息同步触发的临时群不可用错误，不弹出“当前群聊已解散或你已不在该群聊”。
- 真实的群解散、主动/被动离开事件仍立即弹出并清理会话，不受短时保护影响。

## Capabilities

### New Capabilities

### Modified Capabilities

- `team-conversation-unavailable-feedback`: 调整刚加入群组后的临时不可用错误处理，避免误弹和误删会话。

## Impact

- `app/team/join.tsx`
- `app/chat/[id].tsx`
- `stores/TeamStore.ts`
