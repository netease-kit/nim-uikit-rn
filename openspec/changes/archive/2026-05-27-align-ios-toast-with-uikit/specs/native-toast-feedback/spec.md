## ADDED Requirements

### Requirement: iOS shared toast feedback MUST be non-blocking

The RN app SHALL present shared toast feedback on iOS as a transient floating overlay instead of a blocking system alert whenever code uses the shared native toast entry point.

#### Scenario: Shared toast is shown on iOS

- **WHEN** RN code invokes the shared native toast utility on iOS with a non-empty message
- **THEN** the app displays a transient floating toast overlay
- **THEN** the toast does not require user confirmation to dismiss

### Requirement: Shared toast presentation MUST be reusable across RN screens

The RN app SHALL provide a shared toast host at the root layout so toast-like feedback can be rendered consistently from multiple RN screens without each screen maintaining its own local overlay implementation.

#### Scenario: Multiple RN screens reuse the same toast host

- **WHEN** different RN screens trigger shared toast feedback
- **THEN** the feedback is rendered through the same root-level toast presentation mechanism
- **THEN** the visual style and dismissal behavior remain consistent across those screens

### Requirement: Android toast behavior MUST remain compatible

The RN app SHALL preserve Android transient toast behavior when the shared native toast utility is invoked from existing RN flows.

#### Scenario: Shared toast is shown on Android

- **WHEN** RN code invokes the shared native toast utility on Android
- **THEN** the app continues to present transient toast feedback without introducing a blocking alert
