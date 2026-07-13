## MODIFIED Requirements

### Requirement: Chat Album Access Under Limited Permissions

The chat detail screen SHALL restrict limited photo-library access to only the media assets currently authorized by the system and SHALL display those media assets in a stable, native-aligned order across RN Android and RN iOS.

#### Scenario: Media picker order is stable across RN Android and RN iOS

- **WHEN** the user opens the chat detail media picker from the bottom input module
- **THEN** RN MUST display accessible photos and videos in latest-first order
- **AND** RN MUST use creation time as the primary ordering key
- **AND** RN MUST use modification time and a stable asset identity as fallback keys when creation time is missing or tied
- **AND** paginated loading MUST preserve that same order after appending more assets

#### Scenario: Limited media picker exposes add-more entry inside the grid

- **WHEN** the chat detail media picker is opened while photo-library access is limited
- **THEN** the picker MUST display the currently authorized assets
- **AND** the picker MUST append an `添加更多照片` entry as the last grid card
- **AND** tapping that card MUST open the system-backed path for expanding the authorized photo and video set
- **AND** after the authorization scope changes, the same picker MUST stay open and refresh against the latest authorized asset set
- **AND** newly granted assets MUST become available from the refreshed grid or its subsequent pagination without requiring the user to close and reopen the picker
