## ADDED Requirements

### Requirement: Current Chat Forward Returns To Latest

The chat module SHALL return the live chat timeline to the latest message after the user forwards messages into the same chat conversation they were browsing. This behavior SHALL apply even when the forwarded source messages came from older history and the user was not near the latest message before forwarding.

#### Scenario: Merged forwarding historical messages to the current chat

- **GIVEN** the user is viewing older history in a chat detail page
- **AND** the user multi-selects historical messages
- **WHEN** the user sends a merged forward to the same current conversation
- **THEN** the chat detail page MUST return to the latest message position after the forwarded message is inserted
- **AND** the user MUST NOT need to tap the scroll-down shortcut multiple times to reach the forwarded message

#### Scenario: Forwarding historical messages to another chat

- **GIVEN** the user is viewing older history in a source chat detail page
- **WHEN** the user forwards selected messages to a different target conversation
- **THEN** returning to the source chat MUST preserve the user's historical viewing position
- **AND** the source chat MUST NOT force-scroll to the latest message solely because forwarding completed elsewhere
