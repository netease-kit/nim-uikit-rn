## Why

聊天消息多选底部操作栏里，RN 当前把“合并转发”和“逐条转发”都渲染成同一个转发图标，并且选中消息后通过通用工具栏 active 状态给图标加蓝色高亮。Android、iOS 原生端多选底部栏使用三个独立操作图标，启用态不是蓝色 tint。

## What Changes

- 将 RN 多选底部栏的合并转发、逐条转发、删除图标对齐原生 normal 样式资源。
- 多选底部栏不再使用通用工具栏蓝色 active tint，高亮只通过是否可点控制透明度。
- 修复多选态下标记消息的背景层覆盖选择框，确保标记消息仍显示并可点击选择框。
- 移除 RN Android 多选未选中框内部的阴影效果，保持原有尺寸不变。
- 保持现有多选转发、删除行为和限制逻辑不变。

## Capabilities

### Modified Capabilities

- `chat-forwarding-and-selection`: 补齐多选底部转发操作栏图标和颜色对齐要求。

## Impact

- 受影响代码：`app/chat/[id].tsx`、`src/NEUIKit/rn/chat.tsx`、`src/NEUIKit/rn/chat-message-bubble.tsx`、`src/NEUIKit/rn/icon.tsx`
- 受影响资源：`src/NEUIKit/static/icons/icon-multiselect-*.png`
- 受影响行为：聊天多选底部操作栏视觉样式
