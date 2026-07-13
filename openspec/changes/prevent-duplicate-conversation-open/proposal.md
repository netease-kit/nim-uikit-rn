## Why

会话列表页快速双击同一个会话时，第一次点击触发进入聊天详情页并导致列表页失焦，现有导航锁会在失焦清理中重置。第二次点击可能因此再次执行 `router.push`，造成聊天详情页被重复打开两次。

## What Changes

- 会话列表页在开始打开会话后记录正在打开的会话。
- 页面离开期间不重置该记录，避免双击第二次点击再次打开详情页。
- 当会话列表重新聚焦时重置记录，允许用户再次进入会话。

## Capabilities

### Modified Capabilities

- `conversation-list-behavior`: 会话行点击进入聊天详情页时应防止重复导航。

## Impact

- Affected code: `app/(tabs)/index.tsx`
- Affected behavior: 会话列表点击会话进入聊天详情页的防重入逻辑
- No API or dependency changes.
