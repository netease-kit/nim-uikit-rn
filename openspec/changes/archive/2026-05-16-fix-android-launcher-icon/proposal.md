# Proposal

## Why

The Android package currently installs with the default Expo placeholder launcher icon instead of the NetEase IM icon used on iOS, so the app appears to have no correct branded icon after installation.

## What Changes

- Replace the Android launcher icon resources with assets generated from the same source icon used by iOS.
- Keep the installed Android app icon visually aligned with the iOS installed app icon.
- Rebuild and install the Android release package on a connected device to verify the icon is applied.

## Impact

- Affects Android installed app icon resources under `android/app/src/main/res/`.
