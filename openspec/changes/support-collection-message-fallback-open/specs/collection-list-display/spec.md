## MODIFIED Requirements

### Requirement: Collection Item Detail Fallback Opening

The app SHALL allow a collected message to open from the collection list even when the original chat message has not been synchronized into the current message store.

#### Scenario: Open collected media or content without synced original message

- **WHEN** the user taps a collected message from the collection list
- **AND** the original message is not currently available in `messageStore`
- **THEN** the app MUST use fallback detail parameters derived from the resolved collection message
- **AND** text, image, video, file, location, and merged-forward collection items MUST still open into their corresponding detail pages when the fallback data is available
