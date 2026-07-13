## 1. Specification

- [x] 1.1 Add OpenSpec scenario for same-account synced messages not counting as new messages
- [x] 1.2 Add OpenSpec scenario for revoked notice messages decreasing the notice count

## 2. Implementation

- [x] 2.1 Exclude current-account messages from new-message notice accumulation
- [x] 2.2 Preserve existing history-position behavior for synced self messages
- [x] 2.3 Remove revoked or missing messages from the new-message notice set

## 3. Verification

- [x] 3.1 Run TypeScript, lint, whitespace, OpenSpec validation, and Metro status check
