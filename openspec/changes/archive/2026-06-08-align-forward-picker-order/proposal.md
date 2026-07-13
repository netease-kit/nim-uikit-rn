## Why

The forward conversation picker shows recent chats and friends in an order that can differ from the main conversation list and contacts list. Users expect the same entities to appear in the same order across picker and source lists.

## What Changes

- Align the forward picker's recent chat ordering with the main conversation list ordering.
- Align the forward picker's friend ordering with the contacts list ordering.
- Preserve existing filtering, search, target validation, and multi-target selection behavior.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `chat-forwarding`: Forward target picker ordering behavior.

## Impact

- Affected route: `app/chat/forward.tsx`.
- Affected flow: selecting recent chats or friends when forwarding messages.
- No SDK, dependency, or navigation API changes.
