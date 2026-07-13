## MODIFIED Requirements

### Requirement: Team Mention All Permission

The chat mention selector SHALL show the "所有人" option according to the team's @-all permission setting.

#### Scenario: Owner/admin-only permission

- **GIVEN** a team has configured @-all permission as owner/admin only
- **WHEN** the current user is the team owner or a team manager and types `@`
- **THEN** the mention selector shows the "所有人" option
- **WHEN** the current user is a normal team member and types `@`
- **THEN** the mention selector does not show the "所有人" option

#### Scenario: Everyone permission

- **GIVEN** a team has configured @-all permission as everyone
- **WHEN** any team member types `@`
- **THEN** the mention selector shows the "所有人" option
