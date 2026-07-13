## Why

RN 当前仍有大量通知类系统弹窗，用户只能点击一个确认按钮关闭。这类反馈会阻断当前操作流，且与已封装的跨端 toast 能力不一致。

## What Changes

- 将通知类 `Alert.alert` 替换为既有 `toast` 封装能力。
- 保留二次确认类、权限跳转类、操作选择类系统弹窗。
- 为原 `Alert.alert(title, message)` 场景提供统一的 alert-toast 文案拼接方法。

## Capabilities

### Modified Capabilities

- `native-toast-feedback`: 通知类反馈必须使用共享 toast，不再使用单按钮系统弹窗。

## Impact

- Affected code: RN screens under `app/`, UIKit RN utilities, shared toast utility
- Affected behavior: notification-only feedback presentation
- Confirmation dialogs and multi-action sheets are not changed.
