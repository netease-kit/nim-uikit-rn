## 1. Implementation

- [x] Inspect Web conversation preview and call-message detail rendering
- [x] Align RN conversation preview text for call messages
- [x] Add RN call-message detail row rendering with icon, status, and duration
- [x] Reuse shared call-message parsing across preview helpers

## 2. Validation

- [ ] Run `npx tsc --noEmit`
- [ ] Run `OPENSPEC_TELEMETRY=0 openspec validate align-call-message-preview-and-detail --type change --no-interactive`
