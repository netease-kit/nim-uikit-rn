## MODIFIED Requirements

### Requirement: iOS Startup Verification

User-visible iOS startup regressions SHALL be validated against the native simulator build when the change touches app assets, first-run copy, or root navigation behavior.

#### Scenario: Startup polish change affects iOS install or first screen

- **WHEN** a change updates iOS app icon assets, first-launch language defaults, or root stack back-button behavior
- **THEN** the change is verified on the iOS simulator in addition to static checks
