## ADDED Requirements

### Requirement: Chat Media Save To System Album

The chat media preview SHALL save image and video messages to the system album on the current platform without surfacing native permission implementation errors to the user.

#### Scenario: Android saves media without old write-storage permission

- **GIVEN** the user opens an image or video in the chat media preview on Android Q/API 29 or later
- **AND** the app does not hold the legacy external-storage write permission
- **WHEN** the user taps the save action
- **THEN** the app MUST write the media file through Android MediaStore
- **AND** the app MUST NOT call an Android save path that rejects with `Missing MEDIA_LIBRARY write permission.`
- **AND** the app MUST show the existing save success feedback after the media is written

#### Scenario: Save failure uses existing feedback

- **WHEN** saving a chat image or video fails
- **THEN** the app MUST show the existing media save failure feedback
- **AND** it MUST NOT leave an unhandled promise rejection visible to the user
