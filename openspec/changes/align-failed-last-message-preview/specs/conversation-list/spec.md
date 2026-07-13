## MODIFIED Requirements

### Requirement: Conversation Preview Matches Last Chat State

The app SHALL keep the conversation-list preview aligned with the effective last-message state of the chat detail page.

#### Scenario: Last message is deleted

- **WHEN** the last message is deleted from the chat detail page
- **THEN** the conversation list MUST fall back to the previous message preview

#### Scenario: Last message is revoked

- **WHEN** the last message is revoked from the chat detail page
- **THEN** the conversation list MUST display `此消息已撤回`

#### Scenario: Last message send failed

- **WHEN** the last message on the chat detail page is in send-failed state
- **THEN** the conversation list MUST display `【提醒消息】`
