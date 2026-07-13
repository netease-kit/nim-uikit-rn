# Proposal

## Why

In cloud-conversation mode, the forward target picker builds its Recent Chats tab from the currently loaded conversation list. If the main conversation list has not been scrolled far enough to load older cloud conversations, opening the picker from chat only shows the already-loaded conversations and provides no way to select older cloud conversation targets.

## What Changes

- Add pagination to the forward target picker's Recent Chats tab.
- Reuse the active conversation source pagination path so cloud conversations load through `imStoreV2Bridge` and local conversations keep using `conversationStore`.
- Keep the existing target filtering, ordering, and forwarding behavior unchanged.

## Impact

- Affected spec: `chat-forwarding`
- Affected code: `app/chat/forward.tsx`
