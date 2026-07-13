## MODIFIED Requirements

### Requirement: Personal Information Overview

The app SHALL provide the personal-information overview page with account copy action, the required editable field rows in the test-defined order, and immediate visible updates after the user successfully saves editable profile fields such as nickname, mobile, email, or signature.

#### Scenario: Opening personal information

- **WHEN** the user enters the personal-information page
- **THEN** the page shows avatar, nickname, account, gender, birthday, mobile, email, and signature rows

#### Scenario: Returning after editing a profile field

- **WHEN** the user saves nickname, mobile, email, or signature successfully and returns to the personal-information page
- **THEN** the corresponding row shows the updated value immediately without requiring a manual refresh or later re-entry
