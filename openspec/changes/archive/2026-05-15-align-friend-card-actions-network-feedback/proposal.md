# Align Friend Card Actions Network Feedback

## Why

Friend-card test cases require delete-friend and blacklist mutations to fail fast with the standard network-unavailable message when offline, and require delete confirmation copy to identify the contact being removed. The current card directly invokes SDK mutations for these actions, so offline feedback depends on SDK errors and the delete confirmation copy is generic.

## What Changes

- Add network prechecks before friend-card blacklist add/remove actions.
- Add network precheck before confirmed delete-friend.
- Align delete confirmation copy with the selected contact display name.
- Return to the contacts friend list after successful delete-friend.

## Impact

- Affected surface: `app/friend/friend-card.tsx`.
- No new dependencies.
- Validation uses targeted lint, TypeScript, and OpenSpec validation.
