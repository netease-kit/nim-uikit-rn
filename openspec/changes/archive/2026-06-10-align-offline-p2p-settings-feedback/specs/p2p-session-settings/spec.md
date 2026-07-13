## MODIFIED Requirements

### Requirement: P2P Reminder And Stick-Top Toggles

The p2p setting page SHALL support reminder and stick-top toggles with repeated-tap, offline-failure, reconnect-consistency, and conversation-list synchronization behavior, and it MUST NOT duplicate blacklist controls that belong to the friend card flow. When the user is offline and changes either toggle from the single-chat settings page, the app SHALL block the mutation and show the common offline prompt `当前网络异常，请检查你的网络设置` instead of surfacing raw SDK errors such as `illegal state`.

#### Scenario: Toggling p2p reminder or stick-top

- **WHEN** the user changes reminder or stick-top state while the network is available
- **THEN** the final visible state matches the latest successful result

#### Scenario: Offline toggle shows common network prompt

- **WHEN** the user changes the reminder or stick-top toggle while the device is offline
- **THEN** the app does not apply the requested toggle mutation
- **AND** the app shows `当前网络异常，请检查你的网络设置`
- **AND** the app does not surface raw SDK text such as `illegal state`

#### Scenario: P2P settings hide blacklist controls

- **WHEN** the user opens the single-chat setting page
- **THEN** the page must show reminder and stick-top controls for the current conversation
- **AND** it must not show the blacklist switch
