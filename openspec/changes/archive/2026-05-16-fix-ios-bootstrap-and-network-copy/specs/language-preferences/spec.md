## MODIFIED Requirements

### Requirement: Default App Language

The app SHALL default to Chinese on first launch unless the user explicitly changes the in-app language preference later.

#### Scenario: First launch without saved language preference

- **GIVEN** the app has no persisted language preference
- **WHEN** the user launches the app for the first time
- **THEN** the app renders Chinese copy by default
- **AND** UIKit-managed text also renders in Chinese on the first visible screen
