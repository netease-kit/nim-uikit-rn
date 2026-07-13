## 1. Implementation

- [x] 1.1 Remove AI-user candidates from `app/conversation/picker.tsx`.
- [x] 1.2 Remove AI-user candidates from `app/team/member-picker.tsx`.

## 2. Validation

- [x] 2.1 Run `npx tsc --noEmit`.
- [x] 2.2 Run `OPENSPEC_TELEMETRY=0 openspec validate remove-ai-from-group-pickers --type change --no-interactive`.
