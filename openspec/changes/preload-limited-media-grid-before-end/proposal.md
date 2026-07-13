## Why

当前聊天页受限相册网格主要依赖 `onEndReached` 请求下一页，在快速下滑浏览时，分页边界仍可能出现停顿。

## What Changes

- 在受限相册网格中，接近列表尾部时提前请求下一页资源。
- 保持当前分页方向、勾选逻辑和底部加载态不变。

## Capabilities

### Modified Capabilities

- `chat-detail`: 受限相册网格需要在接近尾部时提前请求下一页资源，减少滚动分页边界停顿。

## Impact

- Affected code: `app/chat/[id].tsx`
- Affected behavior: limited media grid pagination smoothness in RN
- No API, dependency, or backend impact.
