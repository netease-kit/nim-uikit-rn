# Proposal

## Why

RN 当前创建讨论组和高级群时都使用 SDK 高级群类型，并只写 RN 私有的 `im2TeamCategory` 扩展。Android 和 iOS 原生端按 SDK 普通群类型以及 `im_ui_kit_group` 扩展标记识别讨论组，因此 RN 创建的两类群在原生端都会被识别为高级群。

## What Changes

- 对齐 Android/iOS，RN 创建讨论组和高级群时使用 SDK 普通群类型。
- RN 创建讨论组时写入原生识别的 `im_ui_kit_group` 扩展标记。
- RN 读取群类别时兼容原生 `im_ui_kit_group` 和历史 RN `im2TeamCategory` 标记。
- 对齐讨论组和高级群创建时的邀请、资料更新和扩展更新权限参数。

## Capabilities

### Modified Capabilities

- `team-create-entry`: RN 创建的讨论组/高级群需要被 Android/iOS 原生端正确识别。
- `team-settings-and-members`: RN 端需要兼容识别原生创建的讨论组。

## Impact

- Affected code: `stores/TeamStore.ts`
- Affected behavior: team creation metadata and cross-platform team-type recognition
- No backend or dependency impact.
