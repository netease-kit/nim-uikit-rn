## Why

When a team conversation receives an unread `@我` message followed by an unread normal message, recalling the later normal message can remove the conversation list `[有人@我]` prefix. This happens because mention visibility can calculate the unread range from the last cached messages before excluding recalled placeholders.

## What Changes

- Keep `[有人@我]` visible when a later unread non-mention message is recalled and an earlier unread mention still remains.
- Build mention-badge unread ranges from non-recalled cached messages so recall placeholders do not hide earlier unread mentions.
- Apply the same rule to local mention tracking and im-store `aitMsgs` rendering paths.

## Capabilities

### New Capabilities

### Modified Capabilities

- `conversation-list-behavior`: Clarify that recalling a non-mention message MUST NOT clear a remaining unread mention badge.

## Impact

- Affects `stores/ConversationStore.ts` mention/ait unread-window calculation.
- Affects `app/(tabs)/index.tsx` conversation-list mention badge rendering.
- No SDK API, dependency, route, or visual layout changes.
