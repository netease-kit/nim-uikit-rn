## Why

Android devices can show incorrect in-app page icons after an APK is installed over an existing build. The RN UIKit icon component currently renders local static PNG icons through `expo-image`, which can retain or reuse native image cache entries across replacement installs and cause page icons to mismatch the current bundle resources.

## What Changes

- Render RN UIKit static page icons through React Native's built-in image component instead of the cached `expo-image` path.
- Keep the existing `UIKitIcon` API, icon names, sizing, tinting, and page call sites unchanged.
- Ensure Android overwrite installs use the current bundled local icon resources when pages render.

## Capabilities

### New Capabilities

- `rn-uikit-icons`: Covers RN UIKit local static icon rendering behavior for in-app pages.

### Modified Capabilities

- None.

## Impact

- Affected code: `src/NEUIKit/rn/icon.tsx`
- Affected surfaces: conversation, contacts, chat, settings, profile, and other RN pages using `UIKitIcon`
- No app launcher icon, notification icon, route, store, or SDK behavior changes.
