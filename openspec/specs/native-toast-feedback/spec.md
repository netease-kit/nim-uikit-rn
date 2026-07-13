# native-toast-feedback Specification

## Purpose

TBD - created by archiving change align-ios-toast-with-uikit. Update Purpose after archive.

## Requirements

### Requirement: iOS shared toast feedback MUST be non-blocking

The RN app SHALL present shared toast feedback on iOS as a transient floating overlay instead of a blocking system alert whenever code uses the shared native toast entry point.

#### Scenario: Shared toast is shown on iOS

- **WHEN** RN code invokes the shared native toast utility on iOS with a non-empty message
- **THEN** the app displays a transient floating toast overlay
- **THEN** the toast does not require user confirmation to dismiss

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

### Requirement: Notification-only feedback MUST use shared toast

The RN app SHALL present notification-only feedback through the shared toast utility instead of a system alert.

#### Scenario: Showing notification-only feedback

- **WHEN** RN needs to show feedback that only informs the user and has no required follow-up choice
- **THEN** the app uses the shared toast utility
- **AND** the feedback does not block the current screen with a system alert

#### Scenario: Preserving confirmation dialogs

- **WHEN** RN needs the user to choose between confirmation and cancellation, grant a permission in settings, or select an operation from multiple actions
- **THEN** the app may continue using a system alert with multiple buttons
- **AND** the alert is not replaced by toast

### Requirement: Alert Toast Description-Only Formatting

Shared alert-toast feedback SHALL display only the descriptive message when both a title and description are supplied.

#### Scenario: Alert toast receives title and description

- **WHEN** RN or UIKit code calls shared alert toast with both a non-empty title and a non-empty description
- **THEN** the toast SHALL display only the description
- **AND** the toast SHALL NOT render the title as a separate line

#### Scenario: Alert toast receives only title

- **WHEN** RN or UIKit code calls shared alert toast with a non-empty title and no description
- **THEN** the toast SHALL display the title as the toast message

### Requirement: Confirmed-Offline Illegal-State Errors MUST Use The Common Network Prompt

Shared toast error formatting SHALL map SDK `illegal state` text and error code `190002` to the common network prompt only when the app's latest network availability snapshot confirms that the device is offline. The app MUST NOT rewrite `illegal state` to a network prompt when the latest known network state is online or unknown.

#### Scenario: Confirmed offline illegal-state toast

- **WHEN** RN shared toast or shared error formatting receives an `illegal state` message or error code `190002`
- **AND** the latest known network state confirms the device is offline
- **THEN** the app shows `当前网络异常，请检查你的网络设置`

#### Scenario: Online or unknown illegal-state toast

- **WHEN** RN shared toast or shared error formatting receives an `illegal state` message or error code `190002`
- **AND** the latest known network state is online or unknown
- **THEN** the app does not force the message to the common offline prompt
- **AND** the app preserves the existing illegal-state error handling path
