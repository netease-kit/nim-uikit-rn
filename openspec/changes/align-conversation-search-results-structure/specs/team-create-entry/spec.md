## MODIFIED Requirements

### Requirement: Team Creation From Conversation Flows

The app SHALL allow users to create advanced teams or discussion-group-equivalent flows from conversation-related entry points and route directly into the created conversation.

#### Scenario: Creating a team from the picker

- **WHEN** the user confirms a valid invitee set for team creation
- **THEN** the app creates the team and opens the resulting chat page

#### Scenario: Conversation search groups local matches by type

- **WHEN** the user searches from the conversation search page with a non-empty keyword
- **THEN** the page MUST show fuzzy local matches from friends and joined teams
- **AND** the results MUST be grouped by type with visual dividers between groups

#### Scenario: Conversation search highlights matching text

- **WHEN** the conversation search page renders a matched friend or team result
- **THEN** the matched portion of the displayed nickname, accountId, or team name MUST be highlighted in blue
