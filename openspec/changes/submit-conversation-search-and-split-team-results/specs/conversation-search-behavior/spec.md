## MODIFIED Requirements

### Requirement: Conversation Search Submission And Result Grouping

The conversation search page SHALL search local friends and joined teams by keyword after the user submits the search from the keyboard.

#### Scenario: Search waits for keyboard submit

- **GIVEN** the user is on the conversation search page
- **WHEN** the user changes the search input text without pressing the keyboard search key
- **THEN** the page does not update results for the new input text

#### Scenario: Submitted keyword updates results

- **GIVEN** the user has entered a non-empty search keyword
- **WHEN** the user presses the keyboard search key
- **THEN** the page refreshes search results using that submitted keyword

#### Scenario: Results are grouped by contact and team category

- **GIVEN** a submitted keyword matches friends, discussion teams, and advanced teams
- **WHEN** the search results are rendered
- **THEN** the page shows matching friends in a "好友" module
- **AND** shows matching discussion teams in a "讨论组" module
- **AND** shows matching advanced teams in a "高级群" module
