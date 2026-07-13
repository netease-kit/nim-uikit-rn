## ADDED Requirements

### Requirement: Known SDK Errors Follow App Language

The app SHALL translate known SDK error codes and known SDK English error messages into the active app language before displaying them as user-facing error feedback.

#### Scenario: Known SDK English error in Chinese UI

- **GIVEN** the active app language is Chinese
- **WHEN** a user-facing operation fails with the SDK message `friend not exist`
- **THEN** the visible feedback MUST display a Chinese localized message
- **AND** the visible feedback MUST NOT include the untranslated text `friend not exist`

#### Scenario: Known SDK error code

- **WHEN** a user-facing operation fails with a known SDK error code
- **THEN** the visible feedback MUST use the localized message mapped to that error code
