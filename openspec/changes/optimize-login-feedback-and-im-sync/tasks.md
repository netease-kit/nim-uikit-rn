## 1. Implementation

- [x] Inspect RN SMS login flow and Android login reference
- [x] Align RN IM login sync level with Android basic sync behavior
- [x] Improve RN login page in-progress feedback during login

## 2. Validation

- [ ] Run `npx tsc --noEmit`
- [ ] Run `OPENSPEC_TELEMETRY=0 openspec validate optimize-login-feedback-and-im-sync --type change --no-interactive`
