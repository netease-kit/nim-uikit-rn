## 1. Spec And Root Cause

- [x] 1.1 Record the duplicate chat submit risk in the OpenSpec change artifacts.
- [x] 1.2 Confirm which chat entry points can re-enter before page state updates take effect.

## 2. Implementation And Validation

- [x] 2.1 Add a synchronous guard for chat text sending so repeated taps do not trigger parallel sends.
- [x] 2.2 Add a synchronous guard for forward confirmation so repeated taps do not trigger parallel forwards.
- [x] 2.3 Validate the fix with diagnostics, TypeScript typecheck, lint, OpenSpec validation, and Metro status verification.
