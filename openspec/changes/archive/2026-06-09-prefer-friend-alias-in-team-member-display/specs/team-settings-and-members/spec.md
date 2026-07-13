## MODIFIED Requirements

### Requirement: Team Member List And Avatar Navigation

The team-setting and team-member pages SHALL render member rows with nickname precedence, native-aligned member preview, role labels, avatar display, avatar-tap navigation, search, large-team rendering behavior, and initial-load failure recovery required by the tests. The full member list SHALL display friend alias before team nickname, team nickname before personal nickname, and personal nickname before account ID. The full member list SHALL refresh displayed member names and search matching when the highest-priority available name source changes, including friend alias, team nickname, and personal nickname.

#### Scenario: Team member list reflects display-name source changes

- **GIVEN** the user opens a full team member list
- **AND** member A has a team nickname
- **WHEN** the user opens A's friend card and changes the current highest-priority displayed name source
- **THEN** returning to the team member list MUST show A's updated display name
- **AND** searching the member list MUST match the updated displayed name

#### Scenario: Team member list falls back after display-name source deletion

- **GIVEN** member A has a friend alias and a team nickname
- **WHEN** the user deletes A's friend alias from A's friend card
- **THEN** returning to the team member list MUST show the next display name according to the member-list precedence

#### Scenario: Team settings member preview shows avatars only

- **WHEN** the team settings page renders the horizontal member preview
- **THEN** each existing member preview item MUST show the member avatar
- **AND** it MUST NOT show the member nickname below the avatar

#### Scenario: Team member list hides account id and normal role marker

- **WHEN** the full team member list renders a member row
- **THEN** the row MUST show the member display name using friend alias before team nickname, personal nickname, and account ID
- **AND** the row MUST NOT show the member account ID below the display name
- **AND** normal members MUST NOT show a member identity marker

#### Scenario: Team owner and manager badges match native style

- **WHEN** a full team member list row belongs to the team owner or a manager
- **THEN** the row MUST show the corresponding `群主` or `管理员` marker on the right side of the row
- **AND** the marker MUST use a native-aligned rounded bordered badge style

#### Scenario: Team nickname updates member rows in realtime

- **WHEN** a member's nickname in the current team is changed
- **THEN** the team settings member preview and full member list update to show the new team nickname without requiring page re-entry
- **AND** the displayed member name uses friend alias before team nickname, personal nickname, and account ID
