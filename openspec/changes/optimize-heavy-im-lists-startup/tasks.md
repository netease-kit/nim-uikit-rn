## 1. Implementation

- [x] 1.1 Inspect login sync and friend-list render hot paths for repeated full-list work.
- [x] 1.2 Add a stable sorted friend snapshot and version tracking to the local friend store.
- [x] 1.3 Memoize contacts home friend directory derivation from stable friend snapshots.
- [x] 1.4 Memoize friend-derived search and picker candidates from stable friend snapshots.
- [x] 1.5 Disable im-store-v2 debug logging in the RN bridge to avoid Android logcat object-formatting stalls.
- [x] 1.6 Cache im-store-v2 conversation arrays and display-conversation derivation for stable render dependencies.
- [x] 1.7 Tune conversation FlatList render batches to reduce Android fast-scroll blank areas.
- [x] 1.8 Constrain online-status subscription to friend-list and conversation-window account batches, with subscribed-account de-duplication and rate-limit cooldown.
- [x] 1.9 Break the `ConversationStore`/`MessageStore` static require cycle that appears in Android DevTools.
- [x] 1.10 Optimize batch-forward and follow-up picker flows to reuse friend snapshots, virtualize target rows, and avoid repeated selected-message scans.
- [x] 1.11 Batch near-simultaneous received messages in chat detail with a debounce and max-wait flush so multi-message bursts render together faster.
- [x] 1.12 Send serial-forward message batches and multi-target forwarding work concurrently instead of awaiting each item in sequence.

## 2. Validation

- [x] 2.1 Run `npx tsc --noEmit`.
- [x] 2.2 Run `npm run lint`.
- [x] 2.3 Validate the OpenSpec change.
- [x] 2.4 Verify Metro startup status on port 8081.
- [x] 2.5 Re-run typecheck and lint after forwarding/picker optimizations.
- [x] 2.6 Recheck Android/iOS device logs after hot reload for repeated `subscribeEvent` 416 spam and large object-formatting logs.
  - iPad inspector showed 30 batch subscription calls with no 416/rate-limit spam.
  - Honor Android cold start showed 31 subscription calls, 31 results, 0 subscribe errors, 0 rate-limit hits, and 0 runtime errors.
  - Honor Android cold start after fixes showed 1 full `refreshAll`, 2 lightweight `refreshApplications`, and responsive Contacts/Messages tab taps after load.
- [x] 2.7 Re-run typecheck, lint, OpenSpec validation, and Metro status check after received-message batching optimization.
- [x] 2.8 Re-run typecheck, lint, OpenSpec validation, and Metro status check after parallel serial-forward sending.
