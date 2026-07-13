## ADDED Requirements

### Requirement: System Authorization Management

The app SHALL provide a settings-managed system authorization page that displays and manages notification, camera, photo-library, and microphone permissions.

#### Scenario: Viewing system authorization settings

- **WHEN** the user opens system authorization management from Settings
- **THEN** the page shows each supported permission with a localized status label
- **AND** the page provides an action to request permission when the system can still present a native permission dialog
- **AND** the page provides an action to open system settings for denied, limited, unavailable, or otherwise externally managed permission states

#### Scenario: Returning from system authorization management

- **WHEN** the user returns to the authorization page after requesting or changing permission in system settings
- **THEN** the page refreshes the displayed permission statuses without requiring an app restart
