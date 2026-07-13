## Why

会话模块测试用例 `0254-在其他页面群聊A被解散` 要求用户不在聊天页时，群被解散后需要静默从会话列表删除该群会话。当前 React Native 只在团队解散事件后刷新群列表，没有同步刷新会话列表，因此会话项可能不会及时消失。

## What Changes

- 在全局团队解散事件处理中，同时刷新群列表和会话列表。
- 保持聊天页内已有的解散提示与退回逻辑不变。

## Capabilities

### New Capabilities

### Modified Capabilities

- `conversation-list`: 补充非聊天页场景下群解散后的静默移除要求。

## Impact

- 受影响代码：`app/_layout.tsx`
- 受影响行为：其他页面场景下被解散群的会话列表移除时机
- 无新增依赖，无接口协议变更
