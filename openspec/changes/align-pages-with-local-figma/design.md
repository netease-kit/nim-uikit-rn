## Context

The local Figma export lives at `design/figma/instant-messaging/`, and
`design/figma/instant-messaging/page-state-map.md` maps current Expo Router pages to Figma
page/state exports while ignoring logo, icon, and pure slice assets. The broad
`port-im-kit-react-ui-h5` change has been archived, so future Figma visual alignment needs a focused
change that can progress page by page.

## Decisions

### 1. Keep Figma mapping beside the design source

`page-state-map.md` remains inside `design/figma/instant-messaging/` because the mapping is derived
from that offline export and should be reviewed next to the source screenshots.

### 2. Align through NEUIKit

Figma visuals and `src/NEUIKit` are both required. If a page differs from Figma, the fix should land
in `src/NEUIKit`, `src/NEUIKit/rn`, or a shared theme primitive whenever practical. Route files should
only compose aligned UIKit pieces and route-specific state.

### 3. Work by route groups

The alignment pass will move through route groups rather than scattered individual edits:

- entry/login
- bottom tabs and conversation list
- chat and chat subflows
- contacts/friend flows
- team/session settings
- my/profile/settings flows

This keeps validation small enough to run after each group while still making the visual pass
traceable.

## Risks

- Some current routes have no direct Figma export. Those routes should stay NEUIKit-consistent and
  be documented as unmapped until design exists.
- Some Figma pages represent inline states rather than standalone routes. The implementation should
  map those states to the owning route instead of creating new routes.
- Generated Figma assets should not be formatted or rewritten by repo tooling.

## Validation

- Validate this OpenSpec change after artifact updates.
- Run focused formatting checks for changed Markdown.
- During implementation tasks, run `npm run lint`, `npx tsc --noEmit`, and relevant Expo startup
  verification for affected route groups.
