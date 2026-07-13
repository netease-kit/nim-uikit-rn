## MODIFIED Requirements

### Requirement: Notification, Tips, And Unknown Message Rendering

The chat module SHALL render notification, tips-style, and unsupported-or-unknown message payloads with stable fallbacks required by the tests.

#### Scenario: Team nickname updates chat sender labels in realtime

- **WHEN** a member's nickname in the current team is changed
- **AND** the user is viewing a group chat containing messages from that member
- **THEN** the visible sender label for that member's group messages updates to the new team nickname without requiring page re-entry
- **AND** the displayed sender name uses team nickname before friend alias, profile nickname, message-carried nickname, and account ID
