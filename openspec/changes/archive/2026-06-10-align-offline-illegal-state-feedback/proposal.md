## Why

当前 RN 端部分页面在离线操作时会透出 SDK 的 `illegal state` 或错误码 `190002`，而不是统一的断网提示。直接全局把该错误硬映射为断网会误伤非网络场景，因此需要一个仅在确认离线时生效的安全兜底。

## What Changes

- 为共享错误文案归一化增加“确认离线后再映射”的安全兜底。
- 当错误为 `illegal state` 或 `190002` 且当前网络状态缓存确认离线时，统一展示 `当前网络异常，请检查你的网络设置`。
- 保持非离线场景下的 `illegal state` 原始语义，不将其无条件改写为网络异常。

## Capabilities

### New Capabilities

### Modified Capabilities

- `native-toast-feedback`: 补充共享 toast 错误文案在确认离线时对 `illegal state` / `190002` 的安全归一化要求。

## Impact

- 受影响代码：`utils/error-message.ts`、`utils/network.ts`、`src/NEUIKit/common/utils/toast.native.ts`、`app/team/settings.tsx`、`app/chat/pins.tsx`、`app/user/collection.tsx`
- 受影响行为：共享 toast 与团队设置、消息 PIN、收藏等高频离线操作在离线场景下的错误提示内容
- 无新增依赖，无接口协议变更
