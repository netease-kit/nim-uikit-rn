## MODIFIED Requirements

### Requirement: Notification Preference Toggles

The settings module SHALL provide toggles for message notifications, sound, vibration, and detail visibility on the message-notification page, and SHALL apply those values to the current RN notification presentation configuration where the runtime supports it.

#### Scenario: Changing notification preferences

- **WHEN** the user changes one or more notification preferences
- **THEN** the selected preference values persist locally, update the visible settings state, and refresh the app's active notification presentation behavior

### Requirement: Preference Dependency Rules

The settings module SHALL enforce the workbook's dependency rules between the master new-message toggle and subordinate sound, vibration, and detail-visibility controls.

#### Scenario: Disabling and re-enabling new message notifications

- **WHEN** the user turns the master new-message notification toggle off and later on again
- **THEN** subordinate controls become non-editable while disabled, retain their last saved values, and resume those values when the master toggle is re-enabled

### Requirement: Combination Preference States

The settings module SHALL preserve the combination states covered by the tests, including sound only, vibration only, both, neither, and hidden message detail.

#### Scenario: Saving preference combinations

- **WHEN** the user selects a supported combination of sound and vibration toggles
- **THEN** the exact combination remains stored and visible after returning to settings, and Android channel settings are refreshed to match when available
