## 1. Spec

- [x] 1.1 Create change `fix-contacts-shortcut-freeze`
- [x] 1.2 Update contacts shortcut navigation expectations for freeze-free entry
- [x] 1.3 Update blacklist, joined-team, and verification center initial-load expectations

## 2. Implementation

- [x] 2.1 Stabilize `useAppTranslation()` so `t` can be used safely in callback and effect dependencies
- [x] 2.2 Remove temporary shortcut and target-page debug logging used during issue isolation
- [x] 2.3 Verify Contacts shortcut target pages no longer self-trigger repeated initial loads

## 3. Validation

- [x] 3.1 Run `OPENSPEC_TELEMETRY=0 openspec validate fix-contacts-shortcut-freeze --type change --no-interactive`
- [x] 3.2 Run `npx tsc --noEmit`
- [x] 3.3 Run `npm run lint`
- [x] 3.4 Verify `验证消息` / `黑名单` / `我的群聊` on the iOS Simulator
