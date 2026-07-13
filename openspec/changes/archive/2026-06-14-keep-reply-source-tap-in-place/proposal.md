## Why

Chat reply previews currently scroll the conversation to the referenced source message when tapped. The desired behavior is to keep chat position stable and show the quoted source message on a dedicated detail page.

## What Changes

- Make chat-detail reply source preview taps open a dedicated source-message detail page.
- Render only the referenced source message on that page using the same message bubble style as chat detail.
- Render the referenced source message on the left side, including messages sent by the current user.
- For current-user source messages, display the sender name using priority group nickname, personal nickname, then account ID.
- Prevent reply source preview taps from jumping or scrolling to the original source-message position.
- Keep source-message bubble interactions aligned with chat detail for media preview, file download/open, audio playback, location, and merged-forward details.

## Capabilities

### Modified Capabilities

- `chat-message-content`: Add the source-message detail page behavior for reply-preview taps without timeline jumping.

## Impact

- Affected code: `app/chat/[id].tsx`
- Affected code: `app/chat/source-message.tsx`
- Affected code: `utils/app-language.ts`
- Affected behavior: chat detail reply message quoted-source tap interaction
