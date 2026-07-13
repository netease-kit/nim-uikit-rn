# Proposal

## Why

Voice messages currently hide Pin and Collect because those actions are tied to forwardability, and voice messages are intentionally not forwardable. Also, the long-press action menu keeps a five-column width even when only two or three actions are available, leaving an oversized panel.

## What Changes

- allow eligible voice messages to show Pin and Collect in the long-press menu
- keep Forward hidden for unsupported voice forwarding
- size the long-press action menu width to the actual number of visible action columns, up to the existing maximum column count

## Impact

- affected spec: `chat-message-actions-and-receipts`
- affected code: `app/chat/[id].tsx`, `src/NEUIKit/rn/chat.tsx`
