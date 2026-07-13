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

### Requirement: Friend Card And Remark Entry

The app SHALL provide a friend card for existing friends with chat entry, remark entry, blacklist toggle, and delete-friend actions required by the tests, and it MUST NOT duplicate the message notification switch that belongs to p2p session settings.

#### Scenario: Viewing an existing friend card

- **WHEN** the user opens the card for an existing friend
- **THEN** the page shows the expected relationship actions and friend metadata layout

#### Scenario: Friend card keeps blacklist but not message notification

- **WHEN** the user opens a friend card for an existing friend
- **THEN** the page may show the blacklist switch and friend actions such as chat and delete
- **AND** it must not show the message notification switch
