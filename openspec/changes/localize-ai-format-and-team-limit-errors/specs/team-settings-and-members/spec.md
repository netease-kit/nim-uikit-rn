## ADDED Requirements

### Requirement: Team Join Member Limit Feedback

The team join flow SHALL localize SDK group-member-limit failures instead of surfacing raw English SDK messages.

#### Scenario: Group is full when applying to join

- **GIVEN** the user searches for a group and taps apply to join
- **WHEN** the SDK rejects the join request because the group member count has reached its limit
- **THEN** the app MUST show `群组人数达到上限` in Chinese mode
