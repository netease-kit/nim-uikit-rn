## MODIFIED Requirements

### Requirement: Team Member List And Avatar Navigation

The team-setting and team-member pages SHALL render member rows with nickname precedence, native-aligned member preview, role labels, avatar display, avatar-tap navigation, search, large-team rendering behavior, and initial-load failure recovery required by the tests. The full member list SHALL display friend alias before team nickname, team nickname before personal nickname, and personal nickname before account ID. The full member list SHALL refresh displayed member names and search matching when the highest-priority available name source changes, including friend alias, team nickname, and personal nickname.

#### Scenario: Team member search matches visible display name

- **GIVEN** the user opens a full team member list
- **AND** a member row displays a name resolved from friend alias, team nickname, or personal nickname
- **WHEN** the user searches with text contained in that displayed name
- **THEN** the member MUST appear in the search results
- **AND** searching by the member account ID MUST continue to match the same member.
