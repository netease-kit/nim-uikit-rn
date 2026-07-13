# chat-voice-messages Specification

## Purpose

TBD - created by archiving change support-voice-messages. Update Purpose after archive.

## Requirements

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

### Requirement: Chat Voice Message Bubble Width

The chat detail screen SHALL render voice message bubbles with a duration-proportional width aligned with the Android UIKit implementation.

#### Scenario: Short voice message uses minimum width

- **GIVEN** a voice message attachment duration is less than or equal to two seconds after converting milliseconds to integer seconds
- **WHEN** the message is rendered in the chat timeline
- **THEN** the voice message bubble SHALL use the minimum voice bubble width

#### Scenario: Longer voice message grows until maximum width

- **GIVEN** a voice message attachment duration is greater than two seconds
- **WHEN** the message is rendered in the chat timeline
- **THEN** the voice message bubble width SHALL increase by a fixed amount per second after the first two seconds
- **AND** once the calculated width exceeds the configured maximum, the bubble SHALL render at the maximum width instead
- **AND** the rendered width SHALL still respect the chat message content maximum width for the current screen

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

### Requirement: Chat Voice Recording Cancel Gesture

The chat detail screen SHALL discard an active voice recording only when the user moves outside the circular record button's tolerated cancel boundary while holding the record button.

#### Scenario: Movement within tolerated edge area still sends

- **GIVEN** the user is recording a voice clip and the recording duration meets the minimum send duration
- **WHEN** the user's finger briefly moves near the visual edge of the circular record button but remains within the button radius plus the configured edge tolerance and then releases
- **THEN** the app SHALL send the voice message through the normal audio send path

#### Scenario: Release position determines final cancel state

- **GIVEN** the user is recording a voice clip and the touch has previously moved outside the tolerated cancel boundary
- **WHEN** the user moves back within the tolerated cancel boundary before releasing
- **THEN** the app SHALL send the voice message through the normal audio send path

#### Scenario: Movement outside tolerated circle discards

- **GIVEN** the user is recording a voice clip
- **WHEN** the user's finger moves outside the circular record button radius plus the configured edge tolerance while holding and then releases
- **THEN** the app SHALL discard the recording instead of sending a voice message

#### Scenario: Cancel hint follows tolerated boundary

- **GIVEN** the user is recording a voice clip
- **WHEN** the user's finger moves outside the circular record button radius plus the configured edge tolerance
- **THEN** the app SHALL show a release-to-cancel hint above the record button
- **WHEN** the user's finger moves back within the tolerated cancel boundary
- **THEN** the app SHALL restore the release-to-send hint above the record button
