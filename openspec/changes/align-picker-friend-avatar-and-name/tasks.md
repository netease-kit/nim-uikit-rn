## 1. Spec Alignment

- [x] 1.1 Record the picker friend avatar/name priority requirements in OpenSpec.
- [x] 1.2 Confirm testcase `0207` currently fails because the RN picker uses a custom initial avatar instead of the UIKit avatar chain.

## 2. Implementation And Single-Case Verification

- [x] 2.1 Update the conversation picker to use UIKit avatar/name resolution for friend rows.
- [x] 2.2 Re-verify testcase `0207-人员选择器好友头像及昵称` only, and do not advance to the next testcase until it passes.
