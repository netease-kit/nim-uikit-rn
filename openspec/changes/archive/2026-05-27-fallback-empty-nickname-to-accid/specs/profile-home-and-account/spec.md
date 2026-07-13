## MODIFIED Requirements

### Requirement: My Home Page

The app SHALL provide the My page with avatar, nickname, account, personal-detail entry, about entry, settings entry, and favorites or collection entry required by the tests.

#### Scenario: Viewing the My page

- **WHEN** the user opens the My tab
- **THEN** the page shows the expected overview and entry points

#### Scenario: Viewing My with empty nickname

- **GIVEN** the current user profile has an empty nickname
- **WHEN** the user opens the My page
- **THEN** the nickname area shows the current account identifier instead of an unset placeholder

### Requirement: Personal Information Overview

The app SHALL provide the personal-information overview page with account copy action and all required editable field rows in the test-defined order.

#### Scenario: Opening personal information

- **WHEN** the user enters the personal-information page
- **THEN** the page shows avatar, nickname, account, gender, birthday, mobile, email, and signature rows

#### Scenario: Viewing personal information with empty nickname

- **GIVEN** the current user profile has an empty nickname
- **WHEN** the user enters the personal-information page
- **THEN** the nickname row shows the current account identifier instead of an unset placeholder
