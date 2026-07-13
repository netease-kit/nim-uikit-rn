## Why

Selecting 50 messages can still show the delete-limit toast if the local chat list contains duplicate message keys, because the selected-id set may be expanded back into more than 50 message rows. The selection count and delete-limit check must use the same deduplicated visible-message model.

## What Changes

- Deduplicate chat timeline messages by message key before deriving visible rows.
- Derive multi-select availability and selected messages from the deduplicated visible-message list.
- Preserve the existing rule that 50 selected messages can be deleted and 51 selected messages shows the limit tip.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `chat-forwarding-and-selection`: multi-select count and delete-limit behavior when duplicate message keys exist locally.

## Impact

- `app/chat/[id].tsx`: chat timeline derivation and multi-select selected-message derivation.
