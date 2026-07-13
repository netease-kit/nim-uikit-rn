## 1. Spec Alignment

- [x] 1.1 Record the conversation-picker and blacklist-picker selection-limit rules in OpenSpec.
- [x] 1.2 Confirm testcase `0205` currently fails on the picker limit message and missing blacklist limit.

## 2. Implementation And Single-Case Verification

- [x] 2.1 Update `app/conversation/picker.tsx` to keep the 200-person limit and show the required over-limit message.
- [x] 2.2 Update `app/contacts/blacklist-picker.tsx` to enforce the 10-person selection limit.
- [x] 2.3 Re-verify testcase `0205-选择人员数量限制值` only, and do not advance to the next testcase until it passes.
