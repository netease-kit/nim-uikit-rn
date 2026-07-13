## Why

标记列表可能把同一条消息重复展示，且滑动时复杂消息气泡被列表回收后容易闪烁或短暂白屏，影响查看已标记消息。

## What Changes

- 标记列表按消息引用和最终消息 key 去重。
- 标记列表使用稳定唯一 key，避免重复 key 导致列表复用错乱。
- 标记列表禁用会引发复杂气泡闪烁的裁剪回收策略。

## Impact

- `stores/MessageStore.ts`
- `app/chat/pins.tsx`
