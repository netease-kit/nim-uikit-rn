# Proposal

## Why

RN currently renders audio/video call record messages inconsistently with the Web implementation. Conversation previews show audio/video-specific labels instead of the shared call-record label, and chat detail does not render the dedicated call-record row style.

## What Changes

- align conversation-list previews for call messages to the shared `[话单消息]` / `[Call Message]` label
- align chat-detail call messages to a dedicated inline row with call icon, status text, and optional duration
- reuse a shared RN call-message parser so previews and detail rows stay consistent

## Impact

- affected spec: `call-message-rendering`
- affected code: `app/(tabs)/index.tsx`, `src/NEUIKit/rn/chat-message-bubble.tsx`, `utils/messageForward.ts`, `utils/callMessage.ts`
