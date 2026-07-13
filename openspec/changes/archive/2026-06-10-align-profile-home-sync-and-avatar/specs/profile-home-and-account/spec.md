## MODIFIED Requirements

### Requirement: My Home Page

The app SHALL provide the My page with avatar, nickname, account, personal-detail entry, about entry, settings entry, and favorites or collection entry required by the tests, without showing an extra top title bar text while still reserving the original title-bar layout space.

#### Scenario: Viewing the My page

- **WHEN** the user opens the My tab
- **THEN** the page shows the expected overview and entry points
- **AND** the page does not show a top title such as `我的`
- **AND** the page still reserves the top title-bar height as blank spacing before the first content block
- **AND** the reserved spacing uses the same white background as the top content card area

#### Scenario: Viewing My with empty nickname or avatar

- **GIVEN** the current user profile has an empty nickname or no preset avatar
- **WHEN** the user opens the My page
- **THEN** the nickname area shows the current account identifier instead of an unset placeholder
- **AND** the avatar fallback text uses the trailing two characters of the nickname, or the trailing two characters of the account identifier when no nickname exists

### Requirement: Personal Information Overview

The app SHALL provide the personal-information overview page with account copy action, the required editable field rows in the test-defined order, immediate visible updates after the user successfully saves editable profile fields such as nickname, mobile, email, or signature, direct child edit pages that expose workbook-aligned top bars, and a gender selection flow that matches the workbook options and save timing across multi-device sessions.

#### Scenario: Returning after editing a profile field on another device

- **GIVEN** the same account is logged in on multiple devices
- **WHEN** the current account profile is updated on another online device
- **THEN** the local device refreshes its current-account profile state
- **AND** the My page and personal-information page show the updated profile values without requiring a manual refresh or app restart

#### Scenario: Editing gender while offline

- **WHEN** the user changes gender and leaves the gender page while the network is unavailable
- **THEN** the app exits the gender page first
- **AND** the app then reports that the save failed
