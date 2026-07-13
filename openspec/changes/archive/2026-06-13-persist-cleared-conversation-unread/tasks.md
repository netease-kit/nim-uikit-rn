## 1. Specification

- [x] 1.1 Document the cleared-unread persistence behavior in OpenSpec.

## 2. Core Implementation

- [x] 2.1 Persist account-scoped conversation clear-unread watermarks.
- [x] 2.2 Suppress stale unread and mention state when local conversation data is merged or updated.
- [x] 2.3 Apply the same suppression to im-store-v2 display conversations and unread totals.
- [x] 2.4 Route conversation-list clear-unread actions through the shared bridge path when im-store-v2 is active.

## 3. Validation

- [x] 3.1 Validate the OpenSpec change.
- [x] 3.2 Run TypeScript and lint checks.
- [x] 3.3 Verify Expo Metro startup or running status.
