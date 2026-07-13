## 1. Spec Alignment

- [x] 1.1 Record the bottom message-tab unread-dot requirement in OpenSpec.
- [x] 1.2 Confirm testcase `0247` currently fails because the custom RN tab bar ignores unread badge rendering.

## 2. Implementation And Single-Case Verification

- [x] 2.1 Update `app/(tabs)/_layout.tsx` so the custom bottom tab bar shows a red dot on the messages icon when unread state exists.
- [x] 2.2 Re-verify testcase `0247-底部消息icon未读展示` only, and do not advance to the next testcase until it passes.
