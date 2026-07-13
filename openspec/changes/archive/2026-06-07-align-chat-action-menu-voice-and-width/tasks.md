## 1. Implementation

- [x] Update message action panel spec for voice Pin/Collect and adaptive menu width
- [x] Decouple Pin and Collect availability from forwarding support
- [x] Make the long-press action menu width adapt to the visible action count

## 2. Validation

- [x] Run `npx tsc --noEmit`
- [x] Run `npm run lint`
- [x] Run `OPENSPEC_TELEMETRY=0 openspec validate align-chat-action-menu-voice-and-width --type change --no-interactive`
- [x] Verify Metro status on port 8081
