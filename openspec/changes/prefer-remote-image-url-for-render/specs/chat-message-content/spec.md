## MODIFIED Requirements

### Requirement: Attachment Message Types

The chat module SHALL send and render image, video, file, voice-like, location-like, and downloaded-attachment rows with the size, count, format, preview, and reopen behavior required by the tests.

#### Scenario: Rendering image messages received from other clients

- **WHEN** the RN app receives an image message from another client whose attachment contains both a remote `url` and a sender-local or otherwise unreadable `path`
- **THEN** the chat image bubble MUST render from the remote `url`
- **AND** tapping the image MUST open the media preview from the remote `url`
- **AND** if an image attachment has no remote `url` yet, the RN app MAY fall back to its local `path`
