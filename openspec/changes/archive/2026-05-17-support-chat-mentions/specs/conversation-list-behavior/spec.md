## MODIFIED Requirements

### Requirement: Conversation Preview Rendering

The conversation list SHALL render preview text using the same latest-message summary rules as chat detail, including long-message exposure style, alignment, sender labeling, anti-fraud notice rows, and `@` markers where the tests require them. Team messages that mention the current user directly or through `ait_all` SHALL mark the row with `[有人@我]` until the conversation's unread/mention state is reset.

#### Scenario: Rendering conversation preview content

- **WHEN** conversations contain long text, muted messages, `@` mentions, or system-style updates
- **THEN** the preview row content and indicators follow the test-defined display rules

#### Scenario: Current user is mentioned in a team conversation

- **WHEN** a received team message contains `serverExtension.yxAitMsg` for the current account or `ait_all`
- **AND** the conversation is not the currently open chat
- **THEN** the conversation row preview MUST show the `[有人@我]` prefix before the latest-message preview
- **AND** opening or clearing the conversation MUST remove that mention prefix from the row
