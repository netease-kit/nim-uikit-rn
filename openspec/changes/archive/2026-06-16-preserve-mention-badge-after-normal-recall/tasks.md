## 1. Specification

- [x] 1.1 Add OpenSpec proposal and conversation-list behavior delta for preserving mention badges after normal-message recall.

## 2. Implementation

- [x] 2.1 Update local conversation mention and ait unread-window logic to ignore recalled placeholders before slicing unread messages.
- [x] 2.2 Update conversation-list im-store ait rendering path to use the same non-recalled unread-window rule.

## 3. Validation

- [x] 3.1 Validate the OpenSpec change.
- [x] 3.2 Run TypeScript and lint checks for the touched code.
- [x] 3.3 Verify Metro startup/status after implementation.
