## MODIFIED Requirements

### Requirement: Chat Detail Identity Display

The chat detail screen SHALL render the current conversation identity using the shared UIKit appellation rules and SHALL display P2P online/offline status inline with the title.

#### Scenario: P2P online status follows title inline

- **GIVEN** the user opens a P2P chat detail page
- **AND** the peer online/offline status is available
- **WHEN** the header title is rendered
- **THEN** RN MUST display the online/offline status after the title name on the same line
- **AND** RN MUST truncate an overlong title with an ellipsis before the status
- **AND** RN MUST keep the online/offline status fully visible
