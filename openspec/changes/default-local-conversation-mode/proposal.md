## Why

当前应用首装后默认启用了云端会话，但产品预期是默认使用本地会话，只有用户在设置页显式打开后才切换为云端会话。由于默认值配置错误，未配置过偏好的新安装用户会直接进入云端会话模式。

## What Changes

- 将云端会话开关的默认值从开启改为关闭，使应用首装默认使用本地会话。
- 保持设置页中的云端会话开关、持久化逻辑和重新登录生效机制不变，只修正未持久化时的默认模式。

## Capabilities

### New Capabilities

### Modified Capabilities

- `user-setting-page`: 补充首装或未持久化偏好时云端会话开关默认关闭，应用默认使用本地会话。

## Impact

- 受影响代码：`constants/NIMConfig.ts`、`stores/PreferenceStore.ts`、`stores/NIMStore.ts`
- 受影响行为：应用首装后的默认会话模式，以及未持久化偏好时的云端会话默认值
- 无新增依赖，无接口协议变更
