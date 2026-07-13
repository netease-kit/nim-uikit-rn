## ADDED Requirements

### Requirement: Chat Detail Top Banner

The chat detail screen SHALL render the top banner according to the current conversation and connection state.

#### Scenario: P2P chat peer is not a friend

- **GIVEN** the user opens a P2P chat detail page
- **AND** the peer account is not the current user
- **AND** the peer account is not an AI user
- **AND** the peer account is not in the current friend list
- **WHEN** the chat detail page renders
- **THEN** the page MUST show the non-friend relationship banner text `当前不是您的好友，请注意保护个人隐私安全`
- **AND** the page MUST NOT show the anti-fraud/security reminder at the same time

#### Scenario: P2P chat peer is a friend

- **GIVEN** the user opens a P2P chat detail page
- **AND** the peer account is in the current friend list
- **WHEN** the chat detail page renders
- **THEN** the page MUST continue to show the existing anti-fraud/security reminder when it has not been dismissed

#### Scenario: Network banner takes priority

- **GIVEN** the user opens a P2P chat detail page
- **AND** the app is not logged in or still connecting
- **WHEN** the chat detail page renders
- **THEN** the page MUST continue to show the existing network or connecting banner
- **AND** the non-friend banner MUST remain a separate conversation-state banner below that network banner
