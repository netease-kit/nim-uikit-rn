## MODIFIED Requirements

### Requirement: Pinned Message List Stability

The chat module SHALL avoid broad concurrent pinned-message list refreshes for conversations that do not have active or tracked pinned-message state.

#### Scenario: Refresh pinned state on login or reconnect

- **GIVEN** a user has many conversations loaded in memory
- **WHEN** login status, connection status, or foreground restore triggers app-level pinned-message refresh
- **THEN** the app MUST refresh pinned-message state only for the active conversation and conversations with tracked pinned-message state
- **AND** the app MUST NOT call the pinned-message list API once per loaded conversation solely because the conversation is loaded

#### Scenario: Duplicate refresh for one conversation

- **GIVEN** a pinned-message list request for conversation A is already in flight
- **WHEN** another refresh path requests pinned-message state for conversation A
- **THEN** the app MUST reuse the in-flight request instead of starting a duplicate SDK request
