## Why

会话模块测试用例 `0271-防诈骗提示小黄条` 要求在消息页搜索入口下方、无网提示和会话列表上方展示黄色防诈骗提示条。当前 React Native 会话页缺少这条安全提示，因此该用例无法通过。

## What Changes

- 在 React Native 会话页会话列表头部增加黄色防诈骗提示条。
- 提示条位置放在搜索区域下方、无网提示上方。
- 提示文案与 UIKit H5 基线保持一致。

## Capabilities

### New Capabilities

### Modified Capabilities

- `conversation-list`: 补充防诈骗黄条展示位置与文案要求。

## Impact

- 受影响代码：`app/(tabs)/index.tsx`
- 受影响行为：消息页顶部安全提示展示
- 无新增依赖，无接口协议变更
