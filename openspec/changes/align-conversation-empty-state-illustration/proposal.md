## Why

会话模块测试用例 `0231-会话列表无会话` 要求无会话时展示“占位图 + 暂无会话”。当前 React Native 的共享空态组件 `UIKitEmptyState` 只有文案，没有占位图，因此会话列表空态不满足测试要求。

## What Changes

- 为共享 `UIKitEmptyState` 增加默认空态占位图展示。
- 保持现有标题、副标题和调用方式不变。

## Capabilities

### New Capabilities

### Modified Capabilities

- `conversation-list`: 补充无会话空态需要展示占位图和标题文案。

## Impact

- 受影响代码：`src/NEUIKit/rn/components.tsx`
- 受影响行为：会话列表及其他复用该空态组件的页面视觉空态展示
- 无新增依赖，无接口协议变更
