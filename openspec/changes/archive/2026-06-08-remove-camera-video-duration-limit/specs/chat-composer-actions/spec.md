## ADDED Requirements

### Requirement: Camera Video Recording Uses File Size Limit Only

The chat composer camera video action SHALL allow users to record video without an app-defined recording duration limit, and SHALL only block sending when the resulting video exceeds the configured file size limit.

#### Scenario: Recording longer than one minute

- **WHEN** the user opens the chat composer camera video action and records for longer than 60 seconds
- **THEN** RN MUST NOT automatically stop recording because of a 60 second or 120 second app-defined duration limit
- **AND** RN MUST preserve the recorded video's duration as message metadata after recording completes

#### Scenario: Sending recorded video within size limit

- **WHEN** the user completes a recorded video whose file size is within the 200MB send limit
- **THEN** RN MUST continue into the normal video-message send flow
- **AND** RN MUST NOT reject the video because of its duration

#### Scenario: Sending recorded video over size limit

- **WHEN** the user completes a recorded video whose file size is greater than the 200MB send limit
- **THEN** RN MUST block sending before upload
- **AND** RN MUST show the existing video-too-large feedback
