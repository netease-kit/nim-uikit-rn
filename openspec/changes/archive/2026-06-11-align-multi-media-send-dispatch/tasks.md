## 1. Batch Send Behavior

- [x] 1.1 Update the chat limited-media send flow to prepare selected assets in batch instead of awaiting each asset serially.
- [x] 1.2 Dispatch valid selected image and video sends together while preserving the existing per-message send APIs and progress behavior.
- [x] 1.3 Keep partial-failure handling aligned so one selected asset failure does not block sibling sends.

## 2. Validation

- [x] 2.1 Validate the affected chat screen code with lint and TypeScript checks.
- [x] 2.2 Validate the OpenSpec change artifacts.
