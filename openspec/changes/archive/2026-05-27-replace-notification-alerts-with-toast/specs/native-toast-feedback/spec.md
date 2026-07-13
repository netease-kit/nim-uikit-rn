## ADDED Requirements

### Requirement: Notification-only feedback MUST use shared toast

The RN app SHALL present notification-only feedback through the shared toast utility instead of a system alert.

#### Scenario: Showing notification-only feedback

- **WHEN** RN needs to show feedback that only informs the user and has no required follow-up choice
- **THEN** the app uses the shared toast utility
- **AND** the feedback does not block the current screen with a system alert

#### Scenario: Preserving confirmation dialogs

- **WHEN** RN needs the user to choose between confirmation and cancellation, grant a permission in settings, or select an operation from multiple actions
- **THEN** the app may continue using a system alert with multiple buttons
- **AND** the alert is not replaced by toast
