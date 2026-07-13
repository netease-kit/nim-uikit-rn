# Proposal

## Why

The RN chat voice record panel currently uses a custom expanding ring effect and cancel-state styling that differs from Android. The visual feedback for press-to-talk should align with Android so recording interactions feel consistent across platforms.

## What Changes

- align the RN press-to-talk animation with the Android voice record wave effect
- align the RN pressed voice record button state with the Android visual treatment
- keep the scope limited to the chat voice record panel without changing audio send logic

## Impact

- affected spec: `chat-voice-record-animation`
- affected code: `app/chat/[id].tsx`
