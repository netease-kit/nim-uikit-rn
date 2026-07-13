## ADDED Requirements

### Requirement: Chat Album Access Under Limited Permissions

The chat detail screen SHALL restrict limited photo-library access to only the media assets currently authorized by the system.

#### Scenario: Send media after granting partial photo access

- **GIVEN** the user tapped the chat image entry and granted only partial/limited photo-library access
- **AND** the user selected a subset of photos in the system permission flow
- **WHEN** the user opens the chat album entry again
- **THEN** the app MUST only display media assets that are currently authorized for the app
- **AND** unauthorized media assets MUST NOT be visible in the chat media selection UI
- **AND** after the user adds more authorized photos through the system limited-access flow, the chat media selection UI MUST reflect the newly authorized assets

#### Scenario: Media picker disables incompatible assets after first selection

- **WHEN** the user selects the first image in the chat media picker
- **THEN** all unselected video assets MUST appear disabled and MUST NOT be selectable
- **WHEN** the user selects the first video in the chat media picker
- **THEN** all unselected image assets MUST appear disabled and MUST NOT be selectable

#### Scenario: Media picker disables remaining assets after reaching the selection limit

- **WHEN** the user has selected the maximum number of allowed media assets
- **THEN** all remaining unselected media assets MUST appear disabled and MUST NOT be selectable
- **AND** already selected assets MUST remain selectable so the user can deselect them

#### Scenario: Media picker confirm action shows selected count

- **WHEN** the user opens the chat media picker
- **THEN** the top-right action MUST use the `确定` wording instead of `添加`
- **AND** after selecting media it MUST show the selected media count after the wording
