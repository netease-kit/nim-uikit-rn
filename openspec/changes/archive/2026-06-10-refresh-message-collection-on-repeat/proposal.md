## Why

The chat long-press menu currently treats collected messages as a toggle and shows "取消收藏". Native behavior expects the collect action to remain available; collecting the same message again refreshes that collection instead of removing it.

## What Changes

- Keep the chat long-press collect action label as "收藏" even when the message already has a collection.
- Change repeated collection of the same message to refresh the existing collection record by recreating it with the same unique ID.
- Keep the collection list deduplicated while moving the refreshed message to the latest position with an updated collection time.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `message-collection`: repeated collection behavior for the same source message.

## Impact

- Affects chat long-press actions and collection store mutation behavior.
- No SDK dependency or navigation contract changes.
