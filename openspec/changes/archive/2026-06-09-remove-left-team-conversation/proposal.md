## Why

退出群聊或讨论组后，会话列表偶现残留该会话，并因为本地群资料已被删除而展示群 id。解散群聊也偶尔出现相同问题。现有裁剪逻辑依赖本地 `teamStore` 中能查询到无效群资料，但退出/解散事件到达时群资料可能已经被删除或尚未标记无效，后续会话刷新又会把本地会话重新合入列表。

## What Changes

- 对已退出、已解散或被移出的群会话建立本地排除标记。
- 会话列表同步、UIKit 桥接显示和本地会话合并时过滤这些群会话，避免刷新后重新出现。
- 从通讯录、搜索或重新加入群聊显式打开该群时，允许恢复对应会话。

## Capabilities

### Modified Capabilities

- `conversation-list-behavior`: 补充退出/解散群聊后会话列表移除和刷新不回流要求。

## Impact

- 受影响代码：`stores/ConversationStore.ts`、`stores/ImStoreV2Bridge.ts`、`app/_layout.tsx`、`app/chat/[id].tsx`、`app/team/settings.tsx`
- 受影响行为：退出群聊/讨论组、解散群聊、被动收到群离开/解散事件后的会话列表展示
