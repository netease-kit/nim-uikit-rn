## Why

当前回复引用源消息不可用时，RN 展示的是“回复的原消息不存在”。需求要求在以下三类场景统一展示更准确的提示“该消息已被撤回或删除”：

- 原消息被撤回
- 原消息被删除
- 引用源消息未拉取到本地

## What Changes

- 统一回复引用源消息不可用时的文案。
- 让消息气泡里的引用预览和回复草稿区都使用相同提示。
- 不改变引用点击、消息定位或 threadReply 数据解析逻辑。

## Capabilities

### Modified Capabilities

- `chat-message-content`: 回复引用源消息不可用时使用统一的撤回/删除提示文案。

## Impact

- Affected code: `utils/app-language.ts`
- Affected behavior: reply-source-unavailable copy in chat detail and chat bubbles
- No API or dependency changes.
