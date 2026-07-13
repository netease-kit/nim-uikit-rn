## 1. Spec Updates

- [x] 1.1 Document the limited-photo picker refresh contract for chat detail.
- [x] 1.2 Document inline anti-spam failure anchoring for chat send failures.

## 2. Chat Fixes

- [x] 2.1 Remove stale limited-scope pagination filtering after iOS expands the authorized photo set.
- [x] 2.2 Bind anti-spam failure reasons to the failed message itself instead of appending detached tips rows.
- [x] 2.3 Render anti-spam failure copy directly under the corresponding failed media bubble.

## 3. Validation

- [x] 3.1 Run `OPENSPEC_TELEMETRY=0 openspec validate fix-chat-media-picker-refresh-and-antispam-mapping --type change --no-interactive`.
- [x] 3.2 Run `npx tsc --noEmit`.
- [x] 3.3 Run targeted ESLint for the changed chat files and store.
- [x] 3.4 Verify Expo/Metro startup for the affected chat flow target.
