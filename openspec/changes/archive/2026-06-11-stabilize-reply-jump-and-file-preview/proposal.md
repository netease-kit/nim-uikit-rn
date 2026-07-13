## Why

当前回复引用区有两个不符合预期的行为：

- 当被引用原消息已撤回或已删除时，点击引用区域仍可能滚动到原消息旧位置
- 当回复文件消息时，引用预览没有按预期展示 `[文件消息]`

这会让引用交互和引用预览都偏离测试预期。

## What Changes

- 只有在引用源消息仍可用且未撤回时，点击引用区域才允许跳转。
- 当引用源消息缺失、已撤回或已删除时，点击引用区域保持原地不动。
- 文件消息作为引用源时，引用预览统一展示 `[文件消息]`。

## Capabilities

### Modified Capabilities

- `chat-message-content`: 引用预览跳转和文件消息预览文案与原消息可用性保持一致。

## Impact

- Affected code: `src/NEUIKit/rn/chat-message-bubble.tsx`
- Affected behavior: reply preview jump gating and file-message reply preview copy
- No API or dependency changes.
