## 1. Implementation

- [x] Inspect high-risk pages with fixed bottom regions or bottom-positioned elements
- [x] Add bottom safe-area spacing to the affected pages
- [x] Keep existing interactions unchanged

## 2. Validation

- [x] Run `npx tsc --noEmit`
- [x] Run `OPENSPEC_TELEMETRY=0 openspec validate reserve-bottom-safe-area-for-fixed-panels --type change --no-interactive`
