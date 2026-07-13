## MODIFIED Requirements

### Requirement: P2P Typing Indicator

The chat detail page SHALL show a peer typing indicator only while the peer is actively typing in a P2P conversation.

#### Scenario: Peer typing indicator expires after idle timeout

- **GIVEN** the chat detail page is showing a P2P conversation
- **WHEN** a peer typing notification with `typing=1` is received
- **THEN** the header subtitle MUST show the peer typing copy
- **AND** the peer typing copy MUST be hidden after 3 seconds without another peer typing notification
- **AND** receiving another `typing=1` notification before timeout MUST restart the 3-second timeout

#### Scenario: Local typing notification stops after local input becomes idle

- **GIVEN** the local user is typing in a P2P chat composer
- **WHEN** the composer text changes to a non-empty value
- **THEN** RN MUST send a `typing=1` custom notification
- **AND** if the composer text does not change again for 3 seconds, RN MUST send a `typing=0` custom notification
- **AND** RN MUST NOT keep sending `typing=1` solely because the composer still contains unsent text

#### Scenario: Typing indicator stops immediately on explicit end

- **GIVEN** the chat detail page is showing a P2P conversation
- **WHEN** the local user clears the composer, switches out of text mode, enters selection mode, leaves the conversation, or sends the draft
- **THEN** RN MUST send or preserve the existing `typing=0` end notification behavior

- **WHEN** a peer typing notification with `typing=0` is received
- **THEN** the header subtitle MUST stop showing the peer typing copy immediately
