## 1. Spec Alignment

- [x] 1.1 Record the in-chat team-dismissal feedback requirement in OpenSpec.
- [x] 1.2 Confirm testcase `0253` currently fails because the RN chat page does not listen for `onTeamDismissed`.

## 2. Implementation And Single-Case Verification

- [x] 2.1 Update `app/chat/[id].tsx` so dismissing the currently opened team shows the required prompt and returns to the conversation list after confirmation.
- [x] 2.2 Re-verify testcase `0253-在群聊聊天页面群聊解散` only, and do not advance to the next testcase until it passes.
