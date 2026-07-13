## 1. Spec Alignment

- [x] 1.1 Record that the cloud-conversation toggle must change the effective conversation mode after re-login.
- [x] 1.2 Record that the homepage must not fall back to stale local conversation cache once the bridge store is bound.
- [x] 1.3 Record that logout must clear cached IM view state before the next login.

## 2. Implementation And Verification

- [x] 2.1 Bind the active `nim` instance into `im-store-v2` from the RN root layout and refresh the active conversation store after login/sync.
- [x] 2.2 Make the homepage conversation list and refresh flow use the bound bridge store consistently.
- [x] 2.3 Reset local conversation, message, team, and user caches when clearing persisted session state.
- [x] 2.4 Run repo validation and startup verification for the affected login/conversation flow.
