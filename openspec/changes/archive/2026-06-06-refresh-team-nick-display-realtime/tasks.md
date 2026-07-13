## 1. Implementation

- [x] 1.1 Inspect current team nickname display precedence and refresh events.
- [x] 1.2 Update RN UIKit identity fallback to prefer team nick before friend alias.
- [x] 1.3 Refresh local team member cache when team member info updates.
- [x] 1.4 Ensure team settings/member preview also reacts to member info updates.

## 2. Validation

- [x] 2.1 Run `OPENSPEC_TELEMETRY=0 openspec validate refresh-team-nick-display-realtime --type change --no-interactive`.
- [x] 2.2 Run `npx tsc --noEmit`.
