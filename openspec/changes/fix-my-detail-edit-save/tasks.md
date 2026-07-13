## 1. Spec And Root Cause

- [x] 1.1 Record the personal-information save regression in the OpenSpec change artifacts.
- [x] 1.2 Confirm the save path depends on delayed cloud refresh instead of immediate local profile reconciliation.

## 2. Implementation And Validation

- [x] 2.1 Update the user profile store to reconcile successful edits into local profile state before asynchronous refresh completes.
- [x] 2.2 Verify the change with OpenSpec validation, lint, TypeScript typecheck, and Expo startup validation.
