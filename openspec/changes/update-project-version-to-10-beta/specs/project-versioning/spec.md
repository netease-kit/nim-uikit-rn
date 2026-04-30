## ADDED Requirements

### Requirement: Project version is configured as 10.0.0-beta

The project MUST use `10.0.0-beta` as its configured version string across the primary application version configuration files.

#### Scenario: Inspect project version configuration

- **WHEN** a contributor checks the project version configuration
- **THEN** `package.json` uses `10.0.0-beta`
- **AND** `app.json` uses `10.0.0-beta`
- **AND** Android `versionName` uses `10.0.0-beta`
