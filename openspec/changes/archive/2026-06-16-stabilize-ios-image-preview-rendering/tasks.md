## 1. Implementation

- [x] 1.1 Inspect the current iOS image detail preview path and compare it with the Android black-screen fix.
- [x] 1.2 Update the iOS media viewer image rendering path to use the same stable native image layer and remove the image-detail zoom container.

## 2. Validation

- [x] 2.1 Run `npx tsc --noEmit`.
- [x] 2.2 Run `npm run lint`.
- [x] 2.3 Confirm Metro remains reachable on `http://localhost:8081/status` for device-side hot-update validation.
