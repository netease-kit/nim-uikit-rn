## 1. Spec Alignment

- [ ] 1.1 Record the conversation-picker create-label requirement in OpenSpec.
- [ ] 1.2 Confirm the current picker button text does not satisfy testcase `0199`.

## 2. Implementation And Single-Case Verification

- [ ] 2.1 Update `app/conversation/picker.tsx` so the create action shows `创建(<selected-count>)` after manual friend selection.
- [ ] 2.2 Re-verify testcase `0199-好友选择页面左上角创建-确定按钮样式` only, and do not advance to the next testcase until it passes.
