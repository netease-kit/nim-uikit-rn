# Proposal

## Why

The custom bottom tab bar uses narrow fixed label widths that can clip Chinese tab names on some devices or font rendering environments. The tab names should remain fully visible while preserving the existing bottom tab visual layout.

## What Changes

- Let bottom tab labels use the full tab touch width instead of icon-sized label widths.
- Center each label under its icon and keep it to a single line.
- Preserve existing tab icons, unread dots, colors, and safe-area behavior.

## Impact

- Affects the custom bottom tab bar in `app/(tabs)/_layout.tsx`.
- Does not change tab route structure or tab navigation behavior.
