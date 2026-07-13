## Why

RN currently checks the recalled message's original send time when the user taps `重新编辑`, so a message sent more than two minutes ago but recalled moments ago is incorrectly treated as expired. Native iOS records the revoke time during recall and starts the re-edit window from that timestamp.

## What Changes

- Store the revoke timestamp when RN recalls a message locally or receives a revoke notification.
- Send revoke metadata in the SDK revoke `serverExtension`, including revoke time and text content for compatible native behavior.
- Use the stored revoke timestamp, not the original send timestamp, when validating the two-minute re-edit window.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `chat-message-actions-and-receipts`: recalled-message re-edit time window starts at revoke time.

## Impact

- `stores/MessageStore.ts`: revoke metadata storage and revoke SDK params.
- `app/chat/[id].tsx`: re-edit expiration check.
