## ADDED Requirements

### Requirement: Add-friend search shows inline result rows

When a user searches for an exact account from the add-friend screen, the page MUST stay on the current route and render the matched account as an inline search result row.

#### Scenario: Matched account is found

- **GIVEN** the user is on the add-friend screen
- **WHEN** the entered account matches an existing user
- **THEN** the page remains on the add-friend route
- **AND** the page shows the matched account in the search results area

#### Scenario: User opens matched account details

- **GIVEN** the add-friend screen is showing a matched account row
- **WHEN** the user taps the row or its action button
- **THEN** the app opens the corresponding profile card page
