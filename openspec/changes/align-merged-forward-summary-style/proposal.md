## Why

RN 端的合并转发消息摘要卡片在摘要行渲染上仍与 React Web 端不一致。当前 RN 将发送者和正文拆成两个并排文本节点，导致摘要行的截断、换行分配和视觉对齐容易偏离 Web 端样式。

## What Changes

- 将 RN 合并转发摘要行改为与 React Web 一致的整行文本裁剪结构。
- 对齐摘要卡片的标题与内容区间距，保持与 React Web 端一致的视觉样式。

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `chat-merged-forward-summary-style`: 定义 RN 合并转发消息摘要卡片与 React Web 对齐的显示规则。

## Impact

- Affected code: `src/NEUIKit/rn/chat-message-bubble.tsx`
- Affected specs: `openspec/changes/align-merged-forward-summary-style/specs/chat-merged-forward-summary-style/spec.md`
- No API, dependency, or backend impact.
