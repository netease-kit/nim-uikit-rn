## 1. Spec

- [x] 1.1 Create change `support-location-messages`
- [x] 1.2 Add `chat-location-messages` spec for RN chat location behavior

## 2. Implementation

- [x] 2.1 Add MessageStore location-message send support
- [x] 2.2 Replace chat location placeholder with a location picker route and confirmation flow
- [x] 2.3 Register Expo location plugin foreground permission metadata
- [x] 2.4 Ensure location messages can be resent with their original coordinates and address
- [x] 2.5 Support picker fallback editing when live map or reverse geocoding is unavailable
- [x] 2.6 Align the RN picker interaction with Android/iOS UIKit by adding map selection, current-location reset, keyword search, and a selectable POI result list
- [x] 2.7 Add a native-first location picker bridge so Android uses AMap and iOS routes through NEMapKit when the native modules are available

## 3. Validation

- [x] 3.1 Run `OPENSPEC_TELEMETRY=0 openspec validate support-location-messages --type change --no-interactive`
- [x] 3.2 Run targeted ESLint for touched source files
- [x] 3.3 Run `npx tsc --noEmit`
- [x] 3.4 Verify existing Metro responds or start Expo when the port is free
