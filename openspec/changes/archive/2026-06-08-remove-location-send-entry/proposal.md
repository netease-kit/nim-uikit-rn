# Proposal

## Why

RN 聊天详情页当前在更多面板提供发送位置消息入口。产品期望移除发送入口，但历史消息、收到的位置消息仍需要正常展示和查看。

## What Changes

- 从聊天详情页更多面板移除 `位置` 发送入口。
- 保留位置消息气泡展示、点击查看详情、地图导航、失败位置消息重发等查看/兼容能力。
- 不删除 location detail、location picker 页面和底层 message store 的位置消息兼容逻辑。

## Capabilities

### Modified Capabilities

- `chat-composer-actions`: 更多面板不再展示位置入口。
- `chat-location-messages`: 发送入口移除，查看位置消息能力保留。

## Impact

- Affected code: `app/chat/[id].tsx`
- Affected behavior: chat composer more panel send actions
- No API, dependency, message rendering, or received-location viewing impact.
