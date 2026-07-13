## MODIFIED Requirements

### Requirement: Send failure avoids duplicate failure prompts

The chat detail flow SHALL avoid duplicate failure prompts when a send failure already has message-level feedback in the timeline, SHALL localize known SDK send or upload failure messages before any failure text is displayed to the user, and SHALL show a user-visible toast containing the resolved failure reason when voice, image, video, or file message sending fails for non-antispam reasons that do not already have dedicated inline or local-tip feedback. SDK send results with `sendingState = SUCCEEDED` and `messageStatus.errorCode = 200` SHALL be treated as successful sends. Directly recorded videos SHALL be copied or normalized into a stable local file URI before the SDK video message is created, matching the album-selected video preparation path.

#### Scenario: Send failure with dedicated message-level feedback does not show an extra toast or modal

- **GIVEN** the user sends a text, media, audio, file, or other chat message
- **AND** the send fails because of deleted-friend relation, blocklist state, or anti-spam state
- **WHEN** the failed message is rendered in the chat timeline with dedicated failure state, local tip, or inline reason
- **THEN** RN MUST NOT show an additional toast or modal alert for that send failure
- **AND** RN MUST rely on the message-level failed state and reason as the user-facing feedback

#### Scenario: Attachment send succeeds with success status code

- **WHEN** the user sends a voice, image, video, or file message
- **AND** the SDK send result message has `sendingState = SUCCEEDED`
- **AND** the SDK send result message has `messageStatus.errorCode = 200`
- **THEN** RN MUST treat the send as successful
- **AND** RN MUST NOT show a send-failure toast
- **AND** RN MUST NOT reject the send promise with `Error: 200`

#### Scenario: Directly recorded video is normalized before send

- **WHEN** the user records a video from the chat composer camera action
- **AND** the camera returns a video asset URI
- **THEN** RN MUST copy or normalize the recorded video to a stable local file URI before calling the SDK video message creator
- **AND** RN MUST generate the upload preview from that normalized local file URI
- **AND** RN MUST validate the normalized local file size before send

#### Scenario: Attachment send fails with server reason

- **WHEN** the user sends a voice, image, video, or file message
- **AND** the SDK returns a message with a non-200 send error code, returns a failed sending state, or throws a non-antispam send failure with an error code or message
- **THEN** the message remains visible in the failed state
- **AND** the chat screen shows a toast with the localized or server-provided failure reason

#### Scenario: Attachment upload is rejected as too large by NOS

- **WHEN** the user sends a voice, image, video, or file message
- **AND** the SDK reports an upload failure whose nested error detail contains `413 Request Entity Too Large`
- **THEN** the message remains visible in the failed state
- **AND** the chat screen shows `文件体积过大，发送失败`
- **AND** the toast MUST NOT say the file exceeds the local 200 MB limit

#### Scenario: Failed attachment message resend fails again

- **WHEN** the user retries a failed voice, image, video, or file message
- **AND** the resend attempt fails for a non-antispam reason
- **THEN** the message remains visible in the failed state
- **AND** the chat screen shows a toast with the localized or server-provided failure reason

#### Scenario: Non-send validation and action prompts remain available

- **WHEN** the user performs a non-send operation such as permission request, unsupported media validation, file/video download, file open, copy, revoke, collect, or pin
- **THEN** RN MAY continue to show the existing toast or modal feedback for that operation

#### Scenario: Oversized attachments are blocked before send

- **GIVEN** the user selects or captures an image, video, or file whose local size can be resolved
- **WHEN** the asset size is greater than 200M before the send request is created
- **THEN** RN MUST show `当前文件大小超出200M发送限制，请重新选择`
- **AND** RN MUST NOT call the SDK send API for that asset
- **AND** RN MUST NOT create a failed message bubble solely for the oversized asset

#### Scenario: Anti-spam send failure shows blocked category inline

- **GIVEN** the user sends a chat message that is blocked by anti-spam
- **AND** the SDK send result or send error includes an anti-spam result containing a `label` category code
- **WHEN** RN renders the failed message in the chat timeline
- **THEN** the failed message MUST show the category mapped from the native anti-spam code table inline with that same failed message
- **AND** the copy MUST use the native-style wording `内容可能涉及{type}, 请调整后发送` in Chinese
- **AND** RN MUST support categories 色情, 广告, 广告法, 暴恐, 违禁, 涉政, 谩骂, 灌水, 其他, and 涉价值观
