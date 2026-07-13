## MODIFIED Requirements

### Requirement: Conversation Stick-Top Actions

The app SHALL allow users to stick conversations to the top or cancel stick-top when network conditions allow.

#### Scenario: Offline stick-top action fails with required prompt

- **WHEN** the user is offline and tries to stick a conversation to the top or cancel stick-top from the conversation list
- **THEN** the app MUST reject the action
- **AND** the app MUST show the message `当前网络不可用，请检查你的网络设置`
