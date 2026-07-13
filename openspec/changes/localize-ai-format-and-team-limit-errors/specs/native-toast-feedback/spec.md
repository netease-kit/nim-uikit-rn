## ADDED Requirements

### Requirement: Raw SDK Error Localization

The app SHALL normalize common raw SDK English errors before displaying them in toasts or inline error states.

#### Scenario: SDK returns common raw English error

- **WHEN** an app-visible operation receives a known SDK error message such as `resource not exist`, `invalid parameter`, `timeout`, or `no permission`
- **THEN** the app MUST display a localized app-language message instead of the raw English SDK text
