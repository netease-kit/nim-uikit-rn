## Why

RN Android 会话列表按规格应通过左滑显示“置顶/取消置顶、删除”动作。当前列表项渲染时硬编码为长按模式，Android 左滑动作入口不会启用，导致点击置顶/取消置顶无有效反馈。

## What Changes

- 会话列表按平台选择交互模式：Android 使用左滑动作，iOS 保持长按动作。
- 置顶/取消置顶成功后刷新当前会话源，确保列表顺序和按钮文案立即同步。

## Capabilities

### New Capabilities

### Modified Capabilities

- `conversation-list-behavior`: 明确 Android 左滑置顶/取消置顶动作必须生效并更新行状态。

## Impact

- 受影响代码：`app/(tabs)/index.tsx`
- 受影响行为：Android 会话列表左滑置顶/取消置顶
- 无新增依赖，无接口协议变更
