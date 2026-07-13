## Why

Several recently ported IM surfaces still diverge from the UIKit/Figma baseline: offline status text can bypass localization, settings lacks a central system-permission management entry, merged-forward detail uses a list-card style instead of chat bubbles, reply references open a detail page instead of locating the source message, and Contacts does not expose AI users as a first-class entry.

## What Changes

- Localize offline status copy through the app translation layer wherever RN chat or contacts surfaces render it.
- Add a settings entry for system authorization management and expose notification, camera, album, and microphone permission statuses with request/open-settings actions.
- Render merged-forward detail records with the same RN UIKit chat bubble component used by chat detail, and keep the merged-forward detail page read-only without a composer.
- Change reply-reference taps in chat detail to scroll to the source message and temporarily highlight it instead of opening a message detail page.
- Add `我的数字人` below `我的群聊` on Contacts and route it to a list of AI users that can open an AI p2p conversation.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `chat-forwarding-and-selection`: merged-forward detail viewing must use chat-detail message styling and remain read-only.
- `chat-timeline-and-history`: reply-reference navigation must locate and highlight the source message in the current timeline.
- `contacts-home`: Contacts must expose and navigate to a first-class AI user list.
- `permission-flows`: system authorization management must show and manage all app-level permissions from settings.
- `user-setting-page`: Settings must include a system authorization management entry.

## Impact

- Affected routes: `app/chat/[id].tsx`, `app/chat/merged-forward-detail.tsx`, `app/(tabs)/contacts.tsx`, `app/contacts/ai-users.tsx`, `app/user/setting.tsx`, `app/user/system-permissions.tsx`
- Affected shared UIKit/RN utilities: `src/NEUIKit/rn/chat-message-bubble.tsx`
- Affected permissions/localization utilities: `utils/permissions.ts`, `utils/app-language.ts`
- No dependency changes are expected.
