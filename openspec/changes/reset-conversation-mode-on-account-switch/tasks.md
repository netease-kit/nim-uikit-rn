## 1. Implementation

- [x] Inspect cloud-conversation preference persistence and account-switch login flow
- [x] Isolate cloud-conversation mode by account so new accounts default to local while the same account retains its own selection

## 2. Validation

- [ ] Run `npx tsc --noEmit`
- [ ] Run `OPENSPEC_TELEMETRY=0 openspec validate reset-conversation-mode-on-account-switch --type change --no-interactive`
