## 1. Spec Alignment

- [x] 1.1 Record the muted-conversation unread badge tone requirement in OpenSpec.
- [x] 1.2 Confirm testcase `0232` currently fails because the shared unread badge stays red even when the conversation is muted.

## 2. Implementation And Single-Case Verification

- [x] 2.1 Update `src/NEUIKit/rn/components.tsx` so muted conversation rows render gray unread badges.
- [x] 2.2 Re-verify testcase `0232-消息免打扰会话` only, and do not advance to the next testcase until it passes.
