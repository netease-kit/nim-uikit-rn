# Proposal

## Why

Card-style profile pages currently use taller information rows than needed for single-line metadata. These profile-card information rows should use a more compact single-line presentation.

## What Changes

- add a compact information-row presentation for single-line metadata
- apply the compact information-row presentation to friend-card and my-detail pages
- keep existing interactions and truncation behavior unchanged

## Impact

- affected spec: `info-row-density`
- affected code: `src/NEUIKit/rn/contact-friend.tsx`, `app/friend/friend-card.tsx`, `app/user/my-detail.tsx`
