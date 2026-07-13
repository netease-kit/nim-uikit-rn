## Why

Rapidly tapping the same merged-forward message in chat detail can execute multiple `router.push` calls before the first navigation completes, leaving duplicate merged-forward detail pages on the navigation stack.

## What Changes

- Guard merged-forward message opening from chat detail with the existing navigation lock.
- Keep normal single-tap behavior unchanged.
- Reset behavior remains tied to the shared navigation-lock focus lifecycle.

## Impact

- Affected code: `app/chat/[id].tsx`
- Affected UX: merged-forward message taps in the chat detail timeline.
- No API, message payload, or dependency changes.
