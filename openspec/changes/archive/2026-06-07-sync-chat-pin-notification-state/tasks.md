## 1. Spec Alignment

- [x] 1.1 Record real-time pin notification sync behavior for chat detail.

## 2. Implementation

- [x] 2.1 Make pinned-message lookup compatible with message clientId and serverId.
- [x] 2.2 Apply pin notifications using all available refer keys and force visible message rows to refresh.
- [x] 2.3 Keep pinned-message list output deduplicated after dual-key storage.

## 3. Validation

- [x] 3.1 Run `npx tsc --noEmit`.
- [x] 3.2 Run `npm run lint`.
- [x] 3.3 Validate the OpenSpec change.
- [x] 3.4 Confirm Metro on port `8081` is running.
