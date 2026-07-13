# Change: 修复聊天页键盘遮挡输入框

## Why

当前聊天页在 Android 端同时启用了系统级 `softwareKeyboardLayoutMode: "resize"` 和页面内 `KeyboardAvoidingView` 的高度避让。输入框聚焦后，这两层避让会叠加，导致底部输入区域被键盘压住一部分，出现输入框只露出一半的问题。

## What Changes

- 调整聊天详情页的键盘避让策略。
- iOS 继续使用页面内 `KeyboardAvoidingView` 配合导航栏高度偏移。
- Android 聊天页改为仅依赖系统 `resize`，避免重复抬升底部输入区。

## Impact

- 影响聊天详情页输入框、表情面板、更多面板与键盘切换时的底部布局。
- 不影响登录页和其他仍需页面内键盘避让的场景。
