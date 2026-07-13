## 1. Implementation

- [x] 1.1 Identify why batch forward returns do not exit chat multi-select mode.
- [x] 1.2 Add a one-time return signal for batch forward completion or failure.
- [x] 1.3 Consume that signal in the source chat page and exit multi-select mode.

## 2. Validation

- [x] 2.1 Run `npx tsc --noEmit`.
- [x] 2.2 Validate `exit-batch-forward-mode-after-forward-result` with OpenSpec.
