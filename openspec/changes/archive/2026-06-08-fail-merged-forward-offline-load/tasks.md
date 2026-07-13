## 1. Implementation

- [x] 1.1 Add timeout handling for merged-forward detail payload downloads.
- [x] 1.2 Show `信息获取失败` when merged-forward detail payload cannot be loaded.
- [x] 1.3 Return to the previous chat page after the failure toast.

## 2. Validation

- [x] 2.1 Run `OPENSPEC_TELEMETRY=0 openspec validate fail-merged-forward-offline-load --type change --no-interactive`.
- [x] 2.2 Run `npx tsc --noEmit`.
