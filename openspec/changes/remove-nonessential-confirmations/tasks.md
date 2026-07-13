## 1. Spec Alignment

- [x] 1.1 Cross-check original `TestCases` and record which confirmations are not explicitly required.
- [x] 1.2 Limit this change to non-essential confirmations only.

## 2. Implementation And Validation

- [x] 2.1 Remove the cloud-conversation toggle confirmation chain from `app/user/setting.tsx`.
- [x] 2.2 Remove the clear-verification and remove-blacklist confirmation alerts.
- [x] 2.3 Remove the batch-delete message confirmation alert while preserving existing failure handling.
- [x] 2.4 Validate the OpenSpec change, typecheck, and Expo startup.
