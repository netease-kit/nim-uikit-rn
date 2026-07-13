## 1. Spec

- [x] 1.1 Create change `support-voice-messages`
- [x] 1.2 Add `chat-voice-messages` spec for RN chat voice behavior

## 2. Implementation

- [x] 2.1 Add MessageStore voice-message send support
- [x] 2.2 Replace chat voice placeholder with Expo audio recording and send flow
- [x] 2.3 Play voice messages in-app and expose playing state to the message bubble
- [x] 2.4 Align RN voice bubble display with UIKit voice-message baseline
- [x] 2.5 Register Expo audio plugin microphone permission metadata

## 3. Validation

- [x] 3.1 Run `OPENSPEC_TELEMETRY=0 openspec validate support-voice-messages --type change --no-interactive`
- [x] 3.2 Run `npm run lint` (blocked by pre-existing unrelated lint errors; touched files pass targeted ESLint)
- [x] 3.3 Run `npx tsc --noEmit`
- [x] 3.4 Start the Expo app with `npm run start -- --non-interactive` (new start blocked by existing 8081 Metro process; existing Metro returned HTTP 200)
