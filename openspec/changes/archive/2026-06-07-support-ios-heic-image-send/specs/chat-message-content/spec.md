## MODIFIED Requirements

### Requirement: Attachment Message Types

The chat module SHALL send and render image, video, file, voice-like, location-like, and downloaded-attachment rows with the size, count, format, preview, and reopen behavior required by the tests.

#### Scenario: Rendering or opening remote attachment URLs from HTTPS-capable NOS hosts

- **WHEN** the RN app receives an image, video, or file attachment whose remote `url` uses `http` for an HTTPS-capable NOS host
- **THEN** rendering, previewing, downloading, or opening that attachment MUST use the equivalent `https` URL
- **AND** the app MUST NOT require broad insecure network loading for that attachment to work on iOS

#### Scenario: Other-client local paths do not override remote attachment URLs

- **WHEN** the RN app receives a video or file attachment containing both a remote `url` and a non-local sender-side `path`
- **THEN** rendering, previewing, downloading, or opening the attachment MUST use the remote `url`
- **AND** local `file://` or `content://` paths MAY still be used before remote URLs for attachments that are available on the current device

#### Scenario: iOS HEIC image selection is allowed

- **GIVEN** the chat detail page runs on iOS
- **WHEN** the user selects an image asset whose filename extension is `heic`, `heif`, `tiff`, or `tif`
- **THEN** RN MUST allow the asset to continue into the image-message send flow
- **AND** RN MUST NOT show the unsupported-format toast before sending

#### Scenario: iOS HEIC MIME image selection is allowed

- **GIVEN** the chat detail page runs on iOS
- **WHEN** the image picker returns an image asset whose MIME type is `image/heic`, `image/heif`, or `image/tiff`
- **THEN** RN MUST allow the asset to continue into the image-message send flow
- **AND** RN MUST NOT show the unsupported-format toast before sending

#### Scenario: Android image selection keeps existing format support

- **GIVEN** the chat detail page runs on Android
- **WHEN** the user selects an image asset
- **THEN** RN MUST keep the existing jpg/jpeg/png/gif image format whitelist
- **AND** RN MUST NOT expand Android image sending support to iOS-only HEIC/HEIF/TIFF formats
