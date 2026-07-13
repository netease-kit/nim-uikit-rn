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
