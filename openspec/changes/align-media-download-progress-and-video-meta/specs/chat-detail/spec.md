## MODIFIED Requirements

### Requirement: Media progress overlays align with Android chat cards

RN image, video, and file messages MUST use Android-aligned progress overlay patterns during upload or download states.

#### Scenario: Image or video is uploading or downloading

- **WHEN** the chat page renders an image or video message in an in-progress state
- **THEN** the card shows a centered overlay progress affordance
- **AND** the normal play affordance is hidden while progress is shown

#### Scenario: File is uploading or downloading

- **WHEN** the chat page renders a file message in an in-progress state
- **THEN** the file icon area shows an overlay progress affordance
- **AND** the file name and size remain visible

### Requirement: Video card only shows duration badge

RN video messages MUST match the Android card meta pattern by showing only the duration badge on the card.

#### Scenario: Video card is rendered

- **WHEN** the chat page renders a video message card
- **THEN** the card does not show the video name text
- **AND** it shows a duration badge in the lower-right corner
- **AND** the duration is formatted as `MM:SS`
