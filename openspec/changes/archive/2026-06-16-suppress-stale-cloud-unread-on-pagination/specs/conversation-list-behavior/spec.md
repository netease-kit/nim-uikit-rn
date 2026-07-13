## MODIFIED Requirements

### Requirement: Conversation Ordering And State

The conversation module SHALL order rows by stick-top priority and activity time, support pagination, and keep unread, mute, and latest-preview state synchronized with conversation updates. When a user clears unread state for a conversation, the cleared state MUST be persisted per account and conversation so stale unread counts at or before the clear point do not reappear after reconnect, SDK resynchronization, process restart, or cloud-conversation pagination.

#### Scenario: Cloud pagination does not flash stale unread rows

- **GIVEN** cloud conversation mode is enabled
- **AND** the Messages tab has no unread red dot because cloud total unread is zero
- **WHEN** the user scrolls the conversation list and older cloud conversations are paged in
- **THEN** newly loaded conversation rows MUST NOT temporarily show unread badges or mention markers from stale cleared unread state
- **AND** the Messages tab and conversation rows MUST remain consistent that there is no unread state

#### Scenario: Cloud pagination preserves real unread rows

- **GIVEN** cloud conversation mode is enabled
- **AND** cloud total unread is greater than zero
- **WHEN** cloud conversations are displayed or paged in
- **THEN** RN MUST continue applying the existing cleared-unread watermark logic
- **AND** conversations with messages newer than the clear point MAY still show unread state
