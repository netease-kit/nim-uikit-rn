## MODIFIED Requirements

### Requirement: Album Permission Flow

The app SHALL request photo-library permission for avatar and media-selection flows and SHALL support
full, limited, denied, allow-more, and post-settings-change behavior required by the tests.

#### Scenario: Using an album-dependent flow without permission

- **WHEN** the user opens an album-dependent flow before photo-library permission is granted
- **THEN** the app handles request, denial, limited access, and later permission changes according to the tests

#### Scenario: Android file entry requests permission before picker

- **WHEN** the user first opens the Android chat file-send entry before the shared media-library permission has been granted
- **THEN** RN MUST request the Android system permission first
- **AND** RN MUST NOT open the system document picker until that permission request is granted
- **AND** the file entry MUST reuse the same system permission request path as the chat image/video entry
