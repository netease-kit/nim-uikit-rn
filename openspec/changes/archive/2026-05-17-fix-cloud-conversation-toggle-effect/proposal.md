## Why

当前 RN 设置页已经提供“是否开启云端会话”开关，也会把偏好持久化到本地；但重新登录后首页看到的会话数据并没有随之变化，说明云端会话并未真正生效。排查后发现 RN 根布局没有把当前 `nim` 实例绑定到 `im-store-v2` bridge，首页还会在 bridge 为空时回退显示旧的本地 `conversationStore` 数据，退出登录时这些旧会话缓存也没有被清空。

## What Changes

- 在 NIM 初始化完成后，把当前 `nim` 实例绑定到 RN `im-store-v2` bridge，并按当前偏好刷新对应的会话 store。
- 首页在 bridge 已绑定后，始终使用 bridge 提供的当前激活会话数据源，不再因为首屏为空而回退到旧的本地会话缓存。
- 退出登录或清理本地登录态时，同时清空本地会话、消息、群组和用户缓存，避免重新登录后残留旧模式或旧账号数据。

## Capabilities

### Modified Capabilities

- `user-setting-page`: 补充云端会话开关在重新登录后的真实生效要求。
- `conversation-list`: 补充首页会话数据源必须跟随当前云端会话模式切换的要求。
- `auth-session-lifecycle`: 补充退出登录后不得残留旧会话缓存影响下一次登录展示的要求。

## Impact

- 受影响代码：`app/_layout.tsx`、`app/(tabs)/index.tsx`、`stores/ImStoreV2Bridge.ts`、`stores/AuthStore.ts`、`stores/ConversationStore.ts`、`stores/MessageStore.ts`、`stores/TeamStore.ts`、`stores/UserStore.ts`
- 受影响行为：云端会话开关生效路径、首页会话数据源选择、登出后的缓存清理
- 无新增依赖，无接口协议变更
