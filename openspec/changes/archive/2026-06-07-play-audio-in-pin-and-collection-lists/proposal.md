## Why

标记列表和收藏列表复用了聊天消息气泡展示语音消息，但点击语音时仍按附件 URL 调用系统打开，iOS 上会跳到浏览器或外部应用。会话详情页已经具备应用内语音播放、播放动画和结束清理能力，列表页应与其对齐。

## What Changes

- 将会话详情页的语音播放能力抽成 RN 可复用 hook。
- 标记列表点击语音消息时在当前页面播放，并驱动语音气泡播放动画。
- 收藏列表点击语音消息时在当前页面播放，并驱动语音气泡播放动画。
- 非语音消息的现有预览、媒体、文件、位置和合并转发打开行为保持不变。

## Capabilities

### Modified Capabilities

- `audio-playback`: 扩展语音消息应用内播放能力到标记列表和收藏列表。
- `message-collection`: 收藏列表语音消息点击行为对齐聊天详情页。
- `chat-message-actions-and-receipts`: 标记列表语音消息点击行为对齐聊天详情页。

## Impact

- 受影响代码：`app/chat/[id].tsx`、`app/chat/pins.tsx`、`app/user/collection.tsx`、`hooks/useMessageAudioPlayback.ts`
- 受影响行为：聊天详情、标记列表、收藏列表中的语音消息播放
