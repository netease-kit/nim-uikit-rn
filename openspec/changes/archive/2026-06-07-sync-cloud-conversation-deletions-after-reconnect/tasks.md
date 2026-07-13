## 1. Spec Alignment

- [x] 1.1 Record cloud-conversation deletion convergence after reconnect.

## 2. Implementation

- [x] 2.1 Prune stale cloud conversation rows when the refreshed cloud source no longer contains them.
- [x] 2.2 Remove RN fallback rows when online cloud conversation delete events arrive.
- [x] 2.3 Keep pagination and non-cloud local conversation behavior unchanged.

## 3. Validation

- [x] 3.1 Run `npx tsc --noEmit`.
- [x] 3.2 Run `npm run lint`.
- [x] 3.3 Validate the OpenSpec change.
- [x] 3.4 Confirm Metro on port `8081` is running.
