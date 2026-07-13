## MODIFIED Requirements

### Requirement: Shared toast presentation MUST be reusable across RN screens

The RN app SHALL provide a shared toast host at the root layout so toast-like feedback can be rendered consistently from multiple RN screens without each screen maintaining its own local overlay implementation. Shared toast feedback SHALL be rendered as a custom root overlay on all native platforms, SHALL appear in the lower-middle viewport by default, SHALL move above the keyboard when the keyboard is visible, and SHALL remain in the top overlay layer without blocking page interaction.

#### Scenario: Multiple RN screens reuse the same toast host

- **WHEN** different RN screens trigger shared toast feedback
- **THEN** the feedback is rendered through the same root-level toast presentation mechanism
- **AND** the visual style and dismissal behavior remain consistent across those screens

#### Scenario: Shared toast appears while keyboard is visible

- **GIVEN** the user is on an RN screen with the keyboard visible
- **WHEN** shared toast feedback is triggered
- **THEN** the toast SHALL appear above the keyboard
- **AND** the toast SHALL remain visible in the top overlay layer
- **AND** the toast SHALL NOT block touch interaction with the current screen

### Requirement: Android toast behavior MUST remain compatible

The RN app SHALL preserve Android transient toast behavior when the shared native toast utility is invoked from existing RN flows, while rendering that feedback through the shared custom root toast host instead of the platform system toast.

#### Scenario: Shared toast is shown on Android

- **WHEN** RN code invokes the shared native toast utility on Android
- **THEN** the app continues to present transient toast feedback without introducing a blocking alert
- **AND** the toast uses the same custom root overlay positioning as other native platforms
