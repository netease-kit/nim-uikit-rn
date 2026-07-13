## MODIFIED Requirements

### Requirement: Notification, Tips, And Unknown Message Rendering

The chat module SHALL render notification, tips-style, and unsupported-or-unknown message payloads with stable fallbacks required by the tests.

#### Scenario: Reply preview does not jump to a revoked or deleted source

- **GIVEN** a reply message is visible in the chat timeline
- **AND** its source message has been revoked, deleted, or is unavailable locally
- **WHEN** the user taps the reply preview area
- **THEN** RN MUST keep the current scroll position
- **AND** RN MUST NOT jump or scroll to the old source-message position

#### Scenario: Reply preview shows file-message label

- **GIVEN** a reply message references a file message
- **WHEN** RN renders the reply preview
- **THEN** the reply preview content MUST display `[文件消息]`
