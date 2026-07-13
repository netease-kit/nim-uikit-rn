## MODIFIED Requirements

### Requirement: Offline Search Handling

Conversation search SHALL support offline result navigation when the necessary local metadata is already available, including when RN is using cloud conversation mode.

#### Scenario: Offline team search result opens chat with cached metadata

- **WHEN** the user is offline and opens a team result from conversation search
- **AND** the local conversation list does not yet contain that team conversation
- **THEN** RN MUST create or update a local placeholder conversation using the searched team name and avatar
- **AND** the chat detail header MUST show the team name instead of the team id

#### Scenario: Cloud-mode offline team search result opens chat with cached metadata

- **WHEN** cloud conversation mode is enabled
- **AND** the user is offline and opens a team result from conversation search
- **AND** the cloud conversation list does not yet contain that team conversation
- **THEN** RN MUST use the local placeholder conversation as the chat-detail fallback
- **AND** the chat detail header MUST show the searched team name instead of the team id
- **AND** RN MUST NOT require a successful cloud conversation lookup before opening the chat

#### Scenario: Failed offline team message remains visible after reopening

- **WHEN** the user sends a message in an offline team chat opened from search
- **AND** that message is kept locally with a failed sending state
- **WHEN** the user reconnects and opens the same conversation from the home conversation list
- **THEN** the chat detail timeline MUST still show the locally failed message
- **AND** loading server history MUST NOT discard that local failed message

#### Scenario: Cloud-mode offline team send creates cloud conversation after reconnect

- **WHEN** cloud conversation mode is enabled
- **AND** the user sends a message in a valid team chat opened from offline search
- **THEN** RN MUST create the cloud conversation before sending whenever the network and SDK allow it
- **AND** if creation or sending fails while offline, RN MUST keep the local placeholder and failed local message visible for retry
