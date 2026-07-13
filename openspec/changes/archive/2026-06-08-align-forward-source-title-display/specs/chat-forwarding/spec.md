## ADDED Requirements

### Requirement: Batch Forward Confirmation Source Title

The system SHALL show the current source conversation title in merged-forward and one-by-one-forward confirmation previews. For P2P conversations the source title SHALL use friend remark, then user nickname, then account ID. For team conversations the source title SHALL use the team name.

#### Scenario: P2P batch forward confirmation with remark

- **WHEN** the user starts merged forwarding or one-by-one forwarding from a P2P chat whose peer has a friend remark
- **THEN** the confirmation preview uses the friend remark as the source conversation title

#### Scenario: P2P batch forward confirmation without remark

- **WHEN** the user starts merged forwarding or one-by-one forwarding from a P2P chat whose peer has no friend remark
- **THEN** the confirmation preview uses the peer user nickname, or the account ID when no nickname exists

#### Scenario: Team batch forward confirmation

- **WHEN** the user starts merged forwarding or one-by-one forwarding from a team chat
- **THEN** the confirmation preview uses the team name as the source conversation title

### Requirement: Merged Forward Payload Source Title

The system SHALL write merged-forward payload source titles without sender-local P2P friend remarks. For P2P conversations the payload title SHALL use user nickname, then account ID. For team conversations the payload title SHALL use the team name.

#### Scenario: P2P merged-forward payload with local remark

- **WHEN** the user sends a merged-forward message from a P2P chat whose peer has a friend remark
- **THEN** the sent merged-forward payload title uses the peer user nickname or account ID, not the friend remark

#### Scenario: Team merged-forward payload

- **WHEN** the user sends a merged-forward message from a team chat
- **THEN** the sent merged-forward payload title uses the team name
