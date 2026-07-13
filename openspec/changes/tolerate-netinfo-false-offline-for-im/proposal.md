## Why

iOS 真机上删除好友会先经过 `ensureNetworkAvailable()`，该方法只依赖 `@react-native-community/netinfo`。现场现象是 NetInfo 返回离线并提示“当前网络不可用”，但 IM SDK 长连接仍然在线且可以正常发送消息，说明网络预检误判阻断了好友删除等 SDK 操作。

## What Changes

- 为统一网络判断增加可注册的兜底在线检查器。
- 在 NIMStore 初始化时注册 IM SDK 在线兜底：当 SDK 已登录且长连接 connected 时，即使 NetInfo 暂时返回离线，也允许 IM 操作继续执行。
- 保留 NetInfo 正常在线路径和真正离线时的错误提示。

## Capabilities

### Modified Capabilities

- `im-network-availability`: IM SDK 在线时，NetInfo 的 iOS 误判不应阻断好友删除等 IM 操作。

## Impact

- 受影响代码：`utils/network.ts`、`stores/NIMStore.ts`
- 受影响行为：删除好友、转发、收藏、群操作等调用 `ensureNetworkAvailable()` 的 IM 操作
- 不影响 SDK 未登录或长连接未 connected 时的离线/连接中提示
