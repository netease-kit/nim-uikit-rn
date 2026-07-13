## Why

RN chat reply previews currently treat a missing local reply source as recalled or deleted. When the replied source is an audio message or another non-text message outside the initially loaded history window, the source can still exist on the server but not yet be in the local message list, so the preview incorrectly shows `该消息已被撤回或删除`.

## What Changes

- Hydrate missing `threadReply` source messages from the SDK by message refers when the chat timeline renders reply messages whose sources are not loaded locally.
- Merge hydrated reply source messages into the existing message store so existing reply preview rendering can show audio, file, image, video, and other non-text previews.
- Keep the existing revoked/deleted fallback only when the source cannot be hydrated or has actually been revoked/deleted.

## Impact

- Affected code: `stores/MessageStore.ts`, `app/chat/[id].tsx`
- Affected behavior: chat reply preview rendering and reply-source tapping for messages whose source is outside the currently loaded history window.
- No API or dependency changes.
