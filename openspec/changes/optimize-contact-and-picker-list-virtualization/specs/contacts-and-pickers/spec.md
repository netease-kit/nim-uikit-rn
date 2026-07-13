## MODIFIED Requirements

### Requirement: Contact and picker long lists remain responsive with large datasets

RN contact directory and high-frequency picker lists MUST use effective virtualized-list configurations that preserve the current UX while reducing unnecessary work for larger datasets.

#### Scenario: Render many friends on the contacts home page

- **WHEN** the contacts home page renders a large friend directory
- **THEN** the friend `SectionList` uses virtualization parameters suitable for fixed-height rows and lightweight section headers
- **AND** unchanged friend rows avoid unnecessary rerenders during list updates

#### Scenario: Render many selectable friends in pickers

- **WHEN** the conversation picker or team-member picker renders a large number of candidates
- **THEN** the picker list uses virtualization parameters suitable for fixed-height rows
- **AND** unchanged picker rows avoid unnecessary rerenders during selection and search updates
- **AND** the existing selection, search, empty-state, and submit flows continue to work
