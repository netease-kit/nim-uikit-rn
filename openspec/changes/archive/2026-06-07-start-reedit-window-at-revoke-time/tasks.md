## 1. Native Reference

- [x] 1.1 Confirm iOS native stores revoke time in revoke metadata and validates re-edit from that timestamp.
- [x] 1.2 Confirm Android native re-edit helper uses revoke message time rather than original send time.

## 2. Implementation

- [x] 2.1 Store revoke timestamps in RN message state for local revoke and revoke notifications.
- [x] 2.2 Pass revoke timestamp and content in revoke `serverExtension`.
- [x] 2.3 Validate `重新编辑` from stored revoke time with send-time fallback for old data.
- [x] 2.4 Hide the `重新编辑` action once the revoke-time edit window has expired, including after re-entering chat.

## 3. Validation

- [x] 3.1 Run `npx tsc --noEmit`.
- [x] 3.2 Run `npm run lint`.
- [x] 3.3 Validate the OpenSpec change.
- [x] 3.4 Confirm Metro on port `8081` is running.
