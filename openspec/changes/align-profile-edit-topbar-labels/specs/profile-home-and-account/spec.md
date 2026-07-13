## MODIFIED Requirements

### Requirement: Personal Information Overview

The app SHALL provide the personal-information overview page with account copy action, the required editable field rows in the test-defined order, immediate visible updates after the user successfully saves editable profile fields such as nickname, mobile, email, or signature, and direct child edit pages that expose a visible in-page top bar matching the workbook labels.

#### Scenario: Opening personal information

- **WHEN** the user enters the personal-information page
- **THEN** the page shows avatar, nickname, account, gender, birthday, mobile, email, and signature rows

#### Scenario: Returning after editing a profile field

- **WHEN** the user saves nickname, mobile, email, or signature successfully and returns to the personal-information page
- **THEN** the corresponding row shows the updated value immediately without requiring a manual refresh or later re-entry

#### Scenario: Editing profile text fields with workbook top-bar labels

- **WHEN** the user opens a profile text edit page such as nickname, mobile, email, or signature
- **THEN** the page shows a visible in-page top bar with a back affordance on the left, the field title in the center, and a `完成` action on the right
