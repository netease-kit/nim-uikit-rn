## Why

The forwarding confirmation modal waits for all forwarding sends to finish before closing. When users select multiple messages and multiple targets, each send is awaited sequentially, so the modal can show loading for a long time before the user returns to chat.

Native Android and iOS trigger forwarding from the confirmation callback without binding the confirmation dialog lifecycle to final send completion.

## What Changes

- Keep immediate validation before forwarding, including target validity, unsupported message checks, nested merged-forward limit, and network availability.
- After validation passes, close the confirmation modal, reset forwarding selection state, and return to the source page immediately.
- Continue actual forwarding in the background so message insertion/sending proceeds without blocking the modal.
- Preserve existing failure toast behavior for pre-send validation failures and merged-forward background failures.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `chat-forwarding`: Clarify that forward confirmation UI closes immediately after pre-send validation instead of waiting for all send operations.

## Impact

- Affected route: `app/chat/forward.tsx`
- Affected behavior: forwarding confirmation modal responsiveness for single, serial, and merged forwarding
- No SDK API, message payload, or store schema changes.
