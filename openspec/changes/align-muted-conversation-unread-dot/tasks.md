## 1. Spec Alignment

- [x] 1.1 Record the muted-conversation unread-dot requirement in OpenSpec.
- [x] 1.2 Confirm testcase `0246` currently fails because muted conversations still render unread numbers.

## 2. Implementation And Single-Case Verification

- [x] 2.1 Update `src/NEUIKit/rn/components.tsx` so muted conversation rows render a gray unread dot instead of a count badge.
- [x] 2.2 Re-verify testcase `0246-未读消息展示` only, and do not advance to the next testcase until it passes.
