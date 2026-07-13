## Why

会话模块测试用例 `0252-被邀请加入讨论组` 要求用户被邀请进群后，聊天页显示系统进组通知消息，会话列表也展示对应讨论组会话。当前 React Native 聊天页和会话列表对群通知消息统一展示为 `[通知消息]`，无法满足“进组系统消息可读”的要求。

## What Changes

- 为 React Native 侧补充团队通知消息文案解析。
- 让聊天页系统消息和会话列表最后一条预览复用同一套团队通知文案。
- 保持进群后会话通过现有 SDK 同步进入会话列表的逻辑不变。

## Capabilities

### New Capabilities

### Modified Capabilities

- `team-conversation-notifications`: 补充进组等群通知消息的人类可读文案要求。

## Impact

- 受影响代码：`utils/teamNotification.ts`、`app/chat/[id].tsx`、`app/(tabs)/index.tsx`
- 受影响行为：群通知消息在聊天页和会话列表的展示文案
- 无新增依赖，无接口协议变更
