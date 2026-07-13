## Why

Android currently shows a white status bar background with white system status text/icons, making time, signal, and battery unreadable on light pages.

## What Changes

- Set the app-level native status bar to a light background with dark content.
- Keep the configuration centralized in the root layout so all routes inherit readable status bar contrast.

## Impact

- Affected file: `app/_layout.tsx`
- Affected platform: Android native status bar
- No navigation, SDK, data, or page layout changes.
