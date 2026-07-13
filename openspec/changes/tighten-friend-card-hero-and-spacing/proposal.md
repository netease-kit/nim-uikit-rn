# Proposal

## Why

The RN friend card page currently feels too loose, and the header nickname can wrap instead of truncating. The page should use a tighter layout and keep the header nickname on a single truncated line.

## What Changes

- truncate the RN friend card hero title to a single line with ellipsis
- truncate friend-card information values such as alias, birthday, mobile, email, and signature to a single line with ellipsis
- tighten the RN friend card hero spacing and row grouping spacing
- keep the friend-card functionality unchanged

## Impact

- affected spec: `friend-card-layout`
- affected code: `app/friend/friend-card.tsx`, `src/NEUIKit/rn/contact-friend.tsx`
