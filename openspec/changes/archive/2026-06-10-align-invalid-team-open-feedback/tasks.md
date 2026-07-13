# Tasks

## 1. Spec Alignment

- [x] 1.1 Record the invalid team conversation open-feedback requirement in OpenSpec.
- [x] 1.2 Confirm the current RN flow can leave dismissed/removed team conversations without a user-facing prompt.

## 2. Implementation

- [x] 2.1 Update `app/(tabs)/index.tsx` so clicking an invalid team conversation shows the required confirmation prompt and removes the conversation after confirmation.
- [x] 2.2 Update `app/chat/[id].tsx` so opening a stale team conversation also handles history-load team-unavailable errors with the same feedback and cleanup path.

## 3. Validation

- [x] 3.1 Run targeted diagnostics/type validation for the updated files.
- [x] 3.2 Validate the OpenSpec change artifacts.
