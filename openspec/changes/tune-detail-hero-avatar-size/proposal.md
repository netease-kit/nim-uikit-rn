## Why

The previous detail-header size unification made hero avatars too close to normal list-row avatars. Detail pages still need a stronger visual hierarchy, and the product direction now requires a shared `64` avatar size for these hero headers.

## What Changes

- Increase detail-header avatar size from the list baseline to a shared `64` hero size.
- Apply the `64` avatar size consistently across shared and page-level detail headers.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `detail-hero-display`: Detail headers use a shared `64` avatar size that is larger than list rows.

## Impact

- Affected code: `src/NEUIKit/rn/contact-friend.tsx`, `app/session/p2p-settings.tsx`, `app/team/settings.tsx`, `app/(tabs)/my.tsx`
- Affected behavior: detail-header avatar sizing
