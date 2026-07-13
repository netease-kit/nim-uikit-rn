## MODIFIED Requirements

### Requirement: Blacklist Management

The contacts module SHALL expose the blacklist list, blacklist empty state, row sorting, display-name precedence, add/remove blacklist actions, initial-load failure recovery with network-aware behavior, and the shared no-avatar fallback label order for blacklisted friends.

#### Scenario: Blacklisted friend display name resolves with contact priority

- **WHEN** a blacklist row renders a friend
- **THEN** the row title MUST prefer the friend's alias
- **AND** it MUST then prefer the friend's personal nickname
- **AND** it MUST finally fall back to the friend's `accid`

#### Scenario: Blacklisted friend has no avatar image

- **WHEN** a blacklist row renders a friend without a preset avatar image
- **THEN** the default avatar label MUST prefer the friend's alias
- **AND** it MUST then prefer the friend's personal nickname
- **AND** it MUST finally fall back to the friend's `accid`
- **AND** the rendered default avatar text MUST use the last two characters of the resolved label source
