## 1. Spec Alignment

- [x] 1.1 Record the cloud conversation state-source requirement for team settings.
- [x] 1.2 Confirm the current team settings page reads conversation state from the local store only.

## 2. Implementation And Single-Case Verification

- [x] 2.1 Update `app/team/settings.tsx` so cloud mode prefers the cloud conversation store for stick-top and mute state.
- [x] 2.2 Re-verify testcase `0299-退出群聊置顶&免打扰状态清空` before advancing.
