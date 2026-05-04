## ADDED Requirements

### Requirement: SMS Login Page Layout

The app SHALL provide a verification-code login page with the UI structure required by the `登录-18` test suite, including title, mobile input, SMS code input, SMS request action, login action, and error-feedback area.

#### Scenario: Viewing the login page

- **WHEN** the app routes to the login screen
- **THEN** the screen shows the verification-code login UI elements and placeholder copy required by the tests

### Requirement: Mobile Input Rules

The login form SHALL restrict the mobile field to the supported number pattern, expose the clear action, and reject empty, short, malformed, or unsupported mobile numbers.

#### Scenario: Editing the mobile field

- **WHEN** the user types or clears the mobile field
- **THEN** the input state, clear action, and validation behavior match the test-case rules

### Requirement: SMS Code Input Rules

The login form SHALL provide a dedicated SMS-code field that supports only the test-approved code format, preserves the typed value across countdown updates, and rejects empty or malformed code input on submit.

#### Scenario: Editing the SMS code field

- **WHEN** the user enters, clears, or leaves the SMS field empty
- **THEN** the field and validation state follow the workbook rules for format and requiredness

### Requirement: SMS Input And Request Rules

The login form SHALL enforce request preconditions, countdown duration, retry timing, effective-code window, request-count limits, and over-limit cooldown behavior from the tests.

#### Scenario: Requesting an SMS code

- **WHEN** the user requests an SMS code with a valid mobile number
- **THEN** the app starts the expected countdown and blocks repeated requests until the countdown or server policy allows retry

#### Scenario: Requesting SMS with invalid mobile state

- **WHEN** the user requests an SMS code with empty, short, malformed, or otherwise invalid mobile input
- **THEN** the app blocks the request locally and stays on the login page with explicit feedback

#### Scenario: Submitting invalid login input

- **WHEN** the user submits login with missing or invalid mobile or SMS code input
- **THEN** the app blocks login and stays on the login page with explicit feedback

### Requirement: SMS Login Submission

The login form SHALL accept registered-mobile plus valid-code combinations, reject wrong or expired codes, and route the user only after a successful token exchange and IM session setup.

#### Scenario: Submitting a valid registered login

- **WHEN** the user enters a registered mobile number and a valid SMS code
- **THEN** the app completes login and enters the authenticated shell
