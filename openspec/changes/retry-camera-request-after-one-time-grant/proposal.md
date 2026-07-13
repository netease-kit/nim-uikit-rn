## Why

当前 RN 相机权限链路过度依赖 `getCameraPermissionsAsync()` 返回的 `status/canAskAgain`。在部分 Android 厂商机上，用户选择“仅本次允许”并重启应用后，系统虽然会回收权限，但预读状态可能被误判为不可再次请求，导致点击相机入口时不再弹出原生权限框。

## What Changes

- 调整相机权限判断，支持 Android 临时授权在应用重启后被系统回收时再次触发原生权限请求。
- 在支持的 Android 版本上，获得相机权限后补充原生 `revokeSelfPermissionOnKill` 兼容逻辑，确保杀进程后系统撤销一次性相机授权。
- 保持首次拒绝后停留当前页面的行为，不在同一次点击链路里直接弹“去设置”提示。
- 仅在系统确实不再弹原生权限框的后续进入场景中，才回退到“请在设置页面添加相机权限”提示。

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `permission-flows`: 补充 Android 相机“仅本次允许”在应用重启后的重新请求行为。

## Impact

- 受影响代码：`utils/permissions.ts`、`android/app/src/main/java/com/netease/yunxin/app/im/MainApplication.kt`、`android/app/src/main/java/com/netease/yunxin/app/im/permission/*`
- 受影响行为：聊天页、群头像页、个人头像页等所有拍摄入口的相机权限请求链路
- 无新增依赖，无协议变更
