## MODIFIED Requirements

### Requirement: Add-Friend Search Flow

The app SHALL provide exact-match account search with input focus, keyboard, clear-action, direct card navigation, and result-state behavior aligned with the contact test cases.

#### Scenario: Searching by account

- **WHEN** the user searches for self, an existing friend, a stranger, or a non-existent account
- **THEN** the search result state reflects the correct relationship case

#### Scenario: Exact account search opens the card

- **WHEN** the user enters a complete existing account in the add-friend search input
- **THEN** the app opens that account's card page

#### Scenario: Partial account search is treated as not found

- **WHEN** the user enters a partial account that is not itself a complete account
- **THEN** the app shows the user-not-found state and does not open a card
