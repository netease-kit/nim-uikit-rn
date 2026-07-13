## ADDED Requirements

### Requirement: Delete Friend Returns To Source

After deleting a friend from the friend card, RN SHALL return the user to the page that opened the friend card when a previous route exists.

#### Scenario: Delete friend from a pushed friend card

- **GIVEN** the user opens a friend's card from chat, contact list, group member list, or chat settings
- **WHEN** the user deletes the friend successfully
- **THEN** RN MUST navigate back to the previous page
- **AND** RN MUST NOT always replace the current page with the contacts tab

#### Scenario: Delete friend without a previous route

- **GIVEN** the friend card has no previous route in the navigation stack
- **WHEN** the user deletes the friend successfully
- **THEN** RN MUST fall back to the contacts tab
