## Why

Merged-forward detail pages should match the native merged-forward viewer. Native Android and iOS use a fixed `聊天记录` title and always show each child record's sender identity from the forwarded message metadata. RN currently derives the title from the source conversation and only some message types show sender identity, so users cannot consistently see who sent each record.

## What Changes

- Use the fixed localized chat-history title for merged-forward detail pages.
- Show sender avatar and sender name for every merged-forward child message.
- Prefer the forwarded message metadata keys `mergedMessageNickKey` and `mergedMessageAvatarKey` for sender identity, then fall back to the sender account.
- Keep existing placeholder message body and tap behavior unchanged.
- Preserve the existing read-only merged-forward detail page behavior without adding composer or send actions.

## Impact

- Affects merged-forward detail page title and sender identity rendering.
- Does not affect normal chat detail timeline rendering or forwarding payload generation.
