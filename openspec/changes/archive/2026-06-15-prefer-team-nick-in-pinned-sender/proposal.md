## Why

标记消息列表中的群消息发送者昵称没有按群会话上下文取群昵称，仍回退为用户昵称，和聊天页、群消息展示规则不一致。

## What Changes

- 修正标记消息列表中群消息发送者头像和昵称的 `teamId` 传参
- 让标记消息列表在群消息场景下按现有 UIKit 称谓规则优先展示群昵称

## Capabilities

### New Capabilities

无

### Modified Capabilities

- `chat-detail`: 补充标记消息列表中的群消息发送者昵称展示应遵循群昵称优先规则

## Impact

- `app/chat/pins.tsx`
