## 1. Implementation

- [x] 1.1 Inspect the current chat-detail composer mode and outside-press handlers.
- [x] 1.2 Add a shared outside-composer reset handler for text, voice, emoji, and more-panel modes.
- [x] 1.3 Wire message/timeline empty areas to the shared reset handler without triggering it from inside the composer.
- [x] 1.4 Document the fixed 8081/hot-update local development convention in `AGENTS.md`.

## 2. Validation

- [x] 2.1 Run `OPENSPEC_TELEMETRY=0 openspec validate reset-chat-input-on-outside-press --type change --no-interactive`.
- [x] 2.2 Run `npx tsc --noEmit`.
