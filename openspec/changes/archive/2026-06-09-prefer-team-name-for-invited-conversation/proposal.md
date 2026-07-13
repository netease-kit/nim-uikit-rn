## Why

A 创建群聊时选择 B，B 收到入群通知后，会话列表中的群会话偶尔只显示群号。原因是会话源可能先带着群 id 作为 `conversation.name`，而本地群资料稍后才同步到 `teamStore`；当前会话标题优先使用 `conversation.name`，导致后续拿到群昵称后仍被群 id 覆盖。

## What Changes

- 群会话身份展示优先使用 `teamStore` 中的群昵称和头像，再回退到会话源字段。
- 收到群创建、入群和群信息更新事件后，同时刷新群资料和会话源，推动被邀请端尽快展示群昵称。

## Capabilities

### Modified Capabilities

- `conversation-list-behavior`: 补充被邀请入群后会话列表展示群昵称的要求。

## Impact

- 受影响代码：`src/NEUIKit/rn/identity.ts`、`app/_layout.tsx`
- 受影响行为：会话列表和聊天页 header 的群会话标题/头像解析优先级，以及群事件后的资料刷新
