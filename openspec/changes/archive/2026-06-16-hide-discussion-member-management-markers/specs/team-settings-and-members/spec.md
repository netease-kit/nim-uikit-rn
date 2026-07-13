## MODIFIED Requirements

### Requirement: Team Member List And Avatar Navigation

The team-setting and team-member pages SHALL render member rows with nickname precedence, native-aligned member preview, role labels, avatar display, avatar-tap navigation, search, large-team rendering behavior, and initial-load failure recovery required by the tests. The full member list SHALL display friend alias before team nickname, team nickname before personal nickname, and personal nickname before account ID. The full member list SHALL refresh displayed member names and search matching when the highest-priority available name source changes, including friend alias, team nickname, and personal nickname.

#### Scenario: Discussion member list hides role and remove controls

- **WHEN** the full member list is opened for a discussion group
- **THEN** member rows SHALL NOT show the `群主` marker
- **AND** member rows SHALL NOT show the `管理员` marker
- **AND** member rows SHALL NOT show the `移除` action

#### Scenario: Advanced group member list keeps role and remove controls

- **WHEN** the full member list is opened for an advanced group
- **THEN** owner and manager rows SHALL keep their existing role marker behavior
- **AND** members that the current user is allowed to remove SHALL keep the existing `移除` action
