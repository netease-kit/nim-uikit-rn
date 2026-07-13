## MODIFIED Requirements

### Requirement: Chat Voice Message Send Flow

The chat detail screen SHALL allow the user to record and send a voice message from the composer voice mode. Android recorded voice messages MUST first be copied or normalized into a stable app-local file URI before the SDK audio message is created, and the first Android upload attempt MAY retry once automatically when the NOS layer reports the transient `status: 0 / Stream Closed` failure.

#### Scenario: Send a valid voice recording

- **GIVEN** the user is logged in and viewing a conversation detail
- **WHEN** the user switches to voice mode, grants microphone permission, records a voice clip, and releases after the minimum duration
- **THEN** the app SHALL create a V2 audio message with the recorded local URI and duration
- **AND** the app SHALL send it through the existing message send path so local sending, failure, retry, conversation preview, push preview, and read receipt behavior remain consistent with other message types

#### Scenario: Android recording is stabilized before send

- **GIVEN** the user records a voice clip on Android
- **WHEN** the recording stops and the send path prepares the attachment
- **THEN** RN MUST copy or normalize the recorder output into a stable app-local file URI before calling the SDK audio message creator
- **AND** RN MUST send the stabilized local URI instead of the transient recorder cache URI

#### Scenario: Android transient upload close retries once

- **GIVEN** the user records a voice clip on Android
- **WHEN** the first upload attempt fails with the transient NOS `status: 0 / Stream Closed` error
- **THEN** RN MUST retry the same voice send once automatically after a short settle delay

#### Scenario: Release during recording startup

- **GIVEN** the user presses the voice record button and recording startup is still completing
- **WHEN** the user releases after recording has become available
- **THEN** the app SHALL stop the recording and run the normal send-or-discard decision instead of ignoring the release

#### Scenario: Recording is too short

- **GIVEN** the user is recording a voice clip
- **WHEN** the recording stops before one second
- **THEN** the app SHALL discard the recording
- **AND** the app SHALL show a user-visible tip instead of sending an empty or unusable voice message

#### Scenario: Microphone permission denied

- **GIVEN** the user opens voice mode
- **WHEN** microphone permission is denied
- **THEN** the app SHALL keep the user in the chat screen
- **AND** the app SHALL show a user-visible permission failure message
