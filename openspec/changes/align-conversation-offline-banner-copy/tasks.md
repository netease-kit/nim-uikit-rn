## 1. Spec Alignment

- [x] 1.1 Record the conversation-list offline-banner copy requirement in OpenSpec.
- [x] 1.2 Confirm testcase `0251` currently fails because the RN banner copy differs from the required text.

## 2. Implementation And Single-Case Verification

- [x] 2.1 Update `app/(tabs)/index.tsx` so the conversation-list offline banner uses the required copy.
- [x] 2.2 Re-verify testcase `0251-会话列表无网络提示` only, and do not advance to the next testcase until it passes.
