## MODIFIED Requirements

### Requirement: People Picker

The app SHALL provide a people-picker flow for friends and digital-human accounts, with selected-state rendering, duplicate prevention, friend-empty state, max-count handling, and the same React Native UIKit page pattern used by related picker screens.

#### Scenario: Selecting people for a follow-up flow

- **WHEN** the user selects or unselects friends or digital-human accounts
- **THEN** the picker updates selection state and enforces the selection rules defined by the tests

#### Scenario: Reviewing picker content

- **WHEN** the picker opens with no friends or with mixed friend and digital-human data
- **THEN** the page shows the expected row layout, button copy, and empty-state treatment

#### Scenario: Picker page follows the shared RN UIKit pattern

- **WHEN** the user opens the conversation picker page in the React Native app
- **THEN** the page MUST use the same RN UIKit picker-page structure as related picker screens
- **AND** the page MUST use the shared search bar styling and selection indicator treatment
- **AND** the page MUST keep its existing picker-specific summary, selected-member panel, and create action behavior
