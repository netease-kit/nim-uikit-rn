## 1. Specification

- [x] 1.1 Document the latest-message batch delete positioning requirement.
- [x] 1.2 Validate the OpenSpec change.

## 2. Implementation

- [x] 2.1 Detect when a batch delete selection includes the current latest visible message.
- [x] 2.2 Align the inverted chat list to the remaining latest message after the deletion shrinks the message list.
- [x] 2.3 Keep historical-only batch deletion from forcing a latest-message scroll.

## 3. Validation

- [x] 3.1 Run TypeScript and lint checks for the chat page change.
- [x] 3.2 Verify Metro on port 8081 remains available or start the project if needed.
