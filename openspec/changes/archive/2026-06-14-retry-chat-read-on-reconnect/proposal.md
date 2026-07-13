## Why

On Android, returning from background can display new messages in the still-focused chat page before the IM login lifecycle has fully re-entered a sendable state. Read receipts and unread clearing attempted during that reconnect window fail with `illegal state`, leaving the new message visible but not acknowledged as read.

## What Changes

- Treat foreground chat read-receipt recovery as pending until the IM session is both logged in and connected.
- Retry pending chat read receipts and unread clearing after the send-ready state is restored.
- Suppress unhandled rejected promises from native background-state sync when the SDK is temporarily not send-ready.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `chat-message-read-receipt`: Clarify that Android foreground recovery must wait for a send-ready IM session and must retry after transient `illegal state` failures.

## Impact

- `app/chat/[id].tsx`: foreground recovery trigger and pending read-receipt retry behavior.
- `utils/native-capture-state.ts`: defensive handling for SDK background-state calls during reconnect.
