## ADDED Requirements

### Requirement: Conversation List Avatar Must Not Flash Recycled Images

The conversation list SHALL NOT temporarily display an unrelated avatar image during cold startup or virtualized row reuse.

#### Scenario: App cold starts into conversation list

- **GIVEN** the app process was killed
- **WHEN** the user reopens the app and enters the conversation list
- **THEN** each conversation row avatar MUST either show its own resolved avatar or its fallback label/avatar color
- **AND** a row MUST NOT show a previously recycled image from another account, team, or conversation while the correct avatar is loading
- **AND** a row without a resolved avatar MUST NOT receive a random remote avatar image as a temporary placeholder

#### Scenario: Avatar image source changes after identity sync

- **GIVEN** a conversation row was rendered before user, friend, AI, or team avatar data finished syncing
- **WHEN** the row's resolved avatar URL changes
- **THEN** the image component MUST reset the recycled image for that row before displaying the new source
