# Proposal

## Why

RN 群聊消息发送者和 @ 选择列表当前优先展示群昵称，导致已经设置好友备注的成员仍显示群昵称。该行为与 UIKit 称谓规则和本次测试期望不一致。

## What Changes

- 将 RN 群聊消息发送者名称优先级调整为：好友备注 > 群昵称 > 个人昵称 > 账号。
- 将 RN 群聊 @ 选择列表和插入 @ 文本使用同一称谓优先级。
- 保留群昵称变更后聊天页实时刷新的能力。
- 不调整合并转发详情、转发摘要、消息归档等复用默认 UIKit 称谓逻辑的既有行为。

## Capabilities

### Modified Capabilities

- `chat-message-content`: 群聊消息发送者和 @ 候选展示名需要优先展示好友备注。

## Impact

- Affected code: `app/chat/[id].tsx`
- Affected behavior: group chat sender labels and mention candidate labels in RN
- No API, dependency, or backend impact.
