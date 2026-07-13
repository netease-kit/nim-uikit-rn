## Why

当前 RN 在线状态缓存会在本机断网时把已订阅的单聊对象立即标记为离线，导致会话列表、联系人和单聊头部都丢失断网前最后一次已知状态。这与用例期望不符，也会把“当前无法同步”误显示成“对方已离线”。

## What Changes

- 断网时保留单聊对象断网前最后一次已知在线/离线状态，不再因为本机失联立即改写为离线。
- 恢复联网后重新订阅并同步当前状态；如果当前同步结果未返回某账号在线状态，再将该账号收敛为离线。
- 将 RN 在线状态缓存与可观察连接状态对齐，确保会话列表、联系人和单聊头部都能在重连后刷新到最新状态。

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `chat-user-online-status`: 调整断网与重连期间的单聊在线状态缓存规则。
- `contacts-home`: 调整好友列表断网期间的状态展示与重连后的状态收敛规则。
- `conversation-list-behavior`: 调整会话列表单聊状态在断网期间的展示与重连后的状态收敛规则。

## Impact

- 受影响代码：`src/NEUIKit/rn/user-status.ts`、`stores/NIMStore.ts`、`app/_layout.tsx`
- 受影响页面：会话列表、联系人、单聊聊天页头部
- 无新增依赖，无接口协议变更
