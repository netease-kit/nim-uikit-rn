## ADDED Requirements

### Requirement: Large team chat entry defers full member loading

The system SHALL NOT load the full team member list as part of opening a team chat. Chat entry MAY preload a bounded first page of team members for cache warmup, and MUST fetch the current user's team member record for role checks without marking the full member list as loaded.

#### Scenario: Open 3000-member team chat

- **WHEN** the user opens a team conversation with thousands of members
- **THEN** the chat screen renders without issuing a full team-member pagination loop during initial entry
- **AND** the chat screen may issue at most one bounded member-list preload request for the first 150 members

#### Scenario: Open mention picker

- **WHEN** the user opens the team mention picker
- **THEN** the system loads the full team member list if it has not already been loaded
- **AND** the mention picker renders candidates through a virtualized list without fetching every member profile up front

### Requirement: Team member loading is de-duplicated

The system SHALL de-duplicate concurrent team member loads for the same team and query shape so repeated UI effects do not start duplicate full-member pagination requests.

#### Scenario: Duplicate full member requests

- **WHEN** two components request the same team's full member list before the first request finishes
- **THEN** both callers await the same in-flight request

#### Scenario: Duplicate member-by-id requests

- **WHEN** two components request the same team's same account member records before the first request finishes
- **THEN** both callers await the same in-flight request

### Requirement: Large team member lists load fully and render virtually

The system SHALL allow team member list pages to load the full member set, including multiple SDK pages when required, while rendering the loaded records through a virtualized list so large teams do not mount every row at once.

#### Scenario: Open 3000-member team member list

- **WHEN** the user opens a team member list with thousands of members
- **THEN** the screen starts a de-duplicated full member load and renders loaded members through a virtualized list

#### Scenario: Visible member profiles

- **WHEN** member rows become visible in the team member list
- **THEN** the system fetches missing user profiles for visible accounts without issuing an all-member profile request

#### Scenario: Fast scroll large member list

- **WHEN** the user quickly scrolls a large team member list after members have loaded
- **THEN** the list keeps virtualization enabled and avoids sustained blank pages
