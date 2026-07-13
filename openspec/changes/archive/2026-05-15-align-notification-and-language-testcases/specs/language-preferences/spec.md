## ADDED Requirements

### Requirement: Language Preference Persistence

The app SHALL persist the language selected from the in-app language settings page so the saved choice survives later app restarts until the user changes it again.

#### Scenario: Saving language preference

- **WHEN** the user selects `中文` or `英文` and saves the language settings page
- **THEN** the selected language preference is stored locally and becomes the active in-app override choice for the settings and My-profile route chain

### Requirement: System Language Fallback

The app SHALL follow the current system language when the user has not yet saved an in-app override.

#### Scenario: Launching without a saved in-app language

- **WHEN** the app starts without a previously saved in-app language override
- **THEN** the app resolves its displayed language from the current system language, using Chinese for `zh*` locales and English otherwise
