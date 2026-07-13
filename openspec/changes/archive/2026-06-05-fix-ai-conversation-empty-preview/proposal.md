## Why

数字人会话在会话列表中显示 `暂无消息`，但进入对应聊天详情页后可以看到历史消息。列表预览和详情页消息状态不一致，会误导用户判断数字人是否已有对话内容。

## What Changes

- 当会话源缺少 `lastMessage`，但聊天详情消息缓存中已有该会话消息时，会话列表使用本地最后一条消息生成预览文案和时间。
- 保持 SDK/会话源已有 `lastMessage` 的优先级，不覆盖正常同步到的会话预览。
- 适用于数字人等 P2P 会话，也兼容其他已加载本地消息但列表预览缺失的会话。

## Capabilities

### New Capabilities

### Modified Capabilities

- `conversation-list-behavior`: 补充列表预览缺失时必须与已加载聊天详情消息保持一致的要求。

## Impact

- 受影响代码：`app/(tabs)/index.tsx`
- 受影响行为：会话列表的最后一条消息预览和时间展示
- 无新增依赖，无外部 API 变更
