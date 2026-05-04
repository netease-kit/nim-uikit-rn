## ADDED Requirements

### Requirement: Registration Consent And First-Time Login

The app SHALL show the first-time registration consent prompt for unregistered mobile numbers, including agreement links, agree, reject, and dismiss behaviors required by the tests.

#### Scenario: First-time mobile login

- **WHEN** a valid but unregistered mobile number reaches the pre-login step
- **THEN** the app shows the consent prompt and only proceeds after explicit agreement

#### Scenario: Operating the consent prompt

- **WHEN** the user taps the service-agreement link, privacy-policy link, dialog mask, agree action, or reject action
- **THEN** the prompt behavior and follow-up routing match the test-defined results for that control

### Requirement: Persisted Session Restore

The app SHALL persist the authenticated IM account and token locally and restore them automatically on next launch when they remain valid.

#### Scenario: Automatic login success

- **WHEN** a valid persisted session exists on app launch
- **THEN** the app restores the session and enters the authenticated shell without showing the login page

#### Scenario: Automatic login failure

- **WHEN** persisted session data is invalid, expired, or rejected
- **THEN** the app clears it and returns to the login page

### Requirement: Manual Logout

The app SHALL expose logout from the settings surface, clear both IM and local session state, and prevent stale authenticated routing after logout.

#### Scenario: Opening the logout confirmation

- **WHEN** the user taps the logout action from settings
- **THEN** the app shows the workbook confirmation dialog copy and confirm-or-cancel actions before any session state is cleared

#### Scenario: Manual logout

- **WHEN** the user confirms logout from settings
- **THEN** the app signs out, clears persisted session data, and returns to login

### Requirement: Multi-Endpoint Result Handling

The app SHALL support the test-defined multi-endpoint login policy, including concurrent logged-in devices up to the allowed limit and kick-out or rejection handling when the limit is exceeded.

#### Scenario: Multi-endpoint conflict

- **WHEN** the current endpoint is kicked or rejected by another login
- **THEN** the app exits the authenticated shell and requires re-login

#### Scenario: Logging in across multiple endpoints

- **WHEN** the same account logs in from multiple supported endpoints within the allowed limit
- **THEN** each endpoint observes the expected session result without violating the workbook's endpoint-cap policy
