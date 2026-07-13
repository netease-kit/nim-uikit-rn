## 1. Spec Alignment

- [x] 1.1 Record the conversation-list empty-state illustration requirement in OpenSpec.
- [x] 1.2 Confirm testcase `0231` currently fails because the shared RN empty-state component renders text only.

## 2. Implementation And Single-Case Verification

- [x] 2.1 Update `src/NEUIKit/rn/components.tsx` so the shared empty-state component displays the default illustration.
- [x] 2.2 Re-verify testcase `0231-会话列表无会话` only, and do not advance to the next testcase until it passes.
