## Why

When another user forwards many messages one by one into the current conversation, RN processes each receive event immediately and refreshes conversation state repeatedly, making the active chat timeline feel slow. Native Android batches received message rendering through list-level append operations, so RN should coalesce burst receive events before updating the timeline.

## What Changes

- Buffer short bursts of incoming message events in the RN NIM event bridge.
- Flush the buffered messages together so the chat timeline, mention state, read receipts, and conversation refresh are handled once per burst.
- Keep message ordering, active-session checks, and read-receipt behavior unchanged.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `chat-timeline-and-history`: active chat receive handling now requires burst messages to be batched for timeline updates.

## Impact

- `app/_layout.tsx`: NIM `onReceiveMessages` event handling.
- No SDK API changes or dependency changes.
