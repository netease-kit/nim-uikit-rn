## 1. Implementation

- [x] Change RN user-status cache from single-record-per-account to per-account per-device aggregation
- [x] Make account online determination return online when any device status is still login
- [x] Preserve offline fallback only when all tracked device statuses are offline
- [x] Prevent successful subscriptions with no immediate Android status payload from writing a synthetic offline state
- [x] Accept immediate user-status payloads returned by subscription APIs in addition to listener callbacks
- [x] Normalize Android RN string client types so per-device aggregation does not collapse to one unknown terminal
- [x] Ignore unknown-terminal non-login events when a tracked device is still online
- [x] Stop falling back to im-store-v2's single-record subscription cache for RN online-status rendering
- [x] Treat unsynced Android fallback status as unknown in cache while rendering the offline indicator fallback
- [x] Retry Android legacy unknown status with fast unsubscribe/resubscribe and delayed follow-up syncs
- [x] Preserve Android fallback listener state across repeated binds when the RN SDK lacks a real V2 subscription service

## 2. Validation

- [x] Run `npx eslint src/NEUIKit/rn/user-status.ts`
- [x] Run `npx tsc --noEmit`
- [x] Run `OPENSPEC_TELEMETRY=0 openspec validate aggregate-multi-device-user-online-status --type change --no-interactive`
