## MODIFIED Requirements

### Requirement: Conversation Ordering And State

The conversation module SHALL order rows by stick-top priority and activity time, support pagination, keep unread, mute, and latest-preview state synchronized with conversation updates, and support unread-targeted repositioning from the bottom message tab.

#### Scenario: Jumping to the nearest unread conversation from the message tab

- **GIVEN** the conversation list contains one or more unread conversations
- **WHEN** the user taps the bottom message tab unread indicator state
- **THEN** the conversation list MUST reposition to the nearest unread conversation row
- **AND** the unread conversation row MUST remain tappable with the existing row interaction behavior
