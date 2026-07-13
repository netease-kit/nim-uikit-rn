## MODIFIED Requirements

### Requirement: Attachment Message Types

The chat module SHALL send and render image, video, file, voice-like, location-like, and downloaded-attachment rows with the size, count, format, preview, and reopen behavior required by the tests.

#### Scenario: Rendering image messages received from HTTP NOS URLs on iOS

- **WHEN** the RN app receives an image message whose attachment contains a remote NOS image `url` using the `http` scheme for an HTTPS-capable NOS host
- **THEN** the chat image bubble MUST render the image from the equivalent `https` URL
- **AND** tapping the image MUST open the media preview from the equivalent `https` URL
- **AND** the app MUST NOT require broad insecure network loading for that image to display
