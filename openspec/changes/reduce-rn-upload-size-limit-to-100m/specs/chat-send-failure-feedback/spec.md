## MODIFIED Requirements

### Requirement: Send failure avoids duplicate failure prompts

The chat detail flow SHALL avoid duplicate failure prompts when a send failure already has message-level feedback in the timeline, and SHALL localize known SDK send or upload failure messages before any failure text is displayed to the user.

#### Scenario: Oversized attachments are blocked before send

- **GIVEN** the user selects or captures an image, video, or file whose local size can be resolved
- **WHEN** the asset size is greater than 100M before the send request is created
- **THEN** RN MUST show `当前文件大小超出100M发送限制，请重新选择`
- **AND** RN MUST NOT call the SDK send API for that asset
- **AND** RN MUST NOT create a failed message bubble solely for the oversized asset
