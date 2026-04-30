# profile-home-and-account Specification

## Purpose
TBD - created by archiving change port-im-kit-react-ui-h5. Update Purpose after archive.
## Requirements
### Requirement: My Home Page

The app SHALL provide the My page with avatar, nickname, account, personal-detail entry, about entry, settings entry, and favorites or collection entry required by the tests.

#### Scenario: Viewing the My page

- **WHEN** the user opens the My tab
- **THEN** the page shows the expected overview and entry points

### Requirement: Personal Information Overview

The app SHALL provide the personal-information overview page with account copy action and all required editable field rows in the test-defined order.

#### Scenario: Opening personal information

- **WHEN** the user enters the personal-information page
- **THEN** the page shows avatar, nickname, account, gender, birthday, mobile, email, and signature rows

### Requirement: Account Copy Action

The app SHALL support copying the current account identifier and showing the expected success feedback.

#### Scenario: Copying account ID

- **WHEN** the user taps the copy action
- **THEN** the account identifier is copied and the app confirms copy success

### Requirement: About And Product Introduction Navigation

The app SHALL provide the About page and product-introduction entry reachable from the My tab and SHALL render the page structure required by the tests.

#### Scenario: Opening the About surface

- **WHEN** the user navigates from My to About and then to Product Introduction
- **THEN** the About page shows the workbook-required logo, product name, version row, and product-introduction entry
- **AND** the Product Introduction page opens with the expected title, back action, and H5 content container

### Requirement: Settings And Collection Entry Points

The My page SHALL route into settings and collection-related entry points without breaking the current account overview flow.

#### Scenario: Opening settings or collection from My

- **WHEN** the user taps the settings or collection-related entry from My
- **THEN** the app opens the corresponding destination surface with the expected initial state

