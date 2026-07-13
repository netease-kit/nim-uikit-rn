## 1. Implementation

- [x] 1.1 Add a shared stop-all control for active message audio playback hooks.
- [x] 1.2 Stop voice playback when the chat screen loses focus or marks an external chat surface active.
- [x] 1.3 Stop voice playback before opening media preview, merged-forward detail, forwarding, conversation settings, document picker, and limited media permission picker.
- [x] 1.4 Preserve voice-message tap behavior inside the chat timeline.

## 2. Validation

- [x] 2.1 Run `OPENSPEC_TELEMETRY=0 openspec validate stop-voice-playback-on-external-chat-surface --type change --no-interactive`.
- [x] 2.2 Run `npx tsc --noEmit`.
- [x] 2.3 Run `npm run lint`.
- [x] 2.4 Verify Expo startup state with Metro on port `8081`.
