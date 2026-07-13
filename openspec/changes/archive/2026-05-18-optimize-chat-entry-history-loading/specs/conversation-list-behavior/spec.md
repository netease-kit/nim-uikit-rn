## MODIFIED Requirements

### Requirement: Conversation Ordering And State

The conversation module SHALL order rows by stick-top priority and activity time, support pagination, and keep unread, mute, and latest-preview state synchronized with conversation updates.

#### Scenario: Initial conversation page after login

- **WHEN** the user has just logged in and the first page of conversations is still being fetched
- **THEN** the conversation list page MUST present an explicit loading state instead of immediately falling through to an empty-state experience
- **AND** the first screen fetch MUST use a bounded initial page size suitable for fast first paint

#### Scenario: Loading more conversations

- **WHEN** the user scrolls near the end of the current conversation list
- **THEN** the app MUST continue loading older conversations in paged batches
- **AND** the already rendered rows MUST remain visible while more items are fetched
