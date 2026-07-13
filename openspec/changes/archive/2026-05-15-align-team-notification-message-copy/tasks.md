## 1. Spec Alignment

- [x] 1.1 Record the readable team-notification message requirement in OpenSpec.
- [x] 1.2 Confirm testcase `0252` currently fails because RN renders team notification messages as a generic `[通知消息]`.

## 2. Implementation And Single-Case Verification

- [x] 2.1 Add a shared RN team-notification text helper and use it in the chat page and conversation-list preview.
- [x] 2.2 Re-verify testcase `0252-被邀请加入讨论组` only, and do not advance to the next testcase until it passes.
