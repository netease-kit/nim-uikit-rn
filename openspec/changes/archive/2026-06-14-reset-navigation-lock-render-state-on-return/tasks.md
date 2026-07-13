## 1. Specification

- [x] 1.1 Document return-from-chat navigation recovery for search results.
- [x] 1.2 Document return-from-chat navigation recovery for joined-team rows.
- [x] 1.3 Validate the OpenSpec change.

## 2. Implementation

- [x] 2.1 Make navigation-lock set/reset transitions trigger a React re-render.
- [x] 2.2 Preserve synchronous duplicate-navigation protection.
- [x] 2.3 Verify existing call sites can keep using `isNavigationLocked()`.

## 3. Validation

- [x] 3.1 Run TypeScript, lint, and OpenSpec validation.
- [x] 3.2 Verify Metro on port 8081 remains available without restarting it.
