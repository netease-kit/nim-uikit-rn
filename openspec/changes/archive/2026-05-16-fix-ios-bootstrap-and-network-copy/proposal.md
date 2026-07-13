## Why

The iOS build currently exposes four bootstrap regressions in the first-run experience:

- the installed app can show the wrong launcher icon because the checked-in native AppIcon asset is stale
- first launch can render English copy even though the demo's default language expectation is Chinese
- the iOS back button can show the route segment `(tabs)` as fallback text
- the conversation home can show a false offline banner when iOS reports a transient unknown reachability state
- the login flow can show a generic network-unavailable message even while message sync proves the device is still online

These issues all affect visible startup and navigation behavior, so they need a spec-backed fix before code changes.

## What Changes

- Align the checked-in iOS `AppIcon` asset with the Expo app icon source.
- Make Chinese the default app language on first launch and initialize UIKit language before the first screen renders.
- Hide stack back-title fallback text so route group names never appear after the back chevron.
- Treat network reachability as unavailable only when iOS explicitly reports it unavailable, and unify the offline banner copy with the shared app translation.
- Keep login and SMS request feedback aligned with confirmed reachability so online failures do not collapse into the offline copy.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `language-preferences`: first launch defaults to Chinese and UIKit honors that before initial render
- `conversation-list-behavior`: the offline banner only appears for confirmed unavailable network state
- `login-feedback`: online login failures preserve their real cause instead of showing offline copy
- `agent-spec-workflow`: runtime app assets and startup navigation polish are kept aligned during iOS verification

## Impact

- Affected specs: `language-preferences`, `conversation-list-behavior`, `login-feedback`, `agent-spec-workflow`
- Affected code: `app/_layout.tsx`, `app/(tabs)/index.tsx`, `app/login.tsx`, `hooks/useAppTranslation.ts`, `services/auth.ts`, `stores/AuthStore.ts`, `stores/PreferenceStore.ts`, `utils/network.ts`, iOS AppIcon assets
- Affected config/assets: `ios/im2rndemo/Images.xcassets/AppIcon.appiconset/App-Icon-1024x1024@1x.png`
