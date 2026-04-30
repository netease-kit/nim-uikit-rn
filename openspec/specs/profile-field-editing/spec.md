# profile-field-editing Specification

## Purpose
TBD - created by archiving change port-im-kit-react-ui-h5. Update Purpose after archive.
## Requirements
### Requirement: Avatar Editing Flow

The app SHALL provide the personal-avatar action sheet with camera, album, and cancel actions and SHALL keep the user on the profile surface after cancellation or permission rejection.

#### Scenario: Opening and cancelling avatar editing

- **WHEN** the user opens avatar editing and taps cancel
- **THEN** the action sheet closes without changing the current avatar

#### Scenario: Uploading avatar under unstable network

- **WHEN** the user uploads a new avatar while offline, after reconnect, or during a network switch
- **THEN** the avatar flow follows the workbook's success or failure behavior without corrupting local profile state

### Requirement: Editable Profile Fields

The app SHALL provide editors for nickname, gender, birthday, mobile, email, and signature, each with field-specific page UI, clear-action behavior, validation, and save behavior required by the tests.

#### Scenario: Editing a text field

- **WHEN** the user edits nickname, mobile, email, or signature
- **THEN** the app enforces the correct validation and save behavior for that field

#### Scenario: Editing a choice or date field

- **WHEN** the user edits gender or birthday
- **THEN** the app supports confirm and cancel behavior and only persists the confirmed value

#### Scenario: Saving gender from back navigation

- **WHEN** the user changes gender and leaves the gender page with the back action
- **THEN** the page persists the new selection before returning
- **AND** if the update fails because the network is unavailable, the page still returns, preserves the previous gender, and surfaces the workbook network-unavailable prompt

#### Scenario: Confirming birthday while offline

- **WHEN** the user confirms a new birthday while the device is offline
- **THEN** the birthday picker closes, the profile keeps showing the previous birthday, and the workbook network-unavailable prompt is surfaced

### Requirement: Field-Specific Length And Blank Rules

The profile module SHALL enforce the workbook's length limits, allowed character handling, delete-to-empty saves, and all-whitespace rules for nickname, mobile, email, and signature.

#### Scenario: Saving edge-case field values

- **WHEN** the user saves maximum-length, empty, or whitespace-heavy profile input
- **THEN** the resulting save behavior matches the test-defined rule for that field

#### Scenario: Deleting nickname to empty

- **WHEN** the user clears nickname content and saves
- **THEN** the save succeeds, the nickname remains empty on the profile model, and reopening the nickname editor falls back to displaying the current account ID

### Requirement: Back Navigation With Unsaved Edits

The profile module SHALL handle back navigation from edited mobile, email, or signature pages without silently applying unsaved values.

#### Scenario: Leaving a field editor after changing content

- **WHEN** the user modifies a field and then navigates back before saving
- **THEN** the page follows the workbook's expected unsaved-change behavior for that field

### Requirement: Offline Profile Update Handling

The profile editing module SHALL surface failure states for avatar or field updates attempted without network connectivity and SHALL recover cleanly after reconnect or network switch.

#### Scenario: Saving profile changes while offline

- **WHEN** the user tries to save a profile update without network
- **THEN** the app reports failure and does not silently persist an unsent value

