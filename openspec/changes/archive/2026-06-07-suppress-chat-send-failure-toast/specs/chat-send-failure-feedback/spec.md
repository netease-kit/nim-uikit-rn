## MODIFIED Requirements

### Requirement: Send failure avoids duplicate failure prompts

The chat detail flow SHALL avoid duplicate failure prompts when a send failure already has message-level feedback in the timeline, and SHALL localize known SDK send or upload failure messages before any failure text is displayed to the user.

#### Scenario: Send failure does not show an extra toast or modal

- **GIVEN** the user sends a text, media, audio, file, or other chat message
- **AND** the send fails because of network loss, deleted-friend relation, blocklist state, or another SDK send failure
- **WHEN** the failed message is rendered in the chat timeline with failure state or reason
- **THEN** RN MUST NOT show an additional toast or modal alert for that send failure
- **AND** RN MUST rely on the message-level failed state and reason as the user-facing feedback

#### Scenario: Non-send validation and action prompts remain available

- **WHEN** the user performs a non-send operation such as permission request, unsupported media validation, file/video download, file open, copy, revoke, collect, or pin
- **THEN** RN MAY continue to show the existing toast or modal feedback for that operation
