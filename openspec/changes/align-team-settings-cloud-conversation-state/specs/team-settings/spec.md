## MODIFIED Requirements

### Requirement: Team Settings Conversation State Source

The app SHALL show team conversation settings from the active cloud conversation store when cloud conversation mode is enabled.

#### Scenario: Rejoin team after leaving

- **WHEN** cloud conversation mode is enabled
- **AND** the user reopens team settings after leaving and rejoining a team conversation
- **THEN** the page MUST read stick-top and mute state from the cloud `conversationStore`
- **AND** stale local conversation state MUST NOT override the current team conversation state
