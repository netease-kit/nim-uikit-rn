## Context

The current RN chat page exposes an emoji toolbar action but still shows a placeholder alert
instead of a picker. The H5 UIKit composer already defines the expected behavior: a dedicated emoji
panel, insertion by token, whole-token deletion, and a send affordance inside the panel. The RN
chat page also relies on a bottom composer layout that can be obscured by the mobile keyboard.

## Goals / Non-Goals

**Goals:**
- Reproduce the H5 emoji-composer interaction model in the RN chat detail page.
- Reuse existing emoji token and parsing utilities where they can be made RN-safe.
- Keep the composer, send button, and auxiliary panels visible when the keyboard opens.
- Render supported emoji tokens consistently in text message bubbles.

**Non-Goals:**
- Adding sticker packs, GIFs, or custom emoji management.
- Reworking unrelated chat attachment flows or message action sheets.
- Changing the underlying message payload format away from existing emoji tokens.

## Decisions

### Use existing token-based emoji data instead of inventing a new payload

The RN composer will insert the same bracketed emoji tokens used by the H5 UIKit implementation,
such as `[大笑]`. This keeps send behavior compatible with the existing text-message path and avoids
introducing a new message type.

### Make the shared emoji utility RN-safe and reuse its mappings

The shared emoji utility currently depends on `localStorage` during module initialization. The
implementation will make that access environment-safe so the RN chat page can reuse the existing
emoji token mappings and parsing logic instead of duplicating them in route code.

### Implement the RN emoji panel in the RN adapter layer

The new picker UI and inline rich-text helpers belong in `src/NEUIKit/rn`, not directly inside the
route, so the page keeps using the NEUIKit adapter as its chat UI baseline. The route will own only
page-level state toggling and send behavior.

### Use keyboard-aware layout at the page level

Keyboard avoidance will be handled in the RN chat route with safe-area-aware layout adjustments, so
the existing composer, reply draft, and bottom panels stay visible without changing unrelated store
behavior.

## Risks / Trade-offs

- [Inline emoji rendering may differ slightly from H5 metrics] → Use the shared emoji asset set and
  keep sizing in the RN adapter so spacing can be tuned in one place.
- [Keyboard behavior differs across iOS and Android] → Base the solution on RN keyboard-aware layout
  primitives and verify with `npm run lint`, `npx tsc --noEmit`, and app startup.
- [Shared utility changes could affect web assumptions] → Limit the shared change to environment-safe
  language initialization and keep token formats untouched.

## Migration Plan

1. Update OpenSpec artifacts for the composer behavior change.
2. Add the RN emoji panel and emoji-rich text helpers.
3. Wire the chat route to open/close the emoji panel, insert/delete/send emoji tokens, and keep the
   composer visible above the keyboard.
4. Validate OpenSpec, lint, typecheck, and Expo startup.

## Open Questions

None.
