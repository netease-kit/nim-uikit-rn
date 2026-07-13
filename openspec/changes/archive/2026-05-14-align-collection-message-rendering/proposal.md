## Why

收藏页当前只展示收藏载荷里的摘要和类型标签，图片、视频、文件、位置、合并转发等消息与会话详情页里的气泡展示不一致。用户从聊天页收藏消息后，在收藏页看到的内容形态应保持同一套消息展示体验。

## What Changes

- 收藏页加载收藏列表后解析对应原消息，并优先使用会话详情页同源的消息气泡展示收藏内容。
- 抽取会话详情页消息气泡为 RN UIKit 共享组件，聊天详情和收藏页复用同一套内容渲染、附件卡片、头像、昵称和系统消息样式。
- 收藏页保留来源、取消收藏、转发等收藏操作区；在原消息不可用时继续使用收藏摘要作为兜底展示。
- 收藏页中的消息气泡不展示已读回执、重发、多选、重新编辑等会话详情专属交互。

## Impact

- Affected code: `src/NEUIKit/rn/chat-message-bubble.tsx`, `app/chat/[id].tsx`, `app/user/collection.tsx`
- Affected specs: `message-collection`
- Runtime behavior: 收藏页进入时会额外按收藏引用拉取原消息以复用真实消息渲染。
