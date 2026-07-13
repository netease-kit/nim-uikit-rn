## Context

The regressions are split across four startup layers:

- persistent preferences decide the default language
- UIKit's own i18n module keeps an internal mutable language state
- Expo Router stack headers fall back to route-group names when back titles are not suppressed
- iOS `NetInfo` can initially report `isInternetReachable = null`, which should not be treated as a hard offline state
- login and SMS flows currently surface thrown errors directly, so upstream misclassification becomes the user-facing copy

The launcher icon issue is separate from JS runtime behavior because iOS uses the checked-in asset catalog during native builds.

## Decision

- Change the default stored language preference from `system` to explicit Chinese.
- Initialize both app-level and UIKit-level language state at module load in `app/_layout.tsx`, then keep the existing reactive sync effect for later preference changes.
- Set the root stack to minimal iOS back-button display so grouped route names such as `(tabs)` never render as fallback back text.
- Keep network unavailable behavior strict only for `isConnected !== true` or `isInternetReachable === false`, and reuse the shared translated offline message for the conversation banner.
- Reuse the same strict offline detection in login-related error normalization. When the device is online, preserve server or SDK error details instead of replacing them with the offline copy.
- Replace the checked-in native iOS AppIcon PNG with the current Expo `assets/images/icon.png` source so simulator and device installs use the intended icon.

## Validation

- Validate the OpenSpec change.
- Run `npm run lint`.
- Run `npx tsc --noEmit`.
- Start the iOS target and confirm the app installs with the expected icon, opens in Chinese on first launch, no `(tabs)` text appears in back navigation, the conversation home does not show a false offline banner, and login feedback only uses offline copy for confirmed offline state.
