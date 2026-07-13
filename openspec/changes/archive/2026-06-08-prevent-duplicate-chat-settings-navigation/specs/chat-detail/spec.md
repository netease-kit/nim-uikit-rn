## ADDED Requirements

### Requirement: Chat Detail Duplicate Navigation Protection

Protected chat-related navigation entries SHALL open at most one destination page for a single continuous interaction.

#### Scenario: Repeated taps while opening P2P settings

- **GIVEN** the user is viewing a P2P chat detail screen
- **WHEN** the user taps the header settings entry multiple times before the first navigation completes
- **THEN** the app MUST open only one P2P settings page

#### Scenario: Repeated taps while opening team settings

- **GIVEN** the user is viewing a team chat detail screen
- **WHEN** the user taps the header settings entry multiple times before the first navigation completes
- **THEN** the app MUST open only one team settings page

#### Scenario: Open settings again after returning

- **GIVEN** the user opened chat settings and returned to the chat detail screen
- **WHEN** the user taps the header settings entry again in a later interaction
- **THEN** the app MUST allow one new settings navigation

#### Scenario: Repeated taps on other protected entries

- **GIVEN** the user is on a protected chat-related list, detail, or settings screen
- **WHEN** the user taps the same protected navigation entry multiple times before the first navigation completes
- **THEN** the app MUST open only one destination page for that interaction
