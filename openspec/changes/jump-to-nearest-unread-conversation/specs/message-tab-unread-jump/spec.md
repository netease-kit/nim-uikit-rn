## ADDED Requirements

### Requirement: Message Tab Unread Jump

The bottom message tab SHALL allow the user to jump to the nearest unread conversation from its unread indicator state.

#### Scenario: User taps the message tab while unread conversations exist

- **GIVEN** the bottom message tab shows unread state
- **WHEN** the user taps the message tab
- **THEN** the app MUST open or keep the message tab active
- **AND** the conversation list MUST scroll to the nearest conversation row whose unread count is greater than zero

#### Scenario: User taps the message tab with no unread conversations

- **GIVEN** the bottom message tab does not show unread state
- **WHEN** the user taps the message tab
- **THEN** the app MUST keep the default tab navigation behavior
