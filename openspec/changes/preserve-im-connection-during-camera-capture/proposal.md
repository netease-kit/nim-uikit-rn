## Why

RN Android 聊天页调用系统相机拍照或摄像时，React Native AppState 会短暂进入非 active 状态，当前全局生命周期同步会把该状态上报给 NIM RN runtime，导致停留相机几秒后 IM 被当成后台连接处理并断开。用户返回聊天页后发送媒体消息会命中“连接中/连接断开”发送失败提示。

## What Changes

- 为 RN `launchCameraAsync` 系统相机入口增加统一 capture lifecycle 标记，覆盖聊天页拍照和摄像流程。
- 在 NIM 前后台状态同步中识别系统相机 capture 场景，跳过这次非 active 的后台上报。
- 相机返回后发送媒体消息前等待 NIM login/connect 状态恢复，并对短暂 `illegal state` 做一次延迟重试。
- 保留真正退后台、锁屏、切换到其他应用时的 NIM 后台同步和离线推送策略。
- 增加少量日志，便于 Android 真机复验相机打开、AppState 变化和 NIM 后台同步决策。

## Capabilities

### New Capabilities

- `chat-camera-capture-connection`: 聊天页拍照/摄像期间不应因系统相机 Activity 导致 IM 断开。

### Modified Capabilities

- `nim-offline-push-foundation`: 前后台状态同步需要排除由聊天页系统相机 capture 触发的临时非 active 状态。

## Impact

- 受影响代码：`app/chat/[id].tsx`、`app/_layout.tsx`、`stores/NIMStore.ts`、`stores/MessageStore.ts`、新增 `utils/native-capture-state.ts`、新增 `utils/image-picker.ts`
- 受影响行为：RN Android 聊天页拍照、摄像后的 IM 连接保持和媒体消息发送
- 不影响相册选择、文件选择、真实退后台后的离线推送前后台同步
