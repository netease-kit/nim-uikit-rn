## Why

离线状态下从首页搜索结果点击一个当前会话列表不存在的群聊时，搜索页只跳转到聊天详情，没有把搜索结果里的群资料写入本地会话占位。聊天详情页在本地会话缺失时只能从 conversationId 解析出 teamId，标题退化显示群 id。发送消息后，消息预览只写入 RN 本地 `conversationStore`，但首页在绑定 im-store 时只读取 im-store 会话源，导致本地占位会话仍不展示。

## What Changes

- 首页会话源在绑定 im-store 时合并 RN 本地会话占位，im-store 已有会话优先，本地缺失项作为兜底展示。
- 搜索结果进入群聊前，使用搜索结果的群名、头像和群类型写入本地会话占位。
- 聊天详情标题在本地会话缺失时从 `teamStore` 已缓存群资料兜底取群名。

## Capabilities

### Modified Capabilities

- `conversation-search-and-picker`: 离线搜索进入群聊时应保留群名并生成可见会话。
- `conversation-list-behavior`: 本地占位会话应在首页展示，直到 SDK 会话源补齐。

## Impact

- 受影响代码：`app/conversation/search.tsx`、`app/(tabs)/index.tsx`、`src/NEUIKit/rn/identity.ts`
- 受影响行为：离线搜索进入群聊、聊天标题、发送后首页会话可见性
- 不改变消息发送协议、SDK 会话存储或后端接口
