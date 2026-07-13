## Why

iOS physical devices can remain on the native transition screen when a debug build cannot reach the Metro server at the Mac LAN address. The current iOS configuration allows local networking at the transport layer but does not declare the user-facing local network permission prompt needed by modern iOS versions.

## What Changes

- Add the iOS local network usage description required for debug builds to access Metro on `192.168.x.x:8081`.
- Keep the existing Expo/React Native startup path and Metro port unchanged.
- Reinstall the iOS debug build after updating the native configuration.

## Capabilities

### New Capabilities

- `ios-local-metro-startup`: covers iOS physical-device debug startup behavior when loading JavaScript from the local Metro server.

### Modified Capabilities

- None.

## Impact

- `app.json`
- iOS generated native configuration under `ios/im2rndemo/Info.plist`
- iOS debug build installation flow for physical devices
