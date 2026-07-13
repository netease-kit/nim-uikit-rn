## Why

会话列表当前会残留已经解散、被移出或不再有效的群聊会话，用户点击后会进入一个无法正常工作的详情页。其他端已经对这类无效群会话做了自动删除或进入拦截，RN 需要补齐同样的保护。

## What Changes

- 在会话列表同步和团队事件处理中自动移除无效的群聊会话。
- 在用户点击会话列表中的群聊前，拦截已失效的团队会话，避免进入后再报错。
- 保留聊天页现有的“群已解散/已不在群里”提示与回退逻辑，但要求列表层优先收敛无效会话。

## Capabilities

### New Capabilities

### Modified Capabilities

- `conversation-list-behavior`: 补充无效群会话必须从列表移除且不得继续导航进入的要求。
- `team-conversation-notifications`: 补充当前账号离开、被踢出或群解散后，会话列表与聊天路由的联动收敛要求。

## Impact

- 受影响代码：`app/(tabs)/index.tsx`、`app/_layout.tsx`、`stores/ImStoreV2Bridge.ts`、`stores/ConversationStore.ts`、`app/chat/[id].tsx`
- 受影响行为：群聊解散、退群、被踢后会话列表清理和群聊进入路径
- 无新增依赖，无外部 API 变更
