## 1. Implementation

- [x] 1.1 Audit list-style avatar-and-name rows that diverge from the conversation list baseline.
- [x] 1.2 Update the affected RN list-style pages to use the conversation list avatar and nickname sizes.

## 2. Validation

- [x] 2.1 Run `npx tsc --noEmit`.
- [x] 2.2 Run `OPENSPEC_TELEMETRY=0 openspec validate unify-list-avatar-name-size --type change --no-interactive`.
