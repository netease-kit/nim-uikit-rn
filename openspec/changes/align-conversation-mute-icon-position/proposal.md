## Why

当前 React Native 会话列表将免打扰图标放在标题行中，和目标布局不一致。需求要求免打扰图标显示在时间下面、右侧对齐，并且图标尺寸与描述文字字号保持一致。

## What Changes

- 调整会话列表行右侧信息区布局。
- 将免打扰图标从标题行移到时间下方。
- 让免打扰图标右对齐，并将图标尺寸对齐到描述文字字号。

## Capabilities

### Modified Capabilities

- `conversation-list`: 细化免打扰会话的右侧信息区布局。

## Impact

- 受影响代码：`src/NEUIKit/rn/components.tsx`
- 受影响行为：会话列表免打扰图标位置与尺寸
- 无新增依赖，无接口协议变更
