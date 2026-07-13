## ADDED Requirements

### Requirement: iOS Web Vue3 Video Playback Compatibility

The chat module SHALL preserve and apply video attachment extension metadata when opening videos in the iOS media viewer.

#### Scenario: Web Vue3 extensionless MOV video opens on iOS

- **GIVEN** the chat detail page runs on iOS
- **AND** the user receives a normal video message from Web Vue3 whose remote NOS `url` has no filename extension
- **AND** the video attachment carries `.mov` or `mov` extension metadata in `ext`, `name`, or parsed attachment metadata
- **WHEN** the user opens the video message
- **THEN** RN MUST cache or resolve the playable video URI with a video filename extension
- **AND** the media viewer MUST render the video through the native video player
- **AND** RN MUST NOT require the user to save the video from the viewer before local playback works.
