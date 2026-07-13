## 1. Specification

- [x] 1.1 Document cloud-mode offline search fallback behavior.
- [x] 1.2 Validate the OpenSpec change.

## 2. Implementation

- [x] 2.1 Merge eligible local fallback rows into cloud-mode conversation reads without inheriting local pin state.
- [x] 2.2 Fall back to the local placeholder from `getConversation` when the cloud row is absent.
- [x] 2.3 Ensure cloud conversations are created before cloud-mode chat entry and sends when the SDK is reachable.
- [x] 2.4 Preserve explicit delete and invalid-team pruning behavior for local fallback rows.
- [x] 2.5 Keep fallback rows unpinned until a real cloud conversation reports pin state.
- [x] 2.6 Create cloud conversations only when the user taps list pin/unpin, then apply the pin mutation.

## 3. Validation

- [x] 3.1 Run TypeScript validation.
- [x] 3.2 Run lint.
- [x] 3.3 Verify Metro startup/status for the Expo app.
