# Change: Remove P2P Settings Friend Card Entry

## Why

The single-chat settings page currently exposes a duplicated `查看好友名片` row below the reminder and stick-top controls. The page already has a peer avatar/name item at the top that opens the peer profile card, so the extra row should be removed to match the requested settings surface.

## What Changes

- Remove the standalone `查看好友名片` row from the P2P settings page.
- Keep the top peer avatar/name item as the profile-card entry.
- Update AI profile routing expectations so P2P settings profile entry refers to the peer item instead of the removed row.

## Impact

- Affects `app/session/p2p-settings.tsx`.
- Affects P2P settings and AI profile entry specifications.
- Does not change P2P reminder, stick-top, message mark, or invite-to-group behavior.
