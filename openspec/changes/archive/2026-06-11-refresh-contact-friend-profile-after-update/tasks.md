## 1. Implementation

- [x] 1.1 Make contacts friend directory rows resolve display names through the shared RN UIKit identity helper.
- [x] 1.2 Make contacts friend directory rows resolve avatars through the shared RN UIKit identity helper and re-render on user profile changes.

## 2. Validation

- [x] 2.1 Run `npx tsc --noEmit`, `npm run lint`, and `OPENSPEC_TELEMETRY=0 openspec validate refresh-contact-friend-profile-after-update --type change --no-interactive`.
- [x] 2.2 Verify Expo Metro health on port `8081` after the change.
