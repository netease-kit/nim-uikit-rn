## Why

RN 收藏列表当前只查询 `collectionType: 1`，而 Android/iOS 原生端收藏消息使用 `messageType + 1000` 作为收藏类型。RN 页面还只识别 RN 自己写入的 `messageRefer/preview` JSON，不能解析原生端写入的 `{ message, conversationName, senderName, avatar }` 收藏数据，因此原生端收藏的消息不会在 RN 收藏列表中显示。

## What Changes

- 收藏列表查询全部收藏类型，而不是只查询 RN 自定义 type 1。
- RN 新增收藏按原生 `messageType + 1000` 类型写入，并用消息服务端 ID 作为去重 ID。
- 收藏数据解析同时兼容 RN 旧格式和 Android/iOS 原生格式。
- 原生格式中的序列化消息优先反序列化为 `V2NIMMessage`，用于收藏列表消息气泡展示和打开/转发。

## Capabilities

### Modified Capabilities

- `message-collection`: 收藏列表应展示其他端收藏的消息。

## Impact

- 受影响代码：`stores/CollectionStore.ts`、`app/user/collection.tsx`
- 受影响行为：我的 > 收藏列表、收藏状态判断、收藏/取消收藏去重
- 不影响聊天消息收发、普通会话列表和非收藏页面
