## 1. Implementation

- [x] 1.1 Add a reusable 200M pre-send size validation helper for local/picked files.
- [x] 1.2 Apply validation to chat album media, album-as-file, document file, camera photo, and camera video sends.
- [x] 1.3 Align the Chinese oversized-file toast copy with Android/iOS native wording.

## 2. Validation

- [x] 2.1 Run `OPENSPEC_TELEMETRY=0 openspec validate align-upload-size-limit-feedback --type change --no-interactive`.
- [x] 2.2 Run `npx tsc --noEmit`.
