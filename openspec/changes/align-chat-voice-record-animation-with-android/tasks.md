## 1. Implementation

- [x] Inspect the Android voice record view layout and animation behavior
- [x] Align the RN chat voice record wave animation with the Android implementation
- [x] Align the RN pressed button visual state while preserving existing record logic

## 2. Validation

- [x] Run `npx tsc --noEmit`
- [x] Run `OPENSPEC_TELEMETRY=0 openspec validate align-chat-voice-record-animation-with-android --type change --no-interactive`
