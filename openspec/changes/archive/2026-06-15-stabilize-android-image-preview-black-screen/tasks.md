## 1. Implementation

- [x] 1.1 Inspect the Android image detail preview path and confirm the full-black image issue is isolated to the media viewer rendering path.
- [x] 1.2 Update the Android media viewer image rendering path to use a stable image component that preserves the existing paging, zoom, and loading behavior.

## 2. Validation

- [x] 2.1 Run `npx tsc --noEmit`.
- [x] 2.2 Run `npm run lint`.
- [x] 2.3 Verify Metro remains reachable on `http://localhost:8081/status` for hot-update validation on the connected Android device.
