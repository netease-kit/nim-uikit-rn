## MODIFIED Requirements

### Requirement: Conversation Ordering And State

The conversation module SHALL order rows by stick-top priority and activity time, support pagination, and keep unread, mute, and latest-preview state synchronized with conversation updates.

#### Scenario: Muted conversation unread shows bottom tab red dot

- **GIVEN** every unread conversation is muted or message-notification disabled
- **WHEN** at least one muted conversation has unread messages
- **THEN** the bottom Messages tab icon MUST show the unread red dot
- **AND** the conversation row MAY continue showing the muted dot style instead of a numeric unread badge
- **AND** the bottom tab red-dot decision MUST NOT exclude unread solely because the conversation is muted
