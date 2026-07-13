## 1. Shared Toast Infrastructure

- [x] 1.1 Add a root-level RN toast host for floating toast presentation.
- [x] 1.2 Route iOS shared native toast calls through the host.
- [x] 1.3 Preserve Android `ToastAndroid` behavior for shared native toast calls.

## 2. Screen Integration

- [x] 2.1 Replace login screen local toast overlay with the shared toast utility.
- [x] 2.2 Replace chat screen toast-like iOS alert fallback with the shared toast utility.
- [x] 2.3 Replace media save success toast-like iOS alert fallback with the shared toast utility.

## 3. Validation

- [x] 3.1 Validate OpenSpec change.
- [x] 3.2 Run TypeScript check or document pre-existing blockers.
- [x] 3.3 Verify native bundling/startup on the affected target.
