## MODIFIED Requirements

### Requirement: Chat History New Message Notice

The app SHALL provide a visible shortcut back to the latest message when the user is browsing history and a newer tail message arrives.

#### Scenario: New tail message arrives while user is away from bottom

- **WHEN** the user has scrolled away from the bottom of the chat timeline
- **AND** the newest message in the conversation changes
- **THEN** the chat page MUST show a centered floating `有新消息` notice above the composer area
- **AND** tapping the notice MUST scroll the timeline back to the latest message position

#### Scenario: Loading older history does not count as a new message

- **WHEN** the user first enters a chat and scrolls upward to load older messages
- **AND** the latest tail message in the conversation has not changed
- **THEN** the chat page MUST NOT show the `有新消息` notice
