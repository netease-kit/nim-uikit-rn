## 1. Spec

- [x] 1.1 Create change `align-member-appellation-with-uikit`
- [x] 1.2 Add `member-appellation-alignment` spec for UIKit appellation reuse

## 2. Implementation

- [x] 2.1 Update `/chat/read-detail` to render member names through `getUIKitAppellation`
- [x] 2.2 Update other member-facing pages with the same manual nickname chain to use `getUIKitAppellation`

## 3. Validation

- [x] 3.1 Run `OPENSPEC_TELEMETRY=0 openspec validate align-member-appellation-with-uikit --type change --no-interactive`
- [x] 3.2 Run `npm run lint`
- [x] 3.3 Run `npx tsc --noEmit`
