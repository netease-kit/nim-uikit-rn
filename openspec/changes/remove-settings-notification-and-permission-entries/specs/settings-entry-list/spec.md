## ADDED Requirements

### Requirement: Settings page must hide notification and permissions entries

The RN settings page MUST NOT display the notifications entry or the system permissions entry.

#### Scenario: Viewing the settings page

- **WHEN** the user opens the RN settings page
- **THEN** the notifications entry is not displayed
- **AND** the system permissions entry is not displayed
- **AND** the remaining settings items continue to render normally
