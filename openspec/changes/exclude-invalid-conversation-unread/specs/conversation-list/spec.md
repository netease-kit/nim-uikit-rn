## MODIFIED Requirements

### Requirement: Conversation Tab Unread Consistency

The app SHALL keep the bottom message tab unread indicator consistent with the conversation list's visible unread reminders.

#### Scenario: Invalid conversation is filtered from the list

- **WHEN** a conversation is determined to be invalid and removed from the visible conversation list
- **THEN** that conversation MUST also be excluded from the unread-total summary used by the bottom message tab
- **AND** the list unread state and tab unread indicator MUST remain consistent

#### Scenario: Conversation is muted

- **WHEN** a conversation is muted and therefore only shows muted-state styling instead of a visible unread reminder in the conversation list
- **THEN** that conversation MUST NOT contribute to the bottom message tab unread indicator
- **AND** the list visible unread state and tab unread indicator MUST remain consistent
