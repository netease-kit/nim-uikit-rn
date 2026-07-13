## ADDED Requirements

### Requirement: iOS Downloaded File Opening

The chat module SHALL open downloaded file-message attachments on iOS through a native document sharing or preview flow that supports local sandbox files.

#### Scenario: iOS downloaded file opens after download

- **GIVEN** the chat detail page runs on iOS
- **AND** the user receives a file message whose attachment is remote
- **WHEN** the user taps the file message, waits for download completion, and taps to view the downloaded local file
- **THEN** RN MUST open the local file through an iOS document sharing or preview capable flow
- **AND** RN MUST NOT call URL-scheme opening directly on the local `file://` path
- **AND** RN MUST NOT show an `Unable to open URL` error for a downloaded local file solely because it is an app sandbox file

#### Scenario: iOS image file messages open in media viewer

- **GIVEN** the chat detail page runs on iOS
- **AND** the user receives a file message whose filename or extension is an iOS native-supported image file type
- **WHEN** the file is locally available or finishes downloading and the user taps to view it
- **THEN** RN MUST open the file in the in-app image viewer
- **AND** the image viewer MUST display the tapped file message's local or remote URI
- **AND** the image viewer MUST NOT replace it with the first normal image message in the same conversation
- **AND** RN MUST NOT show the generic file sharing sheet as the primary viewing surface

#### Scenario: iOS video file messages open in media viewer

- **GIVEN** the chat detail page runs on iOS
- **AND** the user receives a file message whose filename or extension is an iOS native-supported video file type
- **WHEN** the file is locally available or finishes downloading and the user taps to view it
- **THEN** RN MUST open the file in the in-app video viewer
- **AND** the video viewer MUST use a native iOS-capable player for local sandbox files and remote video URLs
- **AND** RN MUST NOT show the generic file sharing sheet as the primary viewing surface

#### Scenario: iOS video messages play in media viewer

- **GIVEN** the chat detail page runs on iOS
- **WHEN** the user opens a normal video message or a downloaded video file message
- **THEN** RN MUST render the video through a native iOS-capable video player
- **AND** the player MUST support playback of the resolved local or remote video URI
- **AND** RN MUST NOT rely on a WebView HTML video element as the primary iOS playback surface

#### Scenario: Android downloaded file open path remains unchanged

- **GIVEN** the chat detail page runs on Android
- **WHEN** the user opens a downloaded file message attachment
- **THEN** RN MUST keep using the existing content-URI intent based file open flow
