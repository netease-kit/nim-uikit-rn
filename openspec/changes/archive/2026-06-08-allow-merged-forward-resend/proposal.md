## Why

Failed merged-forward messages currently show "resend unsupported" because resend only rebuilds standard text and attachment message types. Merged-forward messages are custom messages, but they carry a standard merged-forward payload that can be resent safely.

## What Changes

- Allow resend for failed standard merged-forward custom messages.
- Rebuild the merged-forward custom message from the existing standard payload and send it through the normal resend path.
- Keep unknown custom messages unsupported for resend.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `chat-forwarding`: Failed merged-forward message resend behavior.

## Impact

- Affected store: `stores/MessageStore.ts`.
- Affected flow: tapping resend on a failed merged-forward message.
- Unknown custom messages remain unsupported.
