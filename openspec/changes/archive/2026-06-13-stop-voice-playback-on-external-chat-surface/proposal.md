# Proposal

## Why

RN 聊天页播放语音消息后，用户打开视频消息、大图预览、合并转发详情、会话设置或系统文件/相册选择器时，聊天页仍保留在导航栈中，语音播放器没有被停止，导致新界面上仍能听到上一条语音。

## What Changes

- 将消息语音播放 hook 暴露为可全局停止的播放控制点。
- 聊天页失焦、进入外部聊天界面、打开媒体预览、合并转发详情、会话设置、转发页、文件选择器和限权相册选择器时停止当前语音播放。
- 保留点击语音消息本身的播放/停止切换行为。

## Capabilities

### Modified Capabilities

- `chat-detail`: 聊天页语音消息播放生命周期。

## Impact

- Affected code: `hooks/useMessageAudioPlayback.ts`, `app/chat/[id].tsx`
- Affected behavior: chat voice playback, media preview navigation, settings navigation, system picker entry
- No message payload, SDK initialization, storage, or backend impact.
