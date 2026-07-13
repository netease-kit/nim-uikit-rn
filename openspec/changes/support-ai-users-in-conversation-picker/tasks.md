## 1. Spec Alignment

- [ ] 1.1 Record the AI-user picker requirement in OpenSpec.
- [ ] 1.2 Confirm testcase `0202` currently cannot pass because the RN picker only uses the friend list.

## 2. Implementation And Single-Case Verification

- [ ] 2.1 Expose AI users from the RN bridge and load them into `app/conversation/picker.tsx`.
- [ ] 2.2 Re-verify testcase `0202-数字人选择页面显示所有数字人` only, and do not advance to the next testcase until it passes.
