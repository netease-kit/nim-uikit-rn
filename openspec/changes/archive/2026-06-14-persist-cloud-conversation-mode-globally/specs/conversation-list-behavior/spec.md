## ADDED Requirements

### Requirement: Conversation Mode Preference Is Global

The conversation module SHALL treat the local/cloud conversation mode switch as a local persisted app preference shared across IM login accounts. The selected mode SHALL NOT be scoped to, reset by, or overridden by the currently logged-in account.

#### Scenario: Account switch keeps cloud conversation mode

- **GIVEN** account A is logged in
- **AND** the user switches the conversation mode preference to cloud conversations
- **WHEN** the user logs out and logs in as account B on the same app installation
- **THEN** account B MUST initialize with cloud conversations enabled
- **AND** account B MUST NOT fall back to local conversations because it has no account-specific preference

#### Scenario: Account switch keeps local conversation mode

- **GIVEN** account A is logged in
- **AND** the user switches the conversation mode preference to local conversations
- **WHEN** the user logs out and logs in as account B on the same app installation
- **THEN** account B MUST initialize with local conversations enabled
- **AND** account B MUST NOT force cloud conversations because of account B identity
