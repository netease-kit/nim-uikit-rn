## MODIFIED Requirements

### Requirement: Conversation Delete Action Feedback

The app SHALL reject conversation deletion when the device is offline.

#### Scenario: Offline delete action fails with required prompt

- **WHEN** the user is offline and tries to delete a conversation from the conversation list
- **THEN** the app MUST reject the delete action
- **AND** the app MUST show the message `当前网络异常，请检查你的网络设置`
