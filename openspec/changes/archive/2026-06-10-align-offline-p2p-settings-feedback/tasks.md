## 1. Spec Alignment

- [x] 1.1 Record the offline reminder and stick-top failure feedback requirement for p2p settings in OpenSpec.
- [x] 1.2 Confirm the RN single-chat settings page currently surfaces raw SDK errors instead of the common offline prompt.

## 2. Implementation And Verification

- [x] 2.1 Update `app/session/p2p-settings.tsx` so reminder and stick-top toggles check offline state before mutating settings and fall back to the common offline prompt.
- [x] 2.2 Align the shared `commonNetworkUnavailable` copy with the required wording `当前网络异常，请检查你的网络设置`.
- [x] 2.3 Verify the edited files with diagnostics and confirm Metro remains available on port `8081`.
