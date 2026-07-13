## Why

当前 RN Demo 只有 `expo-notifications` 的前台展示与点击处理，没有把 NIM RN SDK 的离线推送配置、前后台状态和统一 push payload 协议接起来，无法对齐 Android/iOS IMUIKit 的真机离线推送底座。现在补这层基础，是为了让后续厂商 push 和 APNs 接入有明确的运行契约，而不是继续停留在本地通知假象上。

## What Changes

- 为 NIM RN SDK 增加登录前离线推送配置入口，基于原生 device token 提供 `setOfflinePushConfig(...)` 所需插件。
- 为消息发送补充统一的 push payload 协议，至少包含 `conversationId`、`sessionId`、`sessionType`。
- 为应用生命周期补充 NIM 前后台状态同步，调用 `setAppVisibility(...)` 与 `setAppBackground(...)`。
- 为 Android 原生入口补充通知点击 payload 到 RN deep link 的桥接，统一交给 Expo Router 和现有鉴权恢复逻辑处理。
- 明确当前仓库对 iOS APNs 原生接入的限制：由于尚无 `ios/` 原生工程，本次仅补仓库内的 RN 契约和配置，不声称 APNs 底座已完成。

## Capabilities

### New Capabilities

- `nim-offline-push-foundation`: 定义 RN Demo 的离线推送配置、payload 协议、前后台状态同步和原生点击桥接要求

### Modified Capabilities

- `push-routing-and-delivery`: 补充离线推送点击路由与真机底座能力边界

## Impact

- 受影响代码：`constants/NIMConfig.ts`、`stores/NIMStore.ts`、`stores/MessageStore.ts`、`app/_layout.tsx`、`utils/notifications.ts`、新增 `utils/offline-push.ts`、Android `MainActivity.kt`
- 受影响系统：NIM RN SDK 初始化链路、Expo 通知能力、Android 原生 deep link 入口
- 外部依赖：仍依赖 `expo-notifications` 提供原生 device token；完整 iOS APNs 和 Android 厂商 SDK 接入仍需要后续原生工程补充
