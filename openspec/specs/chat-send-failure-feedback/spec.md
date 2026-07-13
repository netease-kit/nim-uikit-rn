# chat-send-failure-feedback Specification

## Purpose

Capture RN chat send-failure behavior for deleted-friend and AI-account direct-message flows.

## Requirements

### Requirement: Friend-Deleted Send Failure Prompt

The chat detail page SHALL show a single friend-deleted verification prompt when a p2p message send fails with `104404`.

#### Scenario: Failed outgoing message to a deleted or unsupported relation

- **WHEN** the app marks an outgoing p2p message as send-failed with error code `104404`
- **THEN** the timeline MUST append a single `好友关系已解除，如需沟通，请申请好友验证` tips prompt with verification entry
- **AND** the failed message bubble MUST NOT display a second inline prompt with the same meaning

### Requirement: AI Account Send Uses AI Config

The chat detail page SHALL use AI send configuration for direct conversations with AI accounts.

#### Scenario: Sending text to an AI account

- **WHEN** the user sends a text message in a direct conversation whose target account is an AI account
- **THEN** the send request MUST include `aiConfig.accountId` with that AI account
- **AND** the text send request MUST include `aiConfig.content`
- **AND** the client SHOULD include recent text context aligned with the existing Web implementation

#### Scenario: Sending non-text to an AI account

- **WHEN** the user sends a non-text message in a direct conversation whose target account is an AI account
- **THEN** the send request MUST still identify the AI account via `aiConfig.accountId`

### Requirement: Verification Entry Uses Stable Friend Card Feedback

The friend verification entry opened from chat send failure SHALL not crash while surfacing follow-up relation errors, and SHALL avoid exposing unsupported add-friend actions for AI accounts.

#### Scenario: Opening verification for a normal user

- **WHEN** the user opens the friend card from the failed-message verification entry for a non-friend normal account
- **THEN** the card MAY continue to show the standard add-friend action
- **AND** any mutation failure shown from that card MUST degrade to a safe string message instead of crashing on native error payload types

#### Scenario: Opening verification for an AI account

- **WHEN** the user opens the friend card from the failed-message verification entry for an AI account
- **THEN** the card MUST NOT expose the ordinary add-friend action
- **AND** the card MUST remain stable without attempting to route the user into the unsupported normal-friend application flow

### Requirement: Send failure avoids duplicate failure prompts

The chat detail flow SHALL avoid duplicate failure prompts when a send failure already has message-level feedback in the timeline, SHALL localize known SDK send or upload failure messages before any failure text is displayed to the user, and SHALL show a user-visible toast containing the resolved failure reason when voice, image, video, or file message sending fails for non-antispam reasons that do not already have dedicated inline or local-tip feedback. SDK send results with `sendingState = SUCCEEDED` and `messageStatus.errorCode = 200` SHALL be treated as successful sends. Directly recorded videos SHALL be copied or normalized into a stable local file URI before the SDK video message is created, matching the album-selected video preparation path. Android recorded voice messages SHALL fail before SDK send with the existing recording failure feedback if the recorded file cannot be stabilized into a local file URI. Android voice uploads that fail on the first attempt with the transient NOS `status: 0 / Stream Closed` error SHALL be retried once automatically after a short settle delay before the send is surfaced as failed.

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

#### Scenario: Android recorded voice file cannot be stabilized

- **WHEN** the user records a voice clip on Android
- **AND** RN cannot copy or normalize the recorder output into a stable local file URI
- **THEN** RN MUST NOT call the SDK audio message creator or send API for that clip
- **AND** RN MUST show the existing localized recording failure feedback

#### Scenario: Android voice upload retries once after transient stream close

- **WHEN** the user sends a recorded voice clip on Android
- **AND** the first NOS upload attempt fails with `status: 0` and `Stream Closed`
- **THEN** RN MUST wait briefly for the local recording state to settle
- **AND** RN MUST retry that same voice send once automatically before surfacing a failure

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
- **AND** the toast MUST NOT say the file exceeds the local 100 MB limit

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
- **WHEN** the asset size is greater than 100M before the send request is created
- **THEN** RN MUST show `当前文件大小超出100M发送限制，请重新选择`
- **AND** RN MUST NOT call the SDK send API for that asset
- **AND** RN MUST NOT create a failed message bubble solely for the oversized asset

#### Scenario: Anti-spam send failure shows blocked category inline

- **GIVEN** the user sends a chat message that is blocked by anti-spam
- **AND** the SDK send result or send error includes an anti-spam result containing a `label` category code
- **WHEN** RN renders the failed message in the chat timeline
- **THEN** the failed message MUST show the category mapped from the native anti-spam code table inline with that same failed message
- **AND** the copy MUST use the native-style wording `内容可能涉及{type}, 请调整后发送` in Chinese
- **AND** RN MUST support categories 色情, 广告, 广告法, 暴恐, 违禁, 涉政, 谩骂, 灌水, 其他, and 涉价值观

#### Scenario: AI model request error variant is localized

- **GIVEN** the chat page renders an AI-related error or notification message
- **WHEN** the raw message text is `ai model request error` or another supported AI model request failure variant
- **THEN** RN MUST replace it with the localized `sdkErrorAIRequestLLMFailed` copy before rendering

### Requirement: Reply text messages must expose a visible sending state

Outgoing reply text messages MUST display a visible sending indicator while the send result has not been finalized.

#### Scenario: Reply text message still sending

- **GIVEN** the user sends a reply text message
- **AND** the message send state is still in progress
- **WHEN** the message bubble is rendered in chat detail
- **THEN** the bubble must show a visible sending indicator

#### Scenario: Reply text message later fails after offline send attempt

- **GIVEN** the user sends a reply text message while the network is unavailable
- **AND** the message initially remains in the sending state before the final result returns
- **WHEN** the final send result is not successful
- **THEN** the bubble must keep the sending indicator until failure is confirmed
- **AND** only then transition to the failed state UI
