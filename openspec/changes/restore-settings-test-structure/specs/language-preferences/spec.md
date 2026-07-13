## ADDED Requirements

### Requirement: Language Settings Page

The settings module SHALL provide a language settings page reachable from the first-level settings page and SHALL expose `中文` and `英文` options with a visible save action.

#### Scenario: Opening language settings

- **WHEN** the user enters the language settings page from settings
- **THEN** the page shows a back affordance, the title `语言`, a save action, and `中文` / `英文` options

### Requirement: Language Preference Persistence

The app SHALL persist the language selected from the in-app language settings page so the saved choice survives later app restarts until the user changes it again.

#### Scenario: Saving language preference

- **WHEN** the user selects `中文` or `英文` and saves the language settings page
- **THEN** the selected language preference is stored locally and becomes the active in-app override choice
