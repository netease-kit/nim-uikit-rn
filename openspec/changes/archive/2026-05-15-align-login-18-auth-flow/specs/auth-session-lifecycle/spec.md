## MODIFIED Requirements

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
