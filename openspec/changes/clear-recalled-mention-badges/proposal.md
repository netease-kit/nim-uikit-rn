# Change: Clear Recalled Mention Badges

## Why

When a conversation receives an unread mention and then a normal message, recalling the mention message can leave the conversation list badge stuck at `[有人@我]`. The mention keys are tracked separately from the latest message preview, so refreshing the conversation does not always remove the recalled mention key.

## What Changes

- Remove recalled or deleted message keys from local mention tracking.
- Remove recalled or deleted message keys from conversation `aitMsgs`.
- Ignore revoked `aitMsgs` when deciding whether the conversation list should show `[有人@我]`.
- Keep the mention badge visible when other unread mention messages remain.

## Impact

- Affects conversation list mention badge state for both conversation list render paths.
- Does not change message recall UI, unread count behavior, or mention payload generation.
