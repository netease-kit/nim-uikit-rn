## MODIFIED Requirements

### Requirement: Composer And Auxiliary Panels

The chat page SHALL provide the placeholder copy, emoji panel, more-actions half sheet, and camera,
album, and file entry points required by the tests.

#### Scenario: Opening composer auxiliary panels

- **WHEN** the user opens emoji or more-actions controls from the composer
- **THEN** the page shows the expected panel content and entry affordances

#### Scenario: Opening the chat album entry

- **WHEN** the user taps the chat composer image entry while photo-library permission has not yet been granted
- **THEN** the app MUST enter the system photo-library permission flow directly without showing an app-defined media-choice dialog first
- **AND** after permission is granted it MUST open the system photo picker from the same tap flow
- **AND** after permission is denied it MUST keep the user on the current chat surface
