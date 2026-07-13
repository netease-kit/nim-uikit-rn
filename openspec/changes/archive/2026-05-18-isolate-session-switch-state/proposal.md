## Why

切换账号重新登录时，会话列表会短暂或持续显示上一个账号的会话数据，说明当前登录切换链路没有在新会话建立前彻底隔离旧账号的 IM 缓存与事件回流。这个问题直接影响登录态正确性，需要补充会话切换约束并修复状态清理顺序。

## What Changes

- 明确切换账号登录前必须清空旧账号的本地会话、消息、好友、群组和用户缓存。
- 明确切换账号时必须先结束旧账号 IM 登录态，再允许新账号会话进入认证壳。
- 调整登录切换实现，避免旧账号登出过程中的 SDK 事件把旧会话数据重新写回列表。

## Capabilities

### New Capabilities

### Modified Capabilities

- `auth-session-lifecycle`: 补充切换账号登录时的会话隔离和旧缓存清理要求。

## Impact

- 受影响代码：`stores/AuthStore.ts`、`stores/NIMStore.ts`、`app/_layout.tsx`
- 受影响行为：切换账号登录、登出后的会话列表与本地 IM 缓存隔离
- 无新增外部依赖，无 API 变更
