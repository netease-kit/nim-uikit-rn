## 1. Spec Alignment

- [x] 1.1 Record the created-team default avatar requirement in OpenSpec.
- [x] 1.2 Confirm testcase `0219` currently fails because the RN create-team flow does not send an avatar.

## 2. Implementation And Single-Case Verification

- [x] 2.1 Update the RN create-team flow to send a seeded default avatar when creating an advanced team.
- [x] 2.2 Re-verify testcase `0219-创建群聊-讨论组邀请好友及数字人加入群聊` only, and do not advance to the next testcase until it passes.
