## MODIFIED Requirements

### Requirement: Notification, Tips, And Unknown Message Rendering

The chat module SHALL render notification, tips-style, and unsupported-or-unknown message payloads with stable fallbacks required by the tests.

#### Scenario: Reply source message is unavailable

- **GIVEN** a reply message references a source message
- **WHEN** the source message has been recalled, deleted, or is unavailable in the local message cache
- **THEN** RN MUST show the fallback copy `该消息已被撤回或删除`
