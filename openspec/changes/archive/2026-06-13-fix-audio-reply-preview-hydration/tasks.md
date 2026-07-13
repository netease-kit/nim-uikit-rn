## 1. Implementation

- [x] 1.1 Add store support for hydrating missing reply source messages by `threadReply` refers.
- [x] 1.2 Trigger reply-source hydration from the chat detail timeline when visible reply messages reference unloaded source messages.
- [x] 1.3 Preserve existing revoked/deleted fallback behavior when hydration cannot resolve the source.

## 2. Validation

- [x] 2.1 Run `OPENSPEC_TELEMETRY=0 openspec validate fix-audio-reply-preview-hydration --type change --no-interactive`.
- [x] 2.2 Run TypeScript and lint validation.
- [x] 2.3 Verify Expo Metro startup status.
