## MODIFIED Requirements

### Requirement: Personal Information Overview

The app SHALL provide the personal-information overview page with account copy action, the required editable field rows in the test-defined order, page containers for both the overview and its direct child edit pages that reserve the device safe area at the top so the content does not overlap the status bar region, and a birthday field that is edited through a date-picker interaction instead of free-form text entry.

#### Scenario: Opening personal information

- **WHEN** the user enters the personal-information page
- **THEN** the page shows avatar, nickname, account, gender, birthday, mobile, email, and signature rows
- **AND** the page content starts below the top status bar safe area instead of overlapping the system region

#### Scenario: Opening a personal-information child page

- **WHEN** the user opens a direct child page from personal information, including gender selection or detail editing
- **THEN** the child page content starts below the top status bar safe area instead of overlapping the system region

#### Scenario: Editing birthday

- **WHEN** the user taps the birthday row in personal information
- **THEN** the app opens a date-picker style birthday selector instead of a free-form text input
- **AND** confirming the selection saves a valid date value no later than the current day
