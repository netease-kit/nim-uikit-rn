## MODIFIED Requirements

### Requirement: Team Manage Screen Only Shows Management-Specific Controls

The RN app MUST keep the team manage screen focused on management-specific controls and MUST NOT duplicate the team chat banned switch that is already owned by the main team settings screen.

#### Scenario: Updating who can add group members

- **WHEN** a group owner or administrator opens the team management page
- **THEN** the page MUST show a "who can add group members" setting
- **AND** the current value MUST reflect `team.inviteMode` as either all members or owner/admins
- **WHEN** the user selects all members or owner/admins
- **THEN** the app MUST update the team's `inviteMode` through the team update API
- **AND** the add-member entry permission MUST follow the updated value
- **AND** the resulting team notification MUST describe the owner/admins value as "群主和管理员" / "Owner and admins", not owner-only
