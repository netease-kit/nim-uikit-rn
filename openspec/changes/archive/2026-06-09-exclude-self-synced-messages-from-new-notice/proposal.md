## Why

When the same account is logged in on multiple devices, messages sent from another endpoint sync into the current chat timeline. The current RN logic only excludes locally sending or failed outgoing messages from the new-message notice, so synced self messages are counted as new messages while the user browses history.

## What Changes

- Treat all messages whose sender is the current login account as self messages for new-message notice counting.
- Continue rendering synced self messages in the timeline without auto-scrolling the user away from history.
- Keep remote messages from other users counted in the new-message notice.

## Impact

- Affected route: `app/chat/[id].tsx`
- Affected behavior: chat detail new-message notice count during multi-end same-account sync
- No SDK API, message payload, store schema, or navigation changes.
