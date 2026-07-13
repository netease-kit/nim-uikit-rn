## 1. Spec Alignment

- [x] 1.1 Record the conversation long-press action-scope requirement in OpenSpec.
- [x] 1.2 Confirm testcase `0278` currently fails because the RN long-press menu includes extra actions beyond stick-top and delete.

## 2. Implementation And Single-Case Verification

- [x] 2.1 Update `app/(tabs)/index.tsx` so the long-press action sheet only exposes the required actions.
- [x] 2.2 Re-verify testcase `0278-长按会话A` only, and do not advance to the next testcase until it passes.
