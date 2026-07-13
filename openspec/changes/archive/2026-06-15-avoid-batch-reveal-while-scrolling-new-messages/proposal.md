## Why

用户查看历史消息时收到多条新消息，手动向下滑动到第一条新消息附近时，聊天页会把整批 deferred 新消息一次性释放出来，导致“x条新消息”的数字不会随着滚动逐步减少，体验过于突兀。

## What Changes

- 保留“x条新消息”提示和快捷到底入口
- 将手动滑动接近最新消息位置时的 deferred 新消息释放逻辑改为按滚动逐步释放
- 让“x条新消息”的数字随着滚动查看逐步减少，而不是一次性跳变

## Capabilities

### New Capabilities

无

### Modified Capabilities

- `chat-detail`: 补充历史浏览时手动滑动查看新消息的释放行为

## Impact

- `app/chat/[id].tsx`
