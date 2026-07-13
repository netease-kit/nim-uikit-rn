## Why

Android chat file-send currently opens the system document picker directly on first use, while the image/video entry requests media-library permission first. This creates an inconsistent first-use permission flow across attachment entry points.

## What Changes

- Update the Android chat file-send entry to reuse the existing media-library permission request before opening the system document picker.
- Keep the current iOS file source selection behavior unchanged.
- Do not add any extra RN-owned confirmation dialog before the Android system permission prompt.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `permission-flows`: Android chat file-send entry must request the same system media permission as the image/video entry on first use.

## Impact

- Affected code: `app/chat/[id].tsx`
- Affected behavior: Android file-send first-use permission timing
- No API or dependency changes
