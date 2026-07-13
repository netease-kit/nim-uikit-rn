## ADDED Requirements

### Requirement: Suppress Transient Unavailable Feedback After Direct Team Join

The chat screen SHALL NOT show team unavailable feedback or remove the conversation for transient SDK errors that occur immediately after the current user directly joins a team without approval.

#### Scenario: Directly joining a free-join team and opening chat

- **GIVEN** the user applies to join a team that does not require approval
- **AND** the join succeeds and the app opens the team chat
- **WHEN** initial team/member/history synchronization temporarily reports no permission, member missing, or team unavailable
- **THEN** the app MUST NOT show the team unavailable alert
- **AND** the app MUST NOT remove or delete the newly opened team conversation

#### Scenario: Real team dismissal or leave event after direct join

- **GIVEN** the user recently joined a team without approval
- **WHEN** the SDK emits a team dismissed or team left event for the opened team
- **THEN** the app MUST show the team unavailable feedback
- **AND** the app MUST keep the existing conversation cleanup behavior
