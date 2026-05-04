## ADDED Requirements

### Requirement: About page shows the configured beta version

The `/user/aboutNetease` page MUST display version `10.0.0-beta` in its version row.

#### Scenario: User opens the about page

- **WHEN** the user navigates to `/user/aboutNetease`
- **THEN** the page shows a `版本号` row
- **AND** the row value is `10.0.0-beta`
