## ADDED Requirements

### Requirement: Conversation List Layout And Empty State

The app SHALL provide the conversation list UI with the title area, top search entry, anti-fraud tip, offline banner area, row layout, empty-state presentation, latest-message preview, avatar, unread marker, mute marker, mention marker, and bottom-tab unread display required by the tests.

#### Scenario: Rendering an empty conversation list

- **WHEN** the signed-in user has no conversations
- **THEN** the page shows the expected empty-state UI instead of a blank list

#### Scenario: Rendering top helper surfaces

- **WHEN** the user opens the conversation list
- **THEN** the page shows the search entry first, the anti-fraud helper bar below search, and any offline-state prompt above the conversation rows

### Requirement: Conversation Preview Rendering

The conversation list SHALL render preview text using the same latest-message summary rules as chat detail, including long-message exposure style, alignment, sender labeling, anti-fraud notice rows, and `@` markers where the tests require them.

#### Scenario: Rendering conversation preview content

- **WHEN** conversations contain long text, muted messages, `@` mentions, or system-style updates
- **THEN** the preview row content and indicators follow the test-defined display rules

### Requirement: Conversation Ordering And State

The conversation module SHALL order rows by stick-top priority and activity time, support pagination, and keep unread, mute, and latest-preview state synchronized with conversation updates.

#### Scenario: Ordering conversation rows

- **WHEN** the list contains stick-top and non-stick-top conversations
- **THEN** stick-top rows appear first and each group is sorted by latest activity

#### Scenario: Loading later conversation pages

- **WHEN** the user scrolls into later pages and then pins a conversation from page two or later
- **THEN** the pinned conversation moves into the correct stick-top region without losing list continuity

### Requirement: Conversation Row Actions

The app SHALL support row tap, swipe, or long-press actions for entering chat, deleting, clearing unread, and toggling stick-top where the tests require those operations.

#### Scenario: Operating on a conversation row

- **WHEN** the user invokes a supported row action
- **THEN** the resulting conversation state and navigation follow the test-case rules

### Requirement: Offline And Multi-Endpoint Synchronization

The conversation module SHALL keep conversation rows usable during temporary network loss and SHALL converge row state after reconnect, account re-login, or another endpoint changes pin, mute, unread, deletion, or membership state.

#### Scenario: Syncing state after network or endpoint changes

- **WHEN** the user or another endpoint changes conversation state during offline, reconnect, or multi-end sessions
- **THEN** the visible list converges to the latest valid row state defined by the tests
