## MODIFIED Requirements

### Requirement: Settings Landing Page Layout

The settings module SHALL provide the first-level settings page with the message-notification entry, earpiece-mode toggle, read-receipt toggle, appearance entry, language entry, and logout action required by the tests.

#### Scenario: Opening settings

- **WHEN** the user enters the settings page from My
- **THEN** the page shows the required rows and the current toggle state

### Requirement: Notification Settings Page Layout

The settings module SHALL provide the message-notification settings page with the section layout, back navigation, and toggle rows required by the tests.

#### Scenario: Opening message notification settings

- **WHEN** the user enters the message-notification settings page from settings
- **THEN** the page shows the expected rows and current preference state

### Requirement: Notification Preference Toggles

The settings module SHALL provide toggles for message notifications, sound, vibration, and detail visibility on the message-notification page.

#### Scenario: Changing notification preferences

- **WHEN** the user changes one or more notification preferences
- **THEN** the selected preference values persist locally and update the visible settings state

### Requirement: Combination Preference States

The settings module SHALL preserve the combination states covered by the tests, including sound only, vibration only, both, neither, and hidden message detail.

#### Scenario: Saving preference combinations

- **WHEN** the user selects a supported combination of sound and vibration toggles
- **THEN** the exact combination remains stored and visible after returning to settings

### Requirement: Preference Dependency Rules

The settings module SHALL enforce the workbook's dependency rules between the master new-message toggle and subordinate sound, vibration, and detail-visibility controls.

#### Scenario: Disabling and re-enabling new message notifications

- **WHEN** the user turns the master new-message notification toggle off and later on again
- **THEN** subordinate controls follow the expected enabled-state and retained-value rules

### Requirement: Read Receipt Preference

The settings module SHALL expose the read-receipt preference toggle on the first-level settings page and apply it consistently to later message send behavior.

#### Scenario: Toggling read receipts in settings

- **WHEN** the user turns the read-receipt preference on or off
- **THEN** the stored preference updates and later message behavior follows that setting
