## MODIFIED Requirements

### Requirement: Team Manage Screen Only Shows Management-Specific Controls

The RN app MUST keep the team manage screen focused on management-specific controls and MUST NOT duplicate the team chat banned switch that is already owned by the main team settings screen. The team manage screen SHALL present permission labels consistently for group owner and admin options.

#### Scenario: Owner/admin permission value uses unified wording

- **WHEN** the team management page renders `群资料修改权限`, `谁可以添加群成员`, or `谁可以@所有人`
- **AND** the selected value or option means owner/admin permission
- **THEN** the Chinese copy SHALL display `群主和管理员`
- **AND** it SHALL NOT display `群主/管理员`
