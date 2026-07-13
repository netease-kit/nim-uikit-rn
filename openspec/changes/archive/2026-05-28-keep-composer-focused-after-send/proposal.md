# Proposal

## Why

After sending a message from the chat detail composer, the input can lose focus and hide the keyboard. This interrupts continuous text entry because users must tap the composer again before typing the next message.

## What Changes

- Keep the text composer editable while a text send request is in flight.
- After a successful text or reply send, restore focus to the composer when it was focused before sending.
- Preserve existing behavior for empty messages, muted team chats, duplicate send guards, and failed send feedback.

## Impact

- Affects `app/chat/[id].tsx` text and reply message send interactions.
- Does not change media, voice, file, location, or selection-mode send behavior.
