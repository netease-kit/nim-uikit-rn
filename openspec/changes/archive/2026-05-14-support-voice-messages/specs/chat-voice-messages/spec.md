## ADDED Requirements

### Requirement: Chat Voice Message Send Flow

The chat detail screen SHALL allow the user to record and send a voice message from the composer voice mode.

#### Scenario: Send a valid voice recording

- **GIVEN** the user is logged in and viewing a conversation detail
- **WHEN** the user switches to voice mode, grants microphone permission, records a voice clip, and stops recording after the minimum duration
- **THEN** the app SHALL create a V2 audio message with the recorded local URI and duration
- **AND** the app SHALL send it through the existing message send path so local sending, failure, retry, conversation preview, push preview, and read receipt behavior remain consistent with other message types

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

### Requirement: Chat Voice Message Playback

The chat detail screen SHALL play voice messages in-app using the recorded or remote audio source from the message attachment.

#### Scenario: Play a voice message

- **GIVEN** a voice message has an available local path or remote URL
- **WHEN** the user taps the voice message bubble
- **THEN** the app SHALL play the voice message through Expo audio
- **AND** the bubble SHALL indicate that this voice message is currently playing

#### Scenario: Switch playing voice message

- **GIVEN** a voice message is playing
- **WHEN** the user taps another voice message
- **THEN** the app SHALL stop the previous audio
- **AND** the app SHALL play the newly selected voice message

#### Scenario: Voice source unavailable

- **GIVEN** a voice message has no local path or remote URL
- **WHEN** the user taps the voice message bubble
- **THEN** the app SHALL show a playback failure message
