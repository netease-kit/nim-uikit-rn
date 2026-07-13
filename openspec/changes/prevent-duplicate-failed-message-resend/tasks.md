## 1. Spec And Root Cause

- [x] 1.1 Record the failed-message duplicate resend regression in the OpenSpec change artifacts.
- [x] 1.2 Confirm the retry entry can invoke `MessageStore.resendMessage` concurrently for the same failed message.

## 2. Implementation And Validation

- [x] 2.1 Add a per-message resend guard so repeated taps do not create parallel resend requests.
- [x] 2.2 Validate the fix with diagnostics, TypeScript typecheck, lint, OpenSpec validation, and Expo startup verification.
