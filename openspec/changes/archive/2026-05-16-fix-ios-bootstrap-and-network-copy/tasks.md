## 1. Spec

- [x] 1.1 Create change `fix-ios-bootstrap-and-network-copy`
- [x] 1.2 Update `language-preferences` for first-launch Chinese default behavior
- [x] 1.3 Update `conversation-list-behavior` for offline banner reachability handling
- [x] 1.4 Record iOS startup asset and navigation polish expectations

## 2. Implementation

- [ ] 2.1 Default the stored app language preference to Chinese and initialize UIKit language before first render
- [ ] 2.2 Hide stack back-title fallback text to avoid `(tabs)` appearing in the iOS back button
- [ ] 2.3 Relax network reachability checks to avoid false offline banners and reuse shared offline copy
- [ ] 2.4 Sync the native iOS AppIcon asset with the Expo icon source
- [ ] 2.5 Keep login and SMS feedback accurate by only showing offline copy for confirmed offline state

## 3. Validation

- [ ] 3.1 Run `OPENSPEC_TELEMETRY=0 openspec validate fix-ios-bootstrap-and-network-copy --type change --no-interactive`
- [ ] 3.2 Run `npm run lint`
- [ ] 3.3 Run `npx tsc --noEmit`
- [ ] 3.4 Start the iOS target and verify icon, language, back button, and network banner behavior in Simulator
