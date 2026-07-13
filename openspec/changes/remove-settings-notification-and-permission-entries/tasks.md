## 1. Implementation

- [x] Inspect the RN settings entry list
- [x] Remove the notifications and system permissions entries
- [x] Keep the remaining settings items unchanged

## 2. Validation

- [x] Run `npx tsc --noEmit`
- [x] Run `OPENSPEC_TELEMETRY=0 openspec validate remove-settings-notification-and-permission-entries --type change --no-interactive`
