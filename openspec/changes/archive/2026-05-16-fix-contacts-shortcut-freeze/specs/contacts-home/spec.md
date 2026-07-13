## MODIFIED Requirements

### Requirement: Contacts Navigation

The contacts home page SHALL navigate correctly from each shortcut or row into friend card, verification center, blacklist, joined-team list, add-friend flow, and individual friend chat surfaces.

#### Scenario: Opening a contact surface from Contacts

- **WHEN** the user taps a supported shortcut or friend row
- **THEN** the app routes into the corresponding page or conversation with the expected initial state

#### Scenario: Opening a shortcut target without freezing

- **WHEN** the user taps the verification center, blacklist, or joined-team shortcut from the Contacts tab
- **THEN** the app completes the navigation into the corresponding target page
- **AND** the current UI does not remain stuck in a pressed or non-interactive state
