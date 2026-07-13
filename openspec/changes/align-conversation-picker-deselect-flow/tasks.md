## 1. Spec Alignment

- [x] 1.1 Record the conversation-picker deselect interactions in OpenSpec.
- [x] 1.2 Confirm testcase `0204` currently lacks the selected-member-strip deselect path.

## 2. Implementation And Single-Case Verification

- [x] 2.1 Update `app/conversation/picker.tsx` to show selected members and allow tapping their avatars to cancel selection.
- [x] 2.2 Re-verify testcase `0204-取消选择好友、数字人` only, and do not advance to the next testcase until it passes.
