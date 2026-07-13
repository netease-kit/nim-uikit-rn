## 1. Implementation

- [x] 1.1 Inspect the chat media viewer save flow and separate save-permission handling from picker/library-read permission handling.
- [x] 1.2 Add a dedicated media-save permission helper that triggers the system dialog on first unauthorized save and falls back to settings when direct prompting is no longer allowed.
- [x] 1.3 Route chat media-viewer save actions through the dedicated save-permission helper while preserving the existing save success/failure feedback.

## 2. Validation

- [x] 2.1 Run OpenSpec validation.
- [x] 2.2 Run TypeScript and lint checks.
- [x] 2.3 Verify Metro remains available on port 8081 after the change.
