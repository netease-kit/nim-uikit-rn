## MODIFIED Requirements

### Requirement: SMS Login Page Layout

The app SHALL provide a verification-code login page with the UI structure required by the `登录-18` test suite, including the page title, the unregistered-mobile helper copy, the mobile input, the SMS code input, the SMS request action, the login action, and the registration-consent prompt controls required by the suite.

#### Scenario: Viewing the login page

- **WHEN** the app routes to the login screen
- **THEN** the screen shows the title `验证码登录`
- **AND** it shows the helper copy that unregistered mobile numbers will auto-register after SMS verification succeeds
- **AND** it shows the mobile input, the SMS-code input, the SMS request action, and the login action with the tested placeholder copy

### Requirement: Mobile Input Rules

The login form SHALL restrict the mobile field to numeric input only, cap the visible value at 11 digits, expose the clear action only when content exists, and reject empty, short, malformed, or unsupported mobile numbers with the workbook-defined feedback.

#### Scenario: Editing the mobile field

- **WHEN** the user types, pastes, or clears content in the mobile field
- **THEN** the field keeps digits only
- **AND** it ignores content beyond the first 11 digits
- **AND** it shows the clear action only while the field has content
- **AND** clearing restores the placeholder `请输入手机号`

#### Scenario: Requesting SMS with invalid mobile state

- **WHEN** the user requests an SMS code with an empty, short, malformed, or unsupported mobile number
- **THEN** the app blocks the request locally
- **AND** it stays on the login page
- **AND** it shows the feedback `请输入正确的手机号码`

### Requirement: SMS Code Input Rules

The login form SHALL provide a dedicated SMS-code field that accepts digits only, caps the visible value at 6 digits, preserves the typed value during countdown updates, and rejects empty or malformed code input on submit with the workbook-defined feedback.

#### Scenario: Editing the SMS code field

- **WHEN** the user types or pastes content into the SMS-code field
- **THEN** the field keeps digits only
- **AND** it ignores content beyond the first 6 digits
- **AND** it restores the placeholder `请输入验证码` when cleared

#### Scenario: Submitting invalid SMS code state

- **WHEN** the user submits login with an empty or malformed SMS code
- **THEN** the app blocks login locally
- **AND** it stays on the login page
- **AND** it shows the feedback `请输入正确的验证码`

### Requirement: SMS Input And Request Rules

The login form SHALL enforce request preconditions, a 60-second local countdown state, retry timing after countdown completion, and the request-failure feedback buckets required by the tests.

#### Scenario: Requesting an SMS code

- **WHEN** the user requests an SMS code with a valid mobile number
- **THEN** the app starts a 60-second countdown state
- **AND** it disables the request action visually and behaviorally until the countdown finishes
- **AND** it preserves any already-entered SMS-code value while the countdown updates

#### Scenario: Countdown completion

- **WHEN** the 60-second countdown reaches zero
- **THEN** the request action returns to the `获取验证码` state
- **AND** the user can request another SMS code again

#### Scenario: Submitting invalid login input

- **WHEN** the user submits login with a missing or malformed mobile number
- **THEN** the app blocks login locally
- **AND** it stays on the login page
- **AND** it shows the feedback `请输入正确的手机号`

### Requirement: SMS Login Submission

The login form SHALL accept registered-mobile plus valid-code combinations, reject wrong or expired codes, surface first-register consent before account creation, and route the user only after a successful token exchange and IM session setup.

#### Scenario: Submitting a valid registered login

- **WHEN** the user enters a registered mobile number and a valid SMS code
- **THEN** the app completes login
- **AND** it enters the authenticated shell

#### Scenario: Submitting a first-register login

- **WHEN** the user enters an unregistered mobile number with a valid SMS code and taps login
- **THEN** the app shows the registration-consent prompt
- **AND** the prompt includes the service-agreement link, the privacy-policy link, the reject action, and the agree action labeled `已阅读并同意`

#### Scenario: Submitting a wrong or expired code

- **WHEN** the login API rejects the entered SMS code as wrong or expired
- **THEN** the app stays on the login page
- **AND** it surfaces the API rejection message without replacing it with a generic success path
