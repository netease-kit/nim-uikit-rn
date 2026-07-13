## MODIFIED Requirements

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
