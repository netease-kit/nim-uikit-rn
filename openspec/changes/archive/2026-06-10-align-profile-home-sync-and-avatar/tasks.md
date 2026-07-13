## 1. Spec Alignment

- [x] 1.1 Record the profile-home header, avatar fallback, gender back-save, and multi-device profile sync expectations in the OpenSpec change artifacts.

## 2. Implementation

- [x] 2.1 Update `app/user/gender.tsx` so back navigation exits first and only then reports save failures.
- [x] 2.2 Update `stores/UserStore.ts` so current-account profile change events also reconcile into `selfProfile`.
- [x] 2.3 Update `app/(tabs)/my.tsx` to hide the default title bar and use the unified trailing-two-character avatar fallback.

## 3. Validation

- [x] 3.1 Validate the OpenSpec change.
- [x] 3.2 Run lint, TypeScript typecheck, and Expo startup verification for the affected flow.
