## 1. Spec Alignment

- [x] 1.1 Record the settings-page stick-top source requirement for cloud conversation mode.
- [x] 1.2 Confirm the current P2P and team settings pages still call the local toggle helper.

## 2. Implementation And Single-Case Verification

- [x] 2.1 Update `app/session/p2p-settings.tsx` and `app/team/settings.tsx` so stick-top actions prefer the cloud conversation store in cloud mode.
- [x] 2.2 Re-verify testcase `0300-多端登陆会话列表同步` before advancing.
