## ADDED Requirements

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

The app SHALL request photo-library permission for avatar and media-selection flows and SHALL support full, limited, denied, allow-more, and post-settings-change behavior required by the tests.

#### Scenario: Using an album-dependent flow without permission

- **WHEN** the user opens an album-dependent flow before photo-library permission is granted
- **THEN** the app handles request, denial, limited access, and later permission changes according to the tests

### Requirement: Permission Failure Containment

The permission flows SHALL keep the user on the originating profile or chat surface after denial, SHALL avoid side effects before permission is granted, and SHALL recover cleanly when the user later changes permission in system settings.

#### Scenario: Returning from denied or changed system permissions

- **WHEN** the user denies a permission and later retries after changing the system setting
- **THEN** the app resumes the originating flow with the expected permission state and without stale error UI
