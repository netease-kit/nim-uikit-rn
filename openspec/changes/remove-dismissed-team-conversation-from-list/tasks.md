## 1. Spec Alignment

- [x] 1.1 Record the dismissed-team conversation-list removal requirement in OpenSpec.
- [x] 1.2 Confirm testcase `0254` currently risks stale team conversations because RN only refreshes the team list on `onTeamDismissed`.

## 2. Implementation And Single-Case Verification

- [x] 2.1 Update `app/_layout.tsx` so team dismissal refreshes the conversation list as well as the team list.
- [x] 2.2 Re-verify testcase `0254-在其他页面群聊A被解散` only, and do not advance to the next testcase until it passes.
