## ADDED Requirements

### Requirement: SMS login must use a lighter IM sync level

RN SMS login MUST use the basic IM sync level when starting a fresh IM login so the post-login wait time matches the Android reference behavior more closely.

#### Scenario: Logging in with SMS code

- **WHEN** the user submits a valid mobile number and SMS code
- **THEN** RN starts IM login with the basic data sync level

### Requirement: Login page must show explicit login-in-progress feedback

RN SMS login MUST show explicit in-progress feedback while the login request and IM login are still running.

#### Scenario: Waiting for login completion

- **WHEN** the user taps the login button and the login flow is pending
- **THEN** the login page shows a loading state on the button
- **AND** the page shows localized login-in-progress guidance until the request finishes
