## Why

Android RN chat detail correctly avoids sending read receipts while the app is in the background, but when the user returns to the same visible P2P chat, pending incoming messages can remain unread because the chat timeline stays paused and the new-message notice continues blocking active-conversation recovery.

## What Changes

- Track whether the chat detail page was in the latest-message readable area before the app moved to background.
- When the app returns to foreground and that prior state was readable, restore the active chat timeline and send pending read receipts.
- Preserve the existing behavior for users who were browsing history or viewing an external chat surface: background messages still do not become read until the user returns to the latest-message area.
- Preserve the previous latest-message viewport when the user opens chat settings, system media/file/camera surfaces, or message detail pages from the latest position; incoming messages during those surfaces should be hidden behind the new-message notice until the user explicitly returns to the latest area.

## Capabilities

### Modified Capabilities

- `chat-message-read-receipt`: foreground resume must satisfy the existing pending-read-receipt rule.

## Impact

- Affected code: `app/chat/[id].tsx`
- Affected behavior: Android/RN chat-detail foreground resume read-receipt dispatch and paused-surface new-message presentation
