## 1. Implementation

- [x] 1.1 Identify the merged-forward-only failure branch that bypasses batch-forward cleanup.
- [x] 1.2 Normalize merged-forward send failure toast to the generic forward failure text.
- [x] 1.3 Reuse batch-forward cleanup so the source chat page exits multi-select mode after merged-forward failure.

## 2. Validation

- [x] 2.1 Validate `normalize-merged-forward-failure-exit` with OpenSpec.
- [x] 2.2 Run TypeScript and targeted lint checks for the changed forwarding screen.
