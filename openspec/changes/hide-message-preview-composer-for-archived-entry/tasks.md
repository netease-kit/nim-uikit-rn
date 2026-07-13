## 1. Implementation

- [x] Inspect message preview entry paths from pinned messages and collections
- [x] Hide the composer for archived preview sources
- [x] Keep the default message preview behavior unchanged for other entry paths

## 2. Validation

- [x] Run `npx tsc --noEmit`
- [x] Run `OPENSPEC_TELEMETRY=0 openspec validate hide-message-preview-composer-for-archived-entry --type change --no-interactive`
