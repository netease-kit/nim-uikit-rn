## 1. Implementation

- [x] 1.1 Gate foreground read-receipt recovery on full IM send readiness, not only socket connection.
- [x] 1.2 Keep pending recovery queued when read receipt or unread clearing hits reconnect-time `illegal state`.
- [x] 1.3 Suppress unhandled background-state promise rejections during reconnect.

## 2. Validation

- [x] 2.1 Validate the OpenSpec change.
- [x] 2.2 Run TypeScript and lint checks for the affected code.
- [x] 2.3 Verify Metro startup or existing Metro health on port 8081.
