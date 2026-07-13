## Why

当前 RN 聊天页中的合并转发消息、位置消息、图片消息、视频消息、文件消息，除了自身内容卡片外，还额外套了一层外部气泡背景框，导致视觉层级过重。

## What Changes

- 移除上述消息类型的外层聊天气泡背景框和外层内边距。
- 保留这些消息自身的内容卡片样式和交互行为。

## Capabilities

### Modified Capabilities

- `chat-detail`: 附件类消息和合并转发消息的外层气泡表现需要与其内容卡片分离。

## Impact

- Affected code: `src/NEUIKit/rn/chat-message-bubble.tsx`
- Affected behavior: merged-forward, location, image, video, and file message rendering
- No API, dependency, or backend impact.
