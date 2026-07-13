## 1. Implementation

- [x] Inspect the pinned-message list presentation used as the visual reference
- [x] Align the collection list card shell and message preview area with the pinned-message list
- [x] Preserve collection-specific source and action controls

## 2. Validation

- [x] Run `npx tsc --noEmit`
- [x] Run `OPENSPEC_TELEMETRY=0 openspec validate align-collection-list-with-pinned-messages --type change --no-interactive`
