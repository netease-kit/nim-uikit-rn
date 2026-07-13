## MODIFIED Requirements

### Requirement: Chat Media Save To System Album

The chat media preview SHALL save image and video messages to the system album on the current platform without surfacing native permission implementation errors to the user, and SHALL present the opened media centered in the preview viewport.

#### Scenario: Media preview centers opened content

- **WHEN** the user opens an image or video in the chat media preview
- **THEN** the media content MUST be horizontally centered in the available black preview viewport
- **AND** the media content MUST be vertically centered in the available black preview viewport
- **AND** bottom overlay actions MUST NOT shift the media content away from the center
