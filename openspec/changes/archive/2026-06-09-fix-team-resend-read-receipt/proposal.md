## Why

群聊消息发送失败后重发成功，聊天页需要继续展示并更新该消息的已读未读统计，并且点击回执图标应进入已读未读详情。当前重发路径会用旧失败消息的本地标识替换展示气泡，但群消息回执可能按重发后的新消息标识返回，导致回执缓存读取失败，图标统计不更新，详情入口也可能无响应。

## What Changes

- 群消息回执缓存按 `messageClientId` 和 `messageServerId` 建立别名，兼容重发成功后本地展示消息保留旧 clientId 的场景。
- 重发成功后主动刷新该群消息的已读未读回执统计。
- 群消息回执图标只要有可查询消息标识即可点击进入详情，不再依赖当前本地统计是否已经返回。

## Capabilities

### Modified Capabilities

- `chat-message-read-receipt`: 补充群消息重发后的回执刷新、展示和详情跳转要求。

## Impact

- 受影响代码：`stores/MessageStore.ts`、`src/NEUIKit/rn/chat-message-bubble.tsx`
- 受影响行为：群聊发送失败消息重发成功后的已读未读统计刷新和图标点击详情入口
