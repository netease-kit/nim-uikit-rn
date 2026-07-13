## 1. RN Push Contract

- [x] 1.1 Add offline push configuration fields to runtime config and create a shared RN offline-push utility
- [x] 1.2 Register the NIM RN offline-push configuration before login and supply native device-token access when available
- [x] 1.3 Add unified push payload generation to outbound message send parameters

## 2. Runtime Routing

- [x] 2.1 Synchronize app foreground and background state into the NIM RN runtime
- [x] 2.2 Extend notification tap handling to resolve `conversationId` or `sessionId` plus `sessionType`
- [x] 2.3 Bridge Android native notification intents into RN deep links without reconstructing account-scoped conversation IDs in native code

## 3. Validation

- [x] 3.1 Validate the new OpenSpec change
- [x] 3.2 Run TypeScript validation for the RN changes
- [x] 3.3 Start the affected Expo target and record any native-runtime blockers for full offline push verification
