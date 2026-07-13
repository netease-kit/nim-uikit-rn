## 1. Implementation

- [x] 1.1 Update voice touch-move cancellation to use a circular edge tolerance.
- [x] 1.2 Align the voice recording tip copy with the tolerated edge cancel gesture.
- [x] 1.3 Use the release position to determine the final cancel state when available.
- [x] 1.4 Update the recording hint while the touch is outside the tolerated cancel boundary.

## 2. Validation

- [x] 2.1 Validate OpenSpec change.
- [x] 2.2 Run TypeScript and lint checks.
- [x] 2.3 Reproduce on iPad and confirm movement within the tolerated edge area no longer skips sending.
