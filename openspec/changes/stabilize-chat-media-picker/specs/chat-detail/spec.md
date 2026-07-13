## MODIFIED Requirements

### Requirement: Chat Album Access Under Limited Permissions

The chat detail screen SHALL restrict limited photo-library access to only the media assets currently authorized by the system.

#### Scenario: Media picker scrolls without blank cells

- **GIVEN** the chat detail media picker is showing image and video assets
- **WHEN** the user repeatedly scrolls the media grid up and down quickly
- **THEN** visible grid cells MUST remain populated as their thumbnails load
- **AND** the grid MUST render stable preview sources instead of repeatedly resolving media asset URIs while cells are recycled
- **AND** video thumbnail generation MUST be bounded so it does not block selection or sending operations
- **AND** visible video cells MUST be prioritized when generating thumbnail previews
- **AND** the grid virtualization layout MUST calculate row offsets consistently with its three-column layout
- **AND** the picker MUST avoid repeatedly triggering pagination during the same momentum scroll
- **AND** the picker MUST preserve the existing media selection, disabled-state, and send behavior
