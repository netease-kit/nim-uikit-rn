## MODIFIED Requirements

### Requirement: Notification-only feedback MUST use shared toast

The RN app SHALL present notification-only feedback through the shared toast utility instead of a system alert. When notification-only feedback includes a known SDK error code or known SDK English error message, the shared toast utility SHALL display the localized message for the active app language instead of the raw SDK text.

#### Scenario: Showing notification-only feedback

- **WHEN** RN needs to show feedback that only informs the user and has no required follow-up choice
- **THEN** the app uses the shared toast utility
- **AND** the feedback does not block the current screen with a system alert

#### Scenario: Preserving confirmation dialogs

- **WHEN** RN needs the user to choose between confirmation and cancellation, grant a permission in settings, or select an operation from multiple actions
- **THEN** the app may continue using a system alert with multiple buttons
- **AND** the alert is not replaced by toast

#### Scenario: Known SDK error in shared toast

- **WHEN** RN invokes the shared toast utility with a known SDK English error message such as `friend not exist`
- **THEN** the toast MUST display a localized message for the active app language
- **AND** the toast MUST NOT display the raw SDK English error text
