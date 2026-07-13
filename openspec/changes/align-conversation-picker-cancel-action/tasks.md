## 1. Spec Alignment

- [ ] 1.1 Record the picker cancel-action requirement in OpenSpec.
- [ ] 1.2 Confirm testcase `0200` currently lacks an explicit `取消` entry on the conversation picker page.

## 2. Implementation And Single-Case Verification

- [ ] 2.1 Update `app/conversation/picker.tsx` to expose a left-top `取消` action that returns to the previous page.
- [ ] 2.2 Re-verify testcase `0200-好友选择页面左上角-返回` only, and do not advance to the next testcase until it passes.
