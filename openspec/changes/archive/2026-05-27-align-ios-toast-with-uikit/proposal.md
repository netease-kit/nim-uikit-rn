## Why

The RN app currently falls back to `Alert.alert` for iOS toast-like feedback, which breaks the IM UIKit interaction baseline and creates inconsistent transient feedback across screens. We need iOS toast feedback to align with the referenced UIKit behavior now that Android and the shared RN toast entry points are already in active use.

## What Changes

- Add a shared RN native toast presentation capability that renders transient floating feedback on iOS instead of using system alerts.
- Route existing shared RN toast calls through the new host on iOS while preserving Android `ToastAndroid` behavior.
- Replace local one-off iOS toast-like alert fallbacks in key RN screens with the shared toast pathway so feedback style is consistent.

## Capabilities

### New Capabilities

- `native-toast-feedback`: Present transient non-blocking toast feedback in the RN app with a shared host that matches the UIKit-style iOS interaction pattern.

### Modified Capabilities

## Impact

Affected code includes the shared RN root layout, native toast utilities, and RN screens that currently emulate toast with `Alert.alert` or page-local overlays. No external API changes are expected.
