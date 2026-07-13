## MODIFIED Requirements

### Requirement: Failed Send Recovery

The chat module SHALL preserve failed-send rows and allow retry where the tests require resend behavior, including failures caused by network, deleted-friend, or blacklist state.

#### Scenario: Reporting from an anti-spam tip

- **WHEN** the chat page shows an anti-spam tips banner caused by a blocked send
- **THEN** the tips banner SHALL remain informational only
- **AND** the app SHALL NOT show a report button in that anti-spam tips banner
- **AND** the app SHALL NOT route the user into a local placeholder report form from that banner

#### Scenario: Styling an anti-spam blocked failure tip

- **WHEN** the chat page shows an anti-spam blocked failure tip after a send is rejected
- **THEN** that tip SHALL keep the existing failure-tip interaction path
- **AND** it SHALL render as text-only feedback without an extra background frame
