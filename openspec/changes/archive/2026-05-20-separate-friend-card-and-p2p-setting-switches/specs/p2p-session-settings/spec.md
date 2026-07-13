## MODIFIED Requirements

### Requirement: P2P Reminder And Stick-Top Toggles

The p2p setting page SHALL support reminder and stick-top toggles with repeated-tap, offline-failure, reconnect-consistency, and conversation-list synchronization behavior, and it MUST NOT duplicate blacklist controls that belong to the friend card flow.

#### Scenario: Toggling p2p reminder or stick-top

- **WHEN** the user changes reminder or stick-top state
- **THEN** the final visible state matches the latest successful result

#### Scenario: P2P settings hide blacklist controls

- **WHEN** the user opens the single-chat setting page
- **THEN** the page must show reminder and stick-top controls for the current conversation
- **AND** it must not show the blacklist switch
