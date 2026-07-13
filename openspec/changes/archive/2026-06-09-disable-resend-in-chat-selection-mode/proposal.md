## Why

In chat multi-select mode, failed message rows still render the retry affordance and can call resend. Multi-select mode should only support batch actions such as forwarding and deletion, not per-message resend.

## What Changes

- Hide/disable failed-message resend affordances while chat multi-select mode is active.
- Add a page-level guard so resend cannot execute if selection mode becomes active before the retry callback runs.

## Impact

- Affected route: `app/chat/[id].tsx`
- Affected component: `src/NEUIKit/rn/chat-message-bubble.tsx`
- Affected behavior: failed-message retry in chat multi-select mode
- No message payload, SDK API, or forwarding behavior changes.
