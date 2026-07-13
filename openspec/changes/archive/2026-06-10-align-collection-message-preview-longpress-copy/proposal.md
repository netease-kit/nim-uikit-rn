# align-collection-message-preview-longpress-copy Proposal

## Why

Collected text + emoji messages currently open a message-preview page whose UI and copy interaction differ from native expectations. The page shows a message card and timestamp, and copying relies on a bottom action entry, rather than a lightweight tooltip-style copy affordance near the content.

## What Changes

- For collection-sourced text + emoji message detail, render only the full content itself (no message bubble wrapper, no timestamp).
- Provide copy through a tooltip-style floating menu shown above the content with a downward arrow.
- Keep other preview sources and the original-address mode unchanged.

## Impact

- Affects My > Collection text message detail presentation and copy interaction.
