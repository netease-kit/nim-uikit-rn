## ADDED Requirements

### Requirement: Maintained Figma Page Mapping

The project SHALL maintain a route-to-Figma page/state mapping for the local offline Figma export,
excluding logo-only, icon-only, and pure slice assets from page alignment scope.

#### Scenario: Route mapping is available before UI work

- **WHEN** an agent or contributor starts a page UI alignment task
- **THEN** the mapping at `design/figma/instant-messaging/page-state-map.md` identifies the relevant
  project route and Figma page/state export when one exists

#### Scenario: Non-page exports are excluded

- **WHEN** the Figma export contains logo, icon, or pure slice assets
- **THEN** those assets are listed as ignored or omitted from route-level page alignment tasks

### Requirement: Figma And NEUIKit Dual Satisfaction

Page UI alignment SHALL satisfy both the local Figma page/state export and the `src/NEUIKit`
component system.

#### Scenario: NEUIKit differs from Figma

- **WHEN** the current NEUIKit component or RN adapter differs visually from the mapped Figma
  page/state
- **THEN** the implementation updates or adapts NEUIKit so the page UI matches Figma without
  introducing route-private replacement UI

#### Scenario: Behavior and visuals conflict

- **WHEN** a Figma visual detail conflicts with an OpenSpec requirement or test case behavior
- **THEN** the behavior contract remains authoritative and the visual implementation records the
  deviation in the page alignment task notes

### Requirement: Page-by-page Alignment Evidence

Each completed page alignment SHALL record the mapped route, mapped Figma page/state exports,
affected NEUIKit component or RN adapter, and validation performed.

#### Scenario: Page alignment is completed

- **WHEN** a route is marked aligned
- **THEN** the corresponding task entry identifies the route, the Figma export names, the NEUIKit
  files touched, and the validation command or manual check used

### Requirement: Unmapped Routes Remain Explicit

Routes without a direct Figma page/state export SHALL remain documented as unmapped instead of
silently inventing one-off visual behavior.

#### Scenario: Route has no direct Figma export

- **WHEN** a current project route has no direct matching Figma page/state export
- **THEN** the mapping marks it as `none` or describes the closest supporting state, and the route
  keeps NEUIKit-consistent UI until a design export is added
