# Preserve P2P Nickname After Friend Delete

## Why

After chatting with user A, deleting A as a friend, uninstalling/reinstalling, and logging in again, the historical P2P conversation can render A's account ID as the row/chat title. The app currently depends on locally loaded friend/user data for this fallback, so a cold install has no nickname source once the friendship is gone.

## What Changes

- Preload cloud user profiles for visible P2P conversation targets even when they are no longer friends.
- Keep the UIKit appellation priority unchanged: friend alias, UIKit store, team nickname, user profile nickname, message nickname, account.
- Apply the same resolved identity to the conversation list row and chat header.

## Impact

- Affects P2P conversation identity display in the conversation list and chat detail.
- Does not change friend deletion behavior or conversation persistence.
