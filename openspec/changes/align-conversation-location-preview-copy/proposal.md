## Why

会话测试用例 `0291-消息列表上外露的长消息的显示样式` 要求位置消息在会话列表外露时显示 `[位置消息]`。当前 React Native 会话列表仍展示 `[地理位置]`，与测试要求不一致。

## What Changes

- 将会话列表位置消息预览文案从 `[地理位置]` 调整为 `[位置消息]`。
- 保持其他消息类型预览逻辑不变。

## Capabilities

### Modified Capabilities

- `conversation-list`: 补充位置消息预览文案要求。

## Impact

- 受影响代码：`app/(tabs)/index.tsx`
- 受影响行为：会话列表位置消息外露文案
- 无新增依赖，无接口协议变更
