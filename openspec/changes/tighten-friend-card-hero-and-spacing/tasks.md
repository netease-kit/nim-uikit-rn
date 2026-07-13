## 1. Implementation

- [x] Inspect the RN friend card hero and group spacing
- [x] Limit the friend card hero title to one line with ellipsis
- [x] Limit friend card information values to one line with ellipsis
- [x] Tighten the friend card page spacing without changing behavior

## 2. Validation

- [x] Run `npx tsc --noEmit`
- [x] Run `OPENSPEC_TELEMETRY=0 openspec validate tighten-friend-card-hero-and-spacing --type change --no-interactive`
