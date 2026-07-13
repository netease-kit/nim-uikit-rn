## MODIFIED Requirements

### Requirement: Conversation Search

The app SHALL provide a search page for conversations, friends, and teams with placeholder, clear-input behavior, matching rules, no-result state, result navigation, and the same React Native UIKit page pattern used by related search screens.

#### Scenario: Searching from conversation entry

- **WHEN** the user enters search text on the conversation search page
- **THEN** the app shows matched conversations, friends, and teams or the expected no-result state

#### Scenario: Clearing search content

- **WHEN** the user deletes all search text with the clear affordance
- **THEN** the search field and result panel reset to the expected initial state

#### Scenario: Search page follows the shared RN UIKit pattern

- **WHEN** the user opens the conversation search page in the React Native app
- **THEN** the page MUST use the same RN UIKit search-page structure as related search screens
- **AND** the page MUST use the shared search bar styling and grouped section label treatment
- **AND** the page MUST keep the initial no-keyword state visually neutral instead of showing an extra standalone prompt message
- **AND** the page MUST NOT expose a create-group action in the top bar
