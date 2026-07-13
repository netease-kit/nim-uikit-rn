## ADDED Requirements

### Requirement: Chat media permission prompts must be user initiated

The iOS chat detail screen MUST NOT trigger the system photo-library permission prompt merely by entering the conversation.

#### Scenario: First opening chat detail without touching media actions

- **GIVEN** the user has not granted photo-library access yet
- **WHEN** the user opens a chat detail screen for the first time
- **THEN** the screen must render without showing the system photo-library permission dialog

#### Scenario: First tapping the image or video composer action

- **GIVEN** the user has not granted photo-library access yet
- **WHEN** the user taps the composer image/video action for the first time
- **THEN** the chat detail screen may request photo-library permission at that moment

#### Scenario: First choosing album from the file source sheet

- **GIVEN** the user has not granted photo-library access yet
- **WHEN** the user opens the file source sheet and taps the album option for the first time
- **THEN** the chat detail screen may request photo-library permission at that moment

#### Scenario: Limited library refresh listener only while picker is visible

- **GIVEN** the user has granted limited photo-library access on iOS
- **WHEN** the limited media picker is not currently visible
- **THEN** chat detail must not keep a photo-library change listener active solely because the page is mounted
