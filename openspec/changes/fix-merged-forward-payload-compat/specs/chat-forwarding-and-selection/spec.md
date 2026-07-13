## ADDED Requirements

### Requirement: Merged Forward Cross-Platform Payload Compatibility

The chat module SHALL send merged-forward messages using the shared custom-message protocol expected by React Web, Android, and iOS clients instead of an RN-only inline attachment shape.

#### Scenario: Sending a merged-forward message from RN

- **WHEN** the user sends a merged-forward message from the RN demo
- **THEN** the outgoing custom message MUST use custom `type=101`
- **AND** the custom payload MUST place `sessionId`, `sessionName`, `url`, `md5`, `depth`, and `abstracts` under `data`
- **AND** the uploaded file referenced by `url` MUST contain the merged message header line followed by serialized NIM messages, one record per line

### Requirement: Legacy RN Merged Forward Compatibility

The chat module SHALL continue to read historical RN merged-forward messages that used the legacy `subType=100001` inline payload.

#### Scenario: Opening a historical legacy merged-forward message

- **WHEN** the user opens a previously sent RN merged-forward message that still uses the legacy inline payload
- **THEN** the app MUST keep rendering its summary and detail page successfully

### Requirement: Standard Merged Forward Detail Loading

The chat module SHALL open standard `type=101` merged-forward messages by downloading and deserializing the referenced merged-history file.

#### Scenario: Opening a standard merged-forward detail page

- **WHEN** the user taps a merged-forward message that uses the shared `type=101` payload
- **THEN** the RN app MUST download or reuse a cached merged-history text file from `data.url`
- **AND** the app MUST deserialize each serialized message row and render the detail timeline with RN UIKit bubbles
