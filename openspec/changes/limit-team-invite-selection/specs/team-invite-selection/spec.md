# Capability: Team Invite Selection

## ADDED Requirements

### Requirement: Team invite picker enforces per-operation selection cap

The app SHALL limit a single existing-team invite operation to at most 200 selected contacts before calling the team invite SDK.

#### Scenario: Selecting the 201st contact

- **GIVEN** the user is inviting members to an existing team
- **AND** 200 contacts are already selected
- **WHEN** the user taps another unselected contact
- **THEN** the selection SHALL remain at 200 contacts
- **AND** the app SHALL show `最多只能选择200个联系人`
- **AND** the app SHALL NOT call the team invite SDK for that tap

#### Scenario: Submitting an over-limit stale selection

- **GIVEN** the invite picker state contains more than 200 selected contacts
- **WHEN** the user taps confirm
- **THEN** the app SHALL show `最多只能选择200个联系人`
- **AND** the app SHALL NOT call the team invite SDK
