## MODIFIED Requirements

### Requirement: Conversation Ordering And State

The conversation module SHALL order rows by stick-top priority and activity time, support pagination, and keep unread, mute, and latest-preview state synchronized with conversation updates. When a user clears unread state for a conversation, the cleared state MUST be persisted per account and conversation so stale unread counts at or before the clear point do not reappear after reconnect, SDK resynchronization, or process restart.

#### Scenario: Muted conversation unread shows bottom tab red dot

- **GIVEN** every unread conversation is muted or message-notification disabled
- **WHEN** at least one muted conversation has unread messages
- **THEN** the bottom Messages tab icon MUST show the unread red dot
- **AND** the conversation row MAY continue showing the muted dot style instead of a numeric unread badge
- **AND** the bottom tab red-dot decision MUST NOT exclude unread solely because the conversation is muted

#### Scenario: Messages tab press does not reposition conversation list

- **GIVEN** the user is viewing a non-Messages bottom tab
- **AND** the Messages tab shows an unread red dot
- **WHEN** the user taps the Messages tab
- **THEN** RN MUST switch to the Messages tab
- **AND** RN MUST NOT automatically scroll or jump the conversation list to a nearest unread conversation

#### Scenario: Cleared unread does not reappear after reconnect and restart

- **GIVEN** the user clears unread state for all conversations in the conversation list
- **AND** no newer messages arrive for those conversations
- **WHEN** the app disconnects, reconnects, is killed, and then starts again
- **THEN** those conversations MUST NOT show unread badges or mention markers from messages that were already cleared
- **AND** the Messages tab unread total MUST NOT include those cleared unread counts

#### Scenario: Newer messages can show unread after a clear

- **GIVEN** the user cleared unread state for a conversation
- **WHEN** a message newer than the clear point arrives for that conversation
- **THEN** the conversation row MAY show unread state for that newer message
- **AND** the row MUST NOT restore unread state for messages at or before the clear point
