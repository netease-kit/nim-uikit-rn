## MODIFIED Requirements

### Requirement: Message Collection Actions

The chat module SHALL expose collect actions for eligible messages, keep the visible collect action label as `收藏` even when the source message has already been collected, and provide the success or failure feedback required by the tests. Collecting the same source message repeatedly MUST refresh the existing collection instead of showing an uncollect action from the chat message action panel.

#### Scenario: Collecting a message for the first time

- **WHEN** the user long-presses an eligible uncollected message
- **THEN** the action panel MUST show `收藏`
- **WHEN** the user taps `收藏`
- **THEN** the message MUST be added to the collection list

#### Scenario: Recollecting the same message

- **GIVEN** a message has already been collected
- **WHEN** the user long-presses that same message again
- **THEN** the action panel MUST still show `收藏`
- **WHEN** the user taps `收藏`
- **THEN** the collection list MUST contain only one entry for that source message
- **AND** that entry MUST move to the latest position
- **AND** that entry's collection time MUST be updated
