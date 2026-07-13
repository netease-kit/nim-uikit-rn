## 1. Implementation

- [x] 1.1 Remove the search bar from the team mention selector overlay.
- [x] 1.2 Remove mention-candidate filtering by search keyword while keeping existing candidate ordering and permission rules.

## 2. Validation

- [x] 2.1 Run `npx tsc --noEmit`, `npm run lint`, and `OPENSPEC_TELEMETRY=0 openspec validate remove-team-at-picker-search --type change --no-interactive`.
