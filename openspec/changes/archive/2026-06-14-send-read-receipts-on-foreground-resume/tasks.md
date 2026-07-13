## 1. Spec Alignment

- [x] 1.1 Record the Android/RN foreground resume read-receipt behavior in OpenSpec.

## 2. Implementation And Verification

- [x] 2.1 Restore active chat readability when returning from background if the chat was readable before backgrounding.
- [x] 2.2 Keep history-browsing and external-surface cases from sending read receipts early.
- [x] 2.3 Keep incoming messages hidden when returning from settings, system media/file/camera surfaces, or message detail pages opened from the latest position.
- [x] 2.4 Defer foreground-resume read receipt dispatch until IM reconnect succeeds.
- [x] 2.5 Send latest-message read receipts when the user taps the `x条新消息` shortcut.
- [x] 2.6 Validate with OpenSpec, typecheck/lint, and Android/Metro status checks.
- [x] 2.7 Keep the shortcut arrow visible without count text when all hidden new messages are revoked.
- [x] 2.8 Retry pending foreground read receipts after delayed message-store availability.
