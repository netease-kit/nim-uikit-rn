## ADDED Requirements

### Requirement: Team Manage Screen Only Shows Management-Specific Controls

The RN app MUST keep the team manage screen focused on management-specific controls and MUST NOT duplicate the team chat banned switch that is already owned by the main team settings screen.

#### Scenario: Team manage hides chat banned

- **WHEN** an owner or manager opens the team manage screen
- **THEN** the screen must show management items such as invite mode, update info mode, agree mode, and @ permission
- **AND** it must not show the `群禁言` switch
