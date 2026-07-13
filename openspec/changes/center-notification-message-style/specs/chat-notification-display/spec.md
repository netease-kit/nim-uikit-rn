## ADDED Requirements

### Requirement: Centered Plain Notification Messages

Notification and tip-style system messages in RN chat detail SHALL render as centered plain text without rounded background containers.

#### Scenario: Notification message shows as centered text

- **GIVEN** the chat timeline contains a notification or tip-style message
- **WHEN** the message is rendered
- **THEN** the message MUST be horizontally centered
- **AND** it MUST NOT render with a rounded background bubble
