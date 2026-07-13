## MODIFIED Requirements

### Requirement: Stranger Card State

The app SHALL show a card page for the searched account that distinguishes self, friend, stranger, blacklisted-user, and non-existent-account states, and it MUST keep stranger actions limited to the controls required for stranger handling.

#### Scenario: Viewing a stranger card

- **WHEN** the user opens the card for a searched account
- **THEN** the page shows the correct action set and relationship state for that account

#### Scenario: Stranger card hides blacklist

- **WHEN** the user opens a stranger card
- **THEN** the page must not show the blacklist switch
- **AND** it must keep only the actions required for stranger handling such as add friend

#### Scenario: Stranger profile page stays minimal

- **WHEN** RN opens a non-friend, non-self, non-AI profile page
- **THEN** the page does not show a page-title label such as `陌生人名片`
- **AND** the page does not show the alias row
- **AND** the page does not show the blacklist switch
