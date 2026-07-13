# Proposal

## Why

RN 聊天页当前支持在 P2P 中 @ 数字人，并且群聊 @ 列表会额外插入数字人候选。产品期望移除该能力，避免数字人在 @ 选择器中出现。

## What Changes

- P2P 聊天输入 `@` 不再打开数字人 @ 选择列表。
- 群聊 @ 选择列表仅展示 `@所有人` 和普通群成员，即使数字人账号本身是群成员也要过滤。
- 群聊 @ 选择列表和插入 @ 文本忽略好友备注，继续优先展示群昵称。
- 保留数字人会话识别、头像/资料页、非好友提示豁免等非 @ 能力。

## Capabilities

### Modified Capabilities

- `chat-message-content`: @ 选择器不再支持数字人候选。

## Impact

- Affected code: `app/chat/[id].tsx`
- Affected behavior: chat mention selector candidates and mention display names in RN
- No API, dependency, or backend impact.
