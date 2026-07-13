## ADDED Requirements

### Requirement: Account switching must not inherit the previous account's conversation mode

When the user starts logging in as another account, the app MUST keep cloud-conversation preference isolated per account so the new account starts in local conversation mode by default.

#### Scenario: Logging in as another account after a cloud-conversation session

- **WHEN** account A enabled cloud conversation, logs out, and account B starts a new login flow
- **THEN** account B MUST log in with local conversation mode by default
- **AND** account B MUST NOT inherit account A's cloud-conversation setting automatically

#### Scenario: Logging back into the same account after enabling cloud conversation

- **WHEN** account A enabled cloud conversation, logs out, and later logs back in again
- **THEN** account A MUST keep using its own previously selected cloud-conversation mode
- **AND** that preference MUST NOT be overwritten by another account's default local mode
