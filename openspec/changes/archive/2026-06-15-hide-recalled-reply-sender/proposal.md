## Why

当前 RN 回复消息在源消息已撤回、删除或不可用时，虽然正文已经显示 `该消息已被撤回或删除`，但源消息区域仍继续显示原发送者名称，和预期不一致。

## What Changes

- 调整 RN 回复预览在源消息已撤回、删除或不可用时的展示规则。
- 当源消息不可用时，回复预览只显示 `该消息已被撤回或删除`，不再显示源消息发送者名称。
- 保持源消息可用时的现有发送者和预览内容展示不变。

## Capabilities

### New Capabilities

### Modified Capabilities

- `chat-message-content`: 回复预览在源消息不可用时的回退展示规则需要收紧。

## Impact

- Affected code: `src/NEUIKit/rn/chat-message-bubble.tsx`
- Affected behavior: reply preview fallback rendering in RN chat detail and source-message related surfaces
- No API, dependency, or backend impact.
