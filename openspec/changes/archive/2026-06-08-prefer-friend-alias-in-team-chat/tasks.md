## 1. Implementation

- [x] 1.1 Update chat page group sender labels to prefer friend alias before team nickname.
- [x] 1.2 Update chat mention display names to use the same alias-first rule.
- [x] 1.3 Keep merged-forward/default UIKit appellation logic unchanged.
- [x] 1.4 Update chat-message-content spec delta for sender labels and mention candidates.

## 2. Validation

- [x] 2.1 Run `OPENSPEC_TELEMETRY=0 openspec validate prefer-friend-alias-in-team-chat --type change --no-interactive`.
- [x] 2.2 Run `npx tsc --noEmit`.
- [x] 2.3 Run targeted ESLint for changed TypeScript files.
