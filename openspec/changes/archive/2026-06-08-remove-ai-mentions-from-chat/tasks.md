## 1. Implementation

- [x] 1.1 Remove AI-user mention candidates from the chat mention selector.
- [x] 1.2 Disable P2P mention selector support that only existed for AI-user mentions.
- [x] 1.3 Filter AI-user accounts out of team mention member candidates.
- [x] 1.4 Keep team mention display names alias-ignored and team-nick first.
- [x] 1.5 Update chat-message-content spec delta for AI mention removal and mention display names.

## 2. Validation

- [x] 2.1 Run `OPENSPEC_TELEMETRY=0 openspec validate remove-ai-mentions-from-chat --type change --no-interactive`.
- [x] 2.2 Run `npx tsc --noEmit`.
- [x] 2.3 Run targeted ESLint for changed TypeScript files.
