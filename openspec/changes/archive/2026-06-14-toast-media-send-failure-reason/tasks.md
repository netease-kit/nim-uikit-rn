## 1. Implementation

- [x] Inspect attachment message send failure handling.
- [x] Propagate non-antispam server-side send failure reasons from the message store.
- [x] Display the resolved failure reason as a chat toast.
- [x] Display the resolved failure reason when resend fails again.
- [x] Map NOS `413 Request Entity Too Large` upload failures to an upload-request rejection toast.

## 2. Validation

- [x] Run `OPENSPEC_TELEMETRY=0 openspec validate toast-media-send-failure-reason --type change --no-interactive`.
- [x] Run `npx tsc --noEmit`.
- [x] Run targeted lint for touched files.
- [x] Check Expo startup status on port 8081 or start Metro if needed.
