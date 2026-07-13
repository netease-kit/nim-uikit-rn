## MODIFIED Requirements

### Requirement: Camera Permission Flow

The app SHALL request camera permission for avatar and media capture flows and SHALL support first request, while-in-use approval, one-time approval, rejection, and re-request behavior required by the tests, including re-requesting native camera permission after Android one-time access is reclaimed by the system.

#### Scenario: Using a camera-dependent flow without permission

- **WHEN** the user opens a camera-dependent flow before camera permission is granted
- **THEN** the app requests or re-checks permission and handles rejection using the expected guidance

#### Scenario: Re-requesting camera permission after Android one-time approval expires

- **WHEN** the user previously chose Android one-time camera approval
- **AND** the system later reclaims that camera permission after the app is restarted
- **THEN** the next camera-dependent action MUST trigger the native camera permission request again
- **AND** the app MUST NOT skip directly to the settings guidance before retrying that native request

#### Scenario: Android camera permission is scheduled for revoke on process kill

- **WHEN** the app successfully obtains camera permission on supported Android versions
- **THEN** the app MUST schedule that permission to be revoked when the app process is killed
- **AND** the next app launch after process death MUST re-enter the native camera authorization flow
