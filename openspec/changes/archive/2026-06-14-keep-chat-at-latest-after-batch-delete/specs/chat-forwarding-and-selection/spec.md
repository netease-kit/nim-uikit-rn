## ADDED Requirements

### Requirement: Batch Delete Latest Positioning

The chat module SHALL keep the live chat detail timeline positioned at the remaining latest message after multi-select batch deletion removes the current latest message. Batch deletion of historical messages that does not include the current latest message SHALL NOT force the user away from the historical position they are viewing.

#### Scenario: Deleting latest selected messages

- **GIVEN** the user is in chat multi-select mode
- **AND** the selected messages include the current latest visible message
- **WHEN** the user confirms batch deletion and the messages are removed from the timeline
- **THEN** the chat detail page MUST show the remaining latest message position
- **AND** the page MUST NOT jump upward to older historical messages

#### Scenario: Deleting only historical selected messages

- **GIVEN** the user is in chat multi-select mode while viewing historical messages
- **AND** the selected messages do not include the current latest visible message
- **WHEN** the user confirms batch deletion and the messages are removed from the timeline
- **THEN** the chat detail page MUST preserve the user's historical viewing position
- **AND** the page MUST NOT force-scroll to the latest message
