## 1. Implementation

- [x] Inspect the existing invalid conversation filtering logic
- [x] Reuse invalid conversation filtering in the RN conversation list
- [x] Keep valid conversation behavior unchanged

## 2. Validation

- [x] Run `npx tsc --noEmit`
- [x] Run `OPENSPEC_TELEMETRY=0 openspec validate filter-invalid-conversations-from-list --type change --no-interactive`
