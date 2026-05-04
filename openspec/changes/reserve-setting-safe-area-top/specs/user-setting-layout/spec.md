## ADDED Requirements

### Requirement: Setting page reserves top safe-area space

The `/user/setting` page MUST reserve top safe-area spacing so the page content does not render into the system status-bar area.

#### Scenario: User opens the setting page on a device with a top inset

- **WHEN** the user opens `/user/setting` on a device with a non-zero top safe-area inset
- **THEN** the page content starts below the status-bar safe area
- **AND** the first settings card does not overlap the system status bar

#### Scenario: User opens the setting page on a device with a bottom inset

- **WHEN** the user opens `/user/setting` on a device with a bottom safe-area inset
- **THEN** the page keeps bottom spacing so the content is not flush against the bottom system area
