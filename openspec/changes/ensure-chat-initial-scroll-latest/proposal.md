## Why

会话详情页当前在首次进入时并不总是稳定定位到最新消息，用户进入聊天后仍可能停在历史消息中间位置。这个问题影响基础聊天浏览体验，需要让首次渲染和切换会话后的默认定位可靠落在最新消息处。

## What Changes

- 为会话详情页增加“内容完成布局后再执行首次滚动到底”的机制。
- 保持用户手动上滑后的阅读位置不被错误重置，同时不影响新消息自动滚到底逻辑。

## Capabilities

### New Capabilities

- `chat-initial-scroll-latest`: 规定会话详情页在首次进入和切换会话后应默认定位到最新消息。

### Modified Capabilities

- None.

## Impact

- Affected code: `app/chat/[id].tsx`
- Affected UX: initial chat-detail scroll position and new-message auto-scroll behavior
- No API or dependency changes
