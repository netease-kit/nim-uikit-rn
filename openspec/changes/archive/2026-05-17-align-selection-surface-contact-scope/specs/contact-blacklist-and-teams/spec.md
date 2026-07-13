## MODIFIED Requirements

### Requirement: Blacklist Entry Points

The contacts module SHALL support adding to or removing from blacklist from both the blacklist picker flow and friend-card switches, including digital-human rows where the tests require them.

#### Scenario: Toggling blacklist membership from different entry points

- **WHEN** the user changes blacklist state from a picker or friend-card control
- **THEN** the resulting state is reflected consistently across contacts surfaces

#### Scenario: Blacklist picker excludes AI users and unavailable accounts

- **WHEN** the user opens the picker flow to add members into the blacklist
- **THEN** the selectable list MUST include current-account friends that are not already blacklisted
- **AND** the list MUST exclude AI users, self, and accounts that already belong to the blacklist
