# Proposal

## Why

The RN forward target picker currently orders the friends tab with a flat locale comparison. The contacts tab groups friends by the UIKit pinyin section order and renders friends by expanding those sections. This can make the forward picker friends tab appear in a different order from the contacts friend directory.

## What Changes

- Build the forward picker friends tab with the same display-name and pinyin-section ordering used by the contacts friend directory.
- Keep blacklist and AI-user filtering unchanged.
- Keep the forward target selection UI and send behavior unchanged.

## Impact

- affected spec: `chat-forwarding`
- affected code: `app/chat/forward.tsx`
