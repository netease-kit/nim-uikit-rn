## 1. Spec Alignment

- [x] 1.1 Record the empty-selection create feedback requirement in OpenSpec.
- [x] 1.2 Confirm testcase `0222` currently fails because the RN picker disables create instead of showing a prompt.

## 2. Implementation And Single-Case Verification

- [x] 2.1 Update `app/conversation/picker.tsx` to show the required empty-selection prompt on create.
- [x] 2.2 Re-verify testcase `0222-不选择好友创建高级群-讨论组` only, and do not advance to the next testcase until it passes.
