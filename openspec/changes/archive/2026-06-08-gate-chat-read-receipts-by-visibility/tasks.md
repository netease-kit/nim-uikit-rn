## 1. Implementation

- [x] 1.1 Identify why chat settings, read-detail, and app background states still count as active chat reading.
- [x] 1.2 Gate active conversation tracking by chat route focus and foreground AppState.
- [x] 1.3 Ensure received-message read receipts use the gated active conversation state.

## 2. Validation

- [x] 2.1 Validate `gate-chat-read-receipts-by-visibility` with OpenSpec.
- [x] 2.2 Run TypeScript and targeted lint checks for changed files.
