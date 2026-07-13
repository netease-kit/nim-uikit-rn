## 1. Spec Alignment

- [x] 1.1 Record the blacklist no-avatar fallback label order in OpenSpec.
- [x] 1.2 Keep the existing preset-avatar image chain unchanged.

## 2. Implementation And Validation

- [x] 2.1 Update the blacklist row display name to use the shared UIKit appellation order.
- [x] 2.2 Update the React Native UIKit avatar fallback label resolver to use alias, then personal nickname, then `accid`.
- [x] 2.3 Run `npx tsc --noEmit`.
- [x] 2.4 Run `OPENSPEC_TELEMETRY=0 openspec validate align-blacklist-friend-identity --type change --no-interactive`.
- [x] 2.5 Start Expo and confirm Metro reports ready.
