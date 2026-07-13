## Why

当前 RN 聊天页的文件消息统一使用扩展名文字块作为文件图标，和 Android 端按文件类型区分图标的表现不一致，文件类型辨识度较低。

## What Changes

- 将 RN 文件消息图标改为按文件类型展示不同图标。
- 复用仓库内已有的 Android 同类文件图标资源，不新增自定义视觉样式。

## Capabilities

### Modified Capabilities

- `chat-detail`: 文件消息图标需要根据文件类型展示对应资源，而不是统一文字占位。

## Impact

- Affected code: `src/NEUIKit/rn/chat-message-bubble.tsx`, `src/NEUIKit/rn/icon.tsx`
- Affected behavior: file message rendering in RN chat detail
- No API, dependency, or backend impact.
