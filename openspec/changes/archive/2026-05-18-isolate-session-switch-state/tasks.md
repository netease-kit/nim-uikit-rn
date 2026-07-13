## 1. Spec And Session Isolation

- [x] 1.1 Record the account-switch conversation-leak regression in the OpenSpec change artifacts.
- [x] 1.2 Confirm the current login/logout ordering that allows old IM data to survive into the next account session.

## 2. Implementation And Validation

- [x] 2.1 Update the auth and NIM session-switch flow so the previous account is logged out and its caches are cleared before the next account session becomes active.
- [x] 2.2 Verify the fix with OpenSpec validation, lint, TypeScript typecheck, and Expo startup validation.
