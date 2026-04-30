## Why

The offline Figma export is now available inside the repository, but page-by-page RN UI alignment
needs its own focused change instead of continuing inside the broad UIKit porting change. A separate
change keeps visual alignment work traceable, reviewable, and scoped to Figma/NEUIKit parity.

## What Changes

- Add a dedicated OpenSpec change for aligning current Expo Router pages to the local Figma
  page/state exports.
- Use `design/figma/instant-messaging/page-state-map.md` as the route-to-Figma alignment index.
- Require each UI pass to satisfy both the Figma page/state export and the `src/NEUIKit` component
  system.
- When Figma and current NEUIKit differ, update the NEUIKit component or RN adapter to match Figma
  instead of creating route-private UI.
- Track alignment page by page across entry/login, tabs, conversation, chat, contact/friend,
  team/session settings, and profile/settings routes.

## Capabilities

### New Capabilities

- `figma-page-ui-alignment`: Maintains the page/state mapping and governs the page-by-page UI
  alignment workflow between local Figma exports and `src/NEUIKit`.

### Modified Capabilities

None.

## Impact

- Affected documentation and design references:
  - `design/figma/instant-messaging/page-state-map.md`
  - `design/figma/instant-messaging/README.md`
  - `AGENTS.md`, `ARCHITECTURE.md`, `README.md` when workflow rules need clarification
- Affected implementation areas during later tasks:
  - `app/` Expo Router pages
  - `src/NEUIKit/` and `src/NEUIKit/rn/` components/adapters
  - shared theme primitives in `constants/Colors.ts`, `components/`, and `hooks/` only when needed
- No API, SDK, route contract, or dependency change is intended by this change.
