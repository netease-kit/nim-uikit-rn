# Reduce pinned-message refresh errors

## Why

Android and iPad physical devices can emit a burst of `v2GetPinMessageList` errors during login, reconnect, or foreground restore. The current app-level refresh path expands pinned-message refresh to every loaded conversation. When 32 conversations are loaded, the app can invoke 32 concurrent SDK requests even if most conversations have never had pinned-message state.

## What Changes

- Limit app-level pinned-message refresh to the active conversation and conversations that already have tracked pinned-message state.
- Reuse an in-flight pinned-message request for the same conversation instead of starting duplicate SDK calls.
- Keep explicit chat-detail and pins-page refresh behavior unchanged for the currently opened conversation.

## Impact

- Reduces noisy SDK error bursts on Android and iPad real devices.
- Avoids unnecessary `getPinnedMessageList` traffic for conversations that have no local pinned-message state.
- Does not change pin/unpin behavior or pinned-message rendering once a conversation is opened.
