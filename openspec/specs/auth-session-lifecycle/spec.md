# auth-session-lifecycle Specification

## Purpose

TBD - created by archiving change port-im-kit-react-ui-h5. Update Purpose after archive.

## Requirements

### Requirement: Registration Consent And First-Time Login

The app SHALL show the first-time registration consent prompt for unregistered mobile numbers, including agreement links, agree, reject, and dismiss behaviors required by the tests.

#### Scenario: First-time mobile login

- **WHEN** a valid but unregistered mobile number reaches the pre-login step
- **THEN** the app shows the consent prompt and only proceeds after explicit agreement

#### Scenario: Operating the consent prompt

- **WHEN** the user taps the service-agreement link, privacy-policy link, dialog mask, agree action, or reject action
- **THEN** the prompt behavior and follow-up routing match the test-defined results for that control

### Requirement: Persisted Session Restore

The app SHALL persist the authenticated IM account and token locally and restore them automatically on next launch only after IM login validation succeeds.

#### Scenario: Automatic login success

- **WHEN** a valid persisted session exists on app launch
- **THEN** the app validates the stored IM account and token before entering the authenticated shell
- **AND** after validation succeeds it enters the authenticated shell without showing the login page

#### Scenario: Automatic login failure

- **WHEN** persisted session data is invalid, expired, or rejected
- **THEN** the app clears it before exposing the authenticated shell
- **AND** it returns to the unauthenticated pre-login surface that requires re-login

### Requirement: Manual Logout

The app SHALL expose logout from the settings surface, clear both IM and local session state, and prevent stale authenticated routing after logout.

#### Scenario: Opening the logout confirmation

- **WHEN** the user taps the logout action from settings
- **THEN** the app shows the workbook confirmation dialog copy and confirm-or-cancel actions before any session state is cleared

#### Scenario: Manual logout

- **WHEN** the user confirms logout from settings
- **THEN** the app signs out, clears persisted session data, and returns to login

### Requirement: Logout Clears Cached IM View State

The app SHALL clear cached IM view state when the user logs out, when persisted auth session data is cleared, and before a different IM account is allowed to enter the authenticated shell.

#### Scenario: User logs out after viewing conversations in one mode

- **WHEN** the user logs out or persisted auth session data is cleared
- **THEN** local conversation, message, team, and user caches MUST be reset before the next login session
- **AND** the next login session MUST NOT render stale conversation data from the previous account or previous cloud-conversation mode

#### Scenario: Switching to another account after an existing session

- **WHEN** the user starts a new login flow while another IM account still has local session state in memory or storage
- **THEN** the app MUST clear the previous account's local conversation, message, friend, team, and user caches before exposing the new authenticated session
- **AND** the new account's conversation list MUST NOT render rows, unread state, or preview data from the previous account

### Requirement: Multi-Endpoint Result Handling

The app SHALL support the test-defined multi-endpoint login policy, including concurrent logged-in devices up to the allowed limit and kick-out or rejection handling when the limit is exceeded.

#### Scenario: Multi-endpoint conflict

- **WHEN** the current endpoint is kicked or rejected by another login
- **THEN** the app exits the authenticated shell and requires re-login

#### Scenario: Logging in across multiple endpoints

- **WHEN** the same account logs in from multiple supported endpoints within the allowed limit
- **THEN** each endpoint observes the expected session result without violating the workbook's endpoint-cap policy
