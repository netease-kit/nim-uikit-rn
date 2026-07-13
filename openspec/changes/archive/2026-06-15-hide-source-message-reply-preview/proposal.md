## Why

The source-message detail page currently renders the quoted message with its own reply preview when that source message is itself a reply. This allows the page to expose another quoted-source layer, which conflicts with the expected single-layer source-message detail behavior.

## What Changes

- Keep the source-message detail page focused on the resolved source message only.
- Hide any nested reply preview block when rendering a message on the source-message detail page.
- Preserve the existing source-message bubble interactions for the rendered message content itself.

## Capabilities

### Modified Capabilities

- `chat-message-content`: constrain the source-message detail page to a single visible source-message layer.

## Impact

- Affected code: `app/chat/source-message.tsx`
- Affected behavior: source-message detail page reply-preview rendering
