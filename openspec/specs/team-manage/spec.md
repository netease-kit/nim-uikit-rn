# team-manage Specification

## Purpose

TBD - created by archiving change remove-team-manage-chat-banned. Update Purpose after archive.

## Requirements

### Requirement: Team Manage Screen Only Shows Management-Specific Controls

The RN app MUST keep the team manage screen focused on management-specific controls and MUST NOT duplicate the team chat banned switch that is already owned by the main team settings screen. The team manage screen SHALL present permission labels consistently for group owner and admin options.

#### Scenario: Updating who can add group members

- **WHEN** a group owner or administrator opens the team management page
- **THEN** the page MUST show a "who can add group members" setting
- **AND** the current value MUST reflect `team.inviteMode` as either all members or owner/admins
- **WHEN** the user selects all members or owner/admins
- **THEN** the app MUST update the team's `inviteMode` through the team update API
- **AND** the add-member entry permission MUST follow the updated value
- **AND** the resulting team notification MUST describe the owner/admins value as "群主和管理员" / "Owner and admins", not owner-only

#### Scenario: Owner/admin permission value uses unified wording

- **WHEN** the team management page renders `群资料修改权限`, `谁可以添加群成员`, or `谁可以@所有人`
- **AND** the selected value or option means owner/admin permission
- **THEN** the Chinese copy SHALL display `群主和管理员`
- **AND** it SHALL NOT display `群主/管理员`
