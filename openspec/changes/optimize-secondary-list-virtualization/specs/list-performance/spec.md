## MODIFIED Requirements

### Requirement: Secondary high-frequency lists use tuned virtualized rendering

RN high-frequency secondary lists MUST reduce unnecessary rendering work when the list size grows.

#### Scenario: Open conversation search results

- **WHEN** the user searches and the result set grows
- **THEN** the result list uses tuned virtualized rendering parameters instead of default full-window behavior

#### Scenario: Browse team members

- **WHEN** the user opens a large team member list
- **THEN** the member list uses tuned virtualized rendering parameters and stable row layout hints

#### Scenario: Browse collections

- **WHEN** the user opens a long collection list
- **THEN** the collection list reduces initial and batch render pressure through virtualized list tuning

#### Scenario: Browse contact-related sublists

- **WHEN** the user opens large blacklist, team-list, ai-user-list, or validation-message lists
- **THEN** those lists use tuned virtualized rendering parameters
- **AND** fixed-height rows provide stable layout hints when applicable

#### Scenario: Browse pinned messages or forward-selected targets

- **WHEN** the user opens long pinned-message or forward-selected lists
- **THEN** those lists reduce initial and batch render pressure through tuned virtualized rendering parameters

#### Scenario: Use list-based pickers and chat overlay lists

- **WHEN** the user opens blacklist-picker, location-picker, mention-picker, or limited-media overlay lists
- **THEN** those lists use tuned virtualized rendering parameters
- **AND** fixed-height rows provide stable layout hints when applicable
