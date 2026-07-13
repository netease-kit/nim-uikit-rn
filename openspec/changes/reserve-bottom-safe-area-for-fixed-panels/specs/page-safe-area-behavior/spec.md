## ADDED Requirements

### Requirement: Fixed bottom regions must reserve bottom safe area

The RN pages with fixed bottom panels, bottom composer areas, or absolutely positioned bottom elements MUST reserve the device bottom safe area.

#### Scenario: Viewing an affected page on a device with a bottom safe area

- **WHEN** the user opens an affected RN page
- **THEN** bottom fixed regions and bottom-positioned actions reserve the bottom safe area
- **AND** the page content remains usable without overlapping the system gesture area
