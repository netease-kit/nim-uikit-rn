# permission-flows Specification

## Purpose

TBD - created by archiving change port-im-kit-react-ui-h5. Update Purpose after archive.

## Requirements

### Requirement: Notification Authorization

The app SHALL request notification authorization, distinguish allow, deny, and more-settings outcomes, and provide system-settings guidance when permission is denied.

#### Scenario: Requesting notification permission

- **WHEN** the app reaches a notification-dependent flow before permission has been decided
- **THEN** the app requests notification authorization and records the resulting state

### Requirement: Camera Permission Flow

The app SHALL request camera permission for avatar and media capture flows and SHALL support first request, while-in-use approval, one-time approval, rejection, and re-request behavior required by the tests.

#### Scenario: Using a camera-dependent flow without permission

- **WHEN** the user opens a camera-dependent flow before camera permission is granted
- **THEN** the app requests or re-checks permission and handles rejection using the expected guidance

### Requirement: Album Permission Flow

The app SHALL request photo-library permission for avatar and media-selection flows and SHALL support
full, limited, denied, allow-more, and post-settings-change behavior required by the tests.

#### Scenario: Using an album-dependent flow without permission

- **WHEN** the user opens an album-dependent flow before photo-library permission is granted
- **THEN** the app handles request, denial, limited access, and later permission changes according to the tests

#### Scenario: Retrying after album permission was denied

- **WHEN** the user previously denied photo-library permission and re-enters the same album-dependent flow
- **THEN** the app MUST keep the user on the originating surface
- **AND** it MUST show actionable guidance to open system settings when the system will not present the native permission dialog again

#### Scenario: Expanding limited photo access

- **WHEN** the user previously granted limited photo-library access and needs to expose additional photos
- **THEN** the app MUST provide a system-backed path to expand the permitted photo set
- **AND** after the system permission set changes, the originating album-dependent flow MUST use the updated permission scope

#### Scenario: Chat media entry resumes directly into limited asset scope

- **WHEN** the user previously granted limited photo-library access
- **AND** the user re-enters the chat image or album-file selection flow
- **THEN** the app MUST enter the currently authorized asset picker directly
- **AND** the app MUST provide the expand-access action from inside that picker instead of forcing a separate pre-picker alert

#### Scenario: Android file entry requests permission before picker

- **WHEN** the user first opens the Android chat file-send entry before the shared media-library permission has been granted
- **THEN** RN MUST request the Android system permission first
- **AND** RN MUST NOT open the system document picker until that permission request is granted
- **AND** the file entry MUST reuse the same system permission request path as the chat image/video entry

### Requirement: Permission Failure Containment

The permission flows SHALL keep the user on the originating profile or chat surface after denial, SHALL avoid side effects before permission is granted, and SHALL recover cleanly when the user later changes permission in system settings.

#### Scenario: Returning from denied or changed system permissions

- **WHEN** the user denies a permission and later retries after changing the system setting
- **THEN** the app resumes the originating flow with the expected permission state and without stale error UI

### Requirement: System Authorization Management

The app SHALL provide a settings-managed system authorization page that displays and manages notification, camera, photo-library, and microphone permissions.

#### Scenario: Viewing system authorization settings

- **WHEN** the user opens system authorization management from Settings
- **THEN** the page shows each supported permission with a localized status label
- **AND** the page provides an action to request permission when the system can still present a native permission dialog
- **AND** the page provides an action to open system settings for denied, limited, unavailable, or otherwise externally managed permission states

#### Scenario: Returning from system authorization management

- **WHEN** the user returns to the authorization page after requesting or changing permission in system settings
- **THEN** the page refreshes the displayed permission statuses without requiring an app restart
