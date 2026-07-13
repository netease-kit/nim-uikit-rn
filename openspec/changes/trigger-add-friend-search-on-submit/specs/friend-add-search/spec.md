## ADDED Requirements

### Requirement: Add-friend search must submit explicitly

The add-friend page MUST only perform account lookup after the user explicitly submits the search from the keyboard.

#### Scenario: Typing in the add-friend input

- **WHEN** the user enters or edits text in the add-friend input
- **THEN** the page updates only the input content
- **AND** the page does not automatically perform account lookup while typing

#### Scenario: Submitting from the keyboard search action

- **WHEN** the user taps the keyboard search action with a non-empty account input
- **THEN** the page performs account lookup for the submitted account
- **AND** the page shows the matching result or empty state for that submitted value

#### Scenario: Editing after a previous search

- **WHEN** the user changes the input after a prior add-friend search result has been shown
- **THEN** the page clears the previous search result state
- **AND** the page waits for the next explicit keyboard search submit action
