## Why

会话模块测试用例 `0251-会话列表无网络提示` 要求离线时展示提示“当前网络未连接，请检查你的网络设置”，网络恢复后提示消失。当前 React Native 会话列表虽然会展示离线提示，但文案与测试要求不一致。

## What Changes

- 将会话列表离线 banner 文案调整为 `当前网络未连接，请检查你的网络设置`。
- 保持离线时展示、网络恢复后自动消失的现有逻辑不变。

## Capabilities

### New Capabilities

### Modified Capabilities

- `conversation-list`: 补充离线 banner 的标准文案要求。

## Impact

- 受影响代码：`app/(tabs)/index.tsx`
- 受影响行为：会话列表无网络提示文案
- 无新增依赖，无接口协议变更
