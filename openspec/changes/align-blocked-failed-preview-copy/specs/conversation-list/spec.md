## MODIFIED Requirements

### Requirement: Failed Last-Message Preview Copy

The app SHALL differentiate generic send failures from blocked-send failures in the conversation-list preview.

#### Scenario: Generic failed last message

- **WHEN** the last message on the chat detail page fails to send for a generic reason
- **THEN** the conversation list MUST display the failed message content

#### Scenario: Blocked failed last message

- **WHEN** the last message fails because the peer has blocked the sender
- **THEN** the conversation list MUST display `【提醒消息】`
