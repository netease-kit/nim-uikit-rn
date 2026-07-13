## MODIFIED Requirements

### Requirement: My Home Page

The app SHALL provide the My page with avatar, nickname, account, personal-detail entry, about entry, settings entry, and favorites or collection entry required by the tests.

#### Scenario: Viewing the My page

- **WHEN** the user opens the My tab
- **THEN** the page shows the expected overview and entry points
- **AND** the visible primary menu includes `关于云信`、`设置`、and `收藏`

### Requirement: Settings And Collection Entry Points

The My page SHALL route into settings and collection-related entry points without breaking the current account overview flow.

#### Scenario: Opening settings or collection from My

- **WHEN** the user taps the settings or collection-related entry from My
- **THEN** the app opens the corresponding destination surface with the expected initial state
