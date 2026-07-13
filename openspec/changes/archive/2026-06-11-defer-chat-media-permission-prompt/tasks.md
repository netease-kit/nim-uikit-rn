## 1. Implementation

- [x] 1.1 Prevent chat detail from registering iOS limited photo-library listeners before the limited picker is opened
- [x] 1.2 Keep first-time album permission prompts bound to explicit user taps on image/video and album-file entry points

## 2. Validation

- [x] 2.1 Run `npm run lint`
- [x] 2.2 Run `npx tsc --noEmit`
- [x] 2.3 Run `OPENSPEC_TELEMETRY=0 openspec validate defer-chat-media-permission-prompt --type change --no-interactive`
- [x] 2.4 Verify Metro readiness for the affected Expo target
