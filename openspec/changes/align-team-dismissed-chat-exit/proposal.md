## Why

会话模块测试用例 `0253-在群聊聊天页面群聊解散` 要求用户停留在群聊聊天页时，如果群被解散，需要收到“当前群聊已解散”提示，并在确认后返回会话列表。当前 React Native 聊天页没有监听群解散事件，因此该用例无法通过。

## What Changes

- 在 React Native 聊天页监听当前群聊的 `onTeamDismissed` 事件。
- 命中当前群时弹出 `当前群聊已解散` 提示。
- 用户点击 `确认` 后返回会话列表。

## Capabilities

### New Capabilities

### Modified Capabilities

- `team-conversation-notifications`: 补充聊天页内群解散提示与退回列表行为。

## Impact

- 受影响代码：`app/chat/[id].tsx`
- 受影响行为：停留在群聊聊天页时的群解散反馈
- 无新增依赖，无接口协议变更
