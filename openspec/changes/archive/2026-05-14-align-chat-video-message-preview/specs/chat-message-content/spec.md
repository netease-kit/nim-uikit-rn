## MODIFIED Requirements

### Requirement: Attachment Message Types

The chat module SHALL send and render image, video, file, voice-like, location-like, and downloaded-attachment rows with the size, count, format, preview, and reopen behavior required by the tests.

#### Scenario: Sending video messages shows preview states

- **WHEN** the user sends a video message from the chat page
- **THEN** the timeline MUST show a stable video preview surface instead of a text-only card
- **AND** while the message is still sending it MUST show a loading state on that preview surface
- **AND** after the send succeeds it MUST show the video first-frame cover with the play affordance
- **AND** portrait and landscape videos MUST use distinct card dimensions in the chat timeline

#### Scenario: Android original-video send preserves source export

- **WHEN** the user is on Android and enables the original-video option before selecting or recording a video
- **THEN** the chat page MUST send that video with a passthrough export preset instead of a compressed export preset
- **AND** iOS MUST NOT expose an original-video toggle for this flow

#### Scenario: Downloaded video opens the media viewer without redirect loops

- **WHEN** the user taps a remote video message that has not been downloaded locally
- **THEN** the chat page MAY download the video before playback
- **AND** after the video has a local URI, tapping the message MUST open the media viewer instead of downloading again
- **AND** media-viewer query params such as `conversationId` MUST NOT be treated as offline-push navigation params that redirect back to chat detail
- **AND** on Android the media viewer MUST allow the embedded player to read local `file://` video URIs

#### Scenario: Expo Go media-library save failure uses actionable copy

- **WHEN** the user taps the media-viewer download action in Android Expo Go and media-library photo/video permission is unavailable
- **THEN** the app MUST show a localized actionable failure message instead of surfacing the raw native rejection text

#### Scenario: Downloaded documents keep file extension before opening

- **WHEN** the user downloads or opens a document attachment such as PDF
- **THEN** the local cached file name MUST keep a usable file extension from the attachment name or source URL
- **AND** Android document viewers MUST receive a file URI whose name preserves the document format
- **AND** if attachment metadata and source URL do not provide an extension, the app MUST infer common document extensions such as PDF from the downloaded file header before opening
- **AND** after chat detail downloads a file, tapping that file again MUST open the local file directly instead of navigating to a file-detail page
