# friend-add Specification

## Purpose

TBD - created to capture add-friend flow behavior. Update Purpose after archive.

## Requirements

### Requirement: Add-friend search shows inline result rows

When a user searches for an exact account from the add-friend screen, the page MUST automatically open the matched account's profile card instead of waiting for an extra tap on an inline result row.

#### Scenario: Matched account is found

- **GIVEN** the user is on the add-friend screen
- **WHEN** the entered account matches an existing user
- **THEN** the app automatically opens the corresponding profile card page
- **AND** the add-friend screen does not render an inline matched-user result row

#### Scenario: Sending a friend request from the matched profile card

- **GIVEN** the user has reached a matched user's profile card from add-friend search
- **WHEN** the user taps the add-friend action and the request succeeds
- **THEN** the app shows a toast indicating the friend request has been sent
- **AND** the app does not use a system alert dialog for that success feedback

#### Scenario: Sending a friend request to a blocked user

- **GIVEN** the user has reached a matched user's profile card from add-friend search
- **AND** the matched user is currently in the blocklist
- **WHEN** the user taps the add-friend action and the request succeeds
- **THEN** the app automatically removes the matched user from the blocklist
- **AND** the app refreshes the local relationship state after the removal

#### Scenario: Matched account is the current user

- **GIVEN** the user is on the add-friend screen
- **WHEN** the entered account matches the current logged-in user
- **THEN** the app automatically opens the personal-information page for the current user

#### Scenario: No account is found

- **GIVEN** the user is on the add-friend screen
- **WHEN** the entered account does not match an existing user
- **THEN** the page remains on the add-friend route
- **AND** the page shows the expected empty-state placeholder
