## MODIFIED Requirements

### Requirement: Chat Voice Message Send Flow

The chat detail screen SHALL allow the user to record and send a voice message from the composer voice mode.

#### Scenario: Send a valid voice recording

- **GIVEN** the user is logged in and viewing a conversation detail
- **WHEN** the user switches to voice mode, grants microphone permission, records a voice clip, and releases after the minimum duration
- **THEN** the app SHALL create a V2 audio message with the recorded local URI and duration
- **AND** the app SHALL send it through the existing message send path so local sending, failure, retry, conversation preview, push preview, and read receipt behavior remain consistent with other message types

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

## ADDED Requirements

### Requirement: Chat Voice Message Sending Presentation

The chat detail screen SHALL render outgoing voice messages that are still sending with an adjacent loading indicator and without a sending text label inside the voice bubble.

#### Scenario: Outgoing voice message is sending

- **GIVEN** the current user's voice message is in the sending state
- **WHEN** the message is rendered in the chat timeline
- **THEN** the app SHALL show a loading indicator before the outgoing voice message bubble
- **AND** the app SHALL not show a sending text label as the voice message duration

### Requirement: Chat Voice Composer Dismissal

The chat detail screen SHALL dismiss the voice recording composer when the user taps outside the voice recording panel while not recording.

#### Scenario: Tap outside voice recording panel while voice composer is open

- **GIVEN** the chat screen is in voice composer mode and no recording is active
- **WHEN** the user taps outside the voice recording panel
- **THEN** the app SHALL switch the composer back to text mode and hide recording controls
