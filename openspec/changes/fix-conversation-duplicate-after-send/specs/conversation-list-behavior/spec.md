## MODIFIED Requirements

### Requirement: Conversation Ordering And State

The conversation module SHALL order rows by stick-top priority and activity time, support pagination, keep unread, mute, and latest-preview state synchronized with conversation updates, and avoid creating transient duplicate rows while local send state is reconciling with the synced conversation list.

#### Scenario: Ordering conversation rows

- **WHEN** the list contains stick-top and non-stick-top conversations
- **THEN** stick-top rows appear first and each group is sorted by latest activity

#### Scenario: Loading later conversation pages

- **WHEN** the user scrolls into later pages and then pins a conversation from page two or later
- **THEN** the pinned conversation moves into the correct stick-top region without losing list continuity

#### Scenario: Returning to the list after sending a message

- **WHEN** the user sends a message successfully in chat detail and immediately returns to the conversation list
- **THEN** the list shows the updated target conversation preview exactly once and does not render an extra placeholder or duplicate conversation row before the next manual refresh
