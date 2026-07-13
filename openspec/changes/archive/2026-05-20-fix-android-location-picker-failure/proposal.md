## Why

Android 原生位置选择页在部分真机上进入后会立即提示“定位失败，可搜索地点选择位置”，即使页面仍可继续搜索并选择地点。当前实现一方面在 Activity 内硬编码高德 key，绕过了原生构建配置入口，另一方面在高德定位失败但系统定位回退尚未结束前就直接暴露失败提示，导致用户误以为页面不可用。

## What Changes

- 将 Android 原生位置选择页使用的高德 key 对齐到原生构建配置与 manifest 注入值，不再在 Activity 内重复硬编码。
- 调整 Android 原生位置选择页的定位失败提示时机，优先完成系统定位回退，仅在最终无法获得定位时才展示失败提示。
- 保持“可搜索地点选择位置”的回退能力不变，确保定位失败时仍能继续选点发送。

## Capabilities

### New Capabilities

### Modified Capabilities

- `chat-location-messages`: 细化 Android 原生位置选择页的地图 key 来源和定位失败回退表现。

## Impact

- 受影响代码：`android/app/src/main/java/com/netease/yunxin/app/im/location/NIMLocationPickerActivity.kt`
- 受影响行为：Android 原生位置选择页的定位初始化与失败提示
- 无新增依赖，无接口协议变更
