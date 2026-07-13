## Why

Several high-frequency navigation entries can be tapped multiple times before route transitions complete, causing duplicate pages to be pushed onto the stack on Android and iOS. The chat detail settings entry is one visible example, but the same pattern affects chat-entry and detail-entry flows elsewhere.

## What Changes

- Prevent repeated taps on high-frequency navigation entries from opening duplicate pages during one navigation transition.
- Cover chat detail settings entry paths, common chat-entry paths, and related detail/settings sub-entry paths that currently push routes directly.
- Reset navigation guards when the source screen becomes active again so later interactions still work normally.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `chat-detail`: Protected chat-related navigation entries ignore duplicate taps while navigation is already in progress.

## Impact

- Affected code: `app/chat/[id].tsx`, `app/chat/pins.tsx`, `app/conversation/search.tsx`, `app/(tabs)/index.tsx`, `app/(tabs)/contacts.tsx`, `app/(tabs)/my.tsx`, `app/contacts/blacklist.tsx`, `app/contacts/teamlist.tsx`, `app/contacts/ai-users.tsx`, `app/friend/add.tsx`, `app/friend/friend-card.tsx`, `app/session/p2p-settings.tsx`, `app/team/info.tsx`, `app/team/members.tsx`, `app/team/settings.tsx`, `app/user/aboutNetease.tsx`, `app/user/collection.tsx`, `app/user/my-detail.tsx`, `app/user/setting.tsx`, `hooks/useNavigationLock.ts`
- Affected behavior: repeated taps on protected chat, list, detail, collection, and settings navigation entries
