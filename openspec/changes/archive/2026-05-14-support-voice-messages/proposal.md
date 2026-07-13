## Why

聊天页当前已经有语音入口和语音消息展示基线，但 Expo RN 侧还停留在“暂未支持”提示，不能录制、发送或在应用内播放语音消息。需要补齐 RN 端语音消息能力，并复用现有 NIM V2 消息发送链路和 UIKit 气泡样式。

## What Changes

- 聊天输入栏语音模式支持录音、停止并发送语音消息。
- MessageStore 增加语音消息发送方法，并在重发语音消息时保留原音频时长。
- 语音消息点击后使用 Expo 音频播放器在应用内播放或停止当前语音。
- RN 语音消息气泡展示语音图标、时长、发送中和播放中状态。

## Capabilities

### New Capabilities

- `chat-voice-messages`: 规定会话详情页应支持录制、发送、展示、播放和重发语音消息。

### Modified Capabilities

- None.

## Impact

- Affected code: `app/chat/[id].tsx`, `stores/MessageStore.ts`, `src/NEUIKit/rn/chat-message-bubble.tsx`, `app.json`
- Affected UX: chat composer voice mode, chat message bubble playback
- Dependencies: uses existing `expo-audio` and its config plugin for microphone permission metadata
