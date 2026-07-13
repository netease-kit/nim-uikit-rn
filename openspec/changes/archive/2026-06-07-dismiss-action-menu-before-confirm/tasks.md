## 1. Implementation

- [x] Update message action panel spec for destructive confirmation behavior
- [x] Dismiss the action menu before showing delete confirmation
- [x] Dismiss the action menu before showing recall confirmation
- [x] Preserve the selected message for confirmation callbacks after dismissing the action menu

## 2. Validation

- [x] Run `npx tsc --noEmit`
- [x] Run `npm run lint`
- [x] Run `OPENSPEC_TELEMETRY=0 openspec validate dismiss-action-menu-before-confirm --type change --no-interactive`
- [x] Verify Metro status on port 8081
