## 1. Spec Alignment

- [x] 1.1 Record in-app audio playback expectations for pinned and collected voice messages.

## 2. Implementation

- [x] 2.1 Extract chat voice-message playback into a reusable RN hook.
- [x] 2.2 Use the shared playback hook in chat detail without changing existing media/file behavior.
- [x] 2.3 Use the shared playback hook in the pinned-message list and stop opening voice attachment URLs externally.
- [x] 2.4 Use the shared playback hook in the collection list and stop opening voice attachment URLs externally.

## 3. Validation

- [x] 3.1 Run `npx tsc --noEmit`.
- [x] 3.2 Run `npm run lint`.
- [x] 3.3 Validate the OpenSpec change.
- [x] 3.4 Confirm Metro on port `8081` is running.
