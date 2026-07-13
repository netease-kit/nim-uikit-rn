## 1. Spec And Root Cause

- [x] 1.1 Record the duplicate-conversation regression in the OpenSpec change artifacts.
- [x] 1.2 Confirm which local send and conversation-preview update path creates the transient extra row.

## 2. Implementation And Validation

- [x] 2.1 Update local message send handling so draft messages carry the correct conversation identity before preview synchronization.
- [x] 2.2 Verify the fix with lint, TypeScript typecheck, OpenSpec validation, and Expo startup validation.
