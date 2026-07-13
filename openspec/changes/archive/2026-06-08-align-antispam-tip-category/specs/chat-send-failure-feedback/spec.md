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

#### Scenario: Oversized attachments are blocked before send

- **GIVEN** the user selects or captures an image, video, or file whose local size can be resolved
- **WHEN** the asset size is greater than 200M before the send request is created
- **THEN** RN MUST show `当前文件大小超出200M发送限制，请重新选择`
- **AND** RN MUST NOT call the SDK send API for that asset
- **AND** RN MUST NOT create a failed message bubble solely for the oversized asset

#### Scenario: Anti-spam send failure shows blocked category

- **GIVEN** the user sends a chat message that is blocked by anti-spam
- **AND** the SDK send result or send error includes an anti-spam result containing a `label` category code
- **WHEN** RN appends the anti-spam tips message to the chat timeline
- **THEN** the tips text MUST include the category mapped from the native anti-spam code table
- **AND** the tips text MUST use the native-style wording `内容可能涉及{type}, 请调整后发送` in Chinese
- **AND** RN MUST support categories 色情, 广告, 广告法, 暴恐, 违禁, 涉政, 谩骂, 灌水, 其他, and 涉价值观
