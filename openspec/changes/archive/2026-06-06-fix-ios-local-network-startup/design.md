## Context

The iOS debug build loads JavaScript from the Metro server using React Native's `RCTBundleURLProvider`. On physical devices this resolves to the Mac LAN address written into `ip.txt`, for example `192.168.0.105:8081`. Modern iOS versions require apps that access local network addresses to include a user-facing local network usage description.

## Goals / Non-Goals

**Goals:**

- Allow iPhone debug builds to reach the local Metro server instead of remaining on the transition screen.
- Keep the current Expo Router and React Native bundle loading path.

**Non-Goals:**

- Change Metro port, runtime app routing, login behavior, or IM initialization.
- Add `expo-dev-client` or replace the native startup architecture.

## Decisions

- Add `NSLocalNetworkUsageDescription` through Expo iOS config so generated native Info.plist contains the required permission copy.
- Keep `NSAllowsLocalNetworking` because it controls App Transport Security behavior and complements, but does not replace, the privacy permission description.
- In DEBUG iOS builds, read React Native's generated `ip.txt` and set `RCTBundleURLProvider`'s JS location before resolving the bundle URL. This keeps the host dynamic while avoiding a failed packager auto-detection path on physical devices.
- Allow local builds to opt into embedding a Debug `main.jsbundle`, and use React Native's fallback bundle resolution when Metro cannot be reached.

## Risks / Trade-offs

- Local network permission can still be denied by the user. The mitigation is to leave the permission prompt explicit and let users re-enable it in iOS Settings if needed.
- First iOS bundle compilation can still take tens of seconds. The mitigation is to distinguish slow initial bundling from a permission/configuration failure by checking Metro for an `iOS ... Bundled` line.
