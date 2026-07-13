## 1. Specification

- [x] 1.1 Document current-chat forwarding latest-position behavior.
- [x] 1.2 Validate the OpenSpec change.

## 2. Implementation

- [x] 2.1 Add a one-shot forward-to-current-chat latest-position signal.
- [x] 2.2 Mark the signal when the forward target includes the source conversation.
- [x] 2.3 Consume the signal in the chat page when the forwarded outgoing message is inserted.
- [x] 2.4 Preserve historical position when forwarding to other conversations.

## 3. Validation

- [x] 3.1 Run TypeScript, lint, and OpenSpec validation.
- [x] 3.2 Verify Metro on port 8081 remains available without restarting it.
