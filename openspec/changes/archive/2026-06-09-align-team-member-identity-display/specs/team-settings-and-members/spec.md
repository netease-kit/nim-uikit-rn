## MODIFIED Requirements

### Requirement: Team Member List And Avatar Navigation

The team-setting and team-member pages SHALL render member rows with nickname precedence, native-aligned member preview, role labels, avatar display, avatar-tap navigation, search, large-team rendering behavior, and initial-load failure recovery required by the tests.

#### Scenario: Team settings member preview shows avatars only

- **WHEN** the team settings page renders the horizontal member preview
- **THEN** each existing member preview item MUST show the member avatar
- **AND** it MUST NOT show the member nickname below the avatar

#### Scenario: Team member list hides account id and normal role marker

- **WHEN** the full team member list renders a member row
- **THEN** the row MUST show the member display name using team nickname before friend alias, profile nickname, and account ID
- **AND** the row MUST NOT show the member account ID below the display name
- **AND** normal members MUST NOT show a member identity marker

#### Scenario: Team owner and manager badges match native style

- **WHEN** a full team member list row belongs to the team owner or a manager
- **THEN** the row MUST show the corresponding `群主` or `管理员` marker on the right side of the row
- **AND** the marker MUST use a native-aligned rounded bordered badge style

#### Scenario: Team nickname updates member rows in realtime

- **WHEN** a member's nickname in the current team is changed
- **THEN** the team settings member preview and full member list update to show the new team nickname without requiring page re-entry
- **AND** the displayed member name uses team nickname before friend alias, profile nickname, and account ID
