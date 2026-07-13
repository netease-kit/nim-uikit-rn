## Why

会话测试用例 `0300-多端登陆会话列表同步` 要求一端执行置顶/取消置顶后，另一端会话列表状态同步。当前单聊设置页和群设置页的“聊天置顶”仍直接调用本地 `conversationStore.toggleStickTop`，在云会话模式下会落到本地会话服务，无法保证多端同步。

## What Changes

- 单聊设置页和群设置页在云会话模式下优先使用云 `conversationStore` 执行置顶/取消置顶。
- 仅在云会话 store 不可用时回退到本地 `conversationStore.toggleStickTop`。

## Capabilities

### Modified Capabilities

- `session-settings`: 补充云会话模式下置顶操作的执行路径要求。
- `team-settings`: 补充云会话模式下置顶操作的执行路径要求。

## Impact

- 受影响代码：`app/session/p2p-settings.tsx`、`app/team/settings.tsx`
- 受影响行为：设置页触发的会话置顶/取消置顶多端同步
- 无新增依赖，无接口协议变更
