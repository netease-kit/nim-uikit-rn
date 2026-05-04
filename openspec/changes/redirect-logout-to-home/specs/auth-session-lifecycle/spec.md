## MODIFIED Requirements

### Requirement: Manual Logout

The app SHALL expose logout from the settings surface, clear both IM and local session state, and
prevent stale authenticated routing after logout.

#### Scenario: Opening the logout confirmation

- **WHEN** the user taps the logout action from settings
- **THEN** the app shows the workbook confirmation dialog copy and confirm-or-cancel actions before
  any session state is cleared

#### Scenario: Manual logout

- **WHEN** the user confirms logout from settings
- **THEN** the app signs out, clears persisted session data, and returns to `home`
