## MODIFIED Requirements

### Requirement: Forward Target Selection

The forwarding flow SHALL provide recent-forward sessions, search, single-target selection, multi-target selection up to the supported limit, and stale-target rejection for deleted friends or invalid teams. The forwarding target page SHALL place Recent Forward as a top shortcut module above the Recent Chats, My Friends, and My Groups tabs when recent-forward targets exist, SHALL keep Recent Chats, My Friends, and My Groups as white-background tabs below the search field and recent-forward module, SHALL place the selected-conversations strip between the search field and recent-forward module in multi-select mode, SHALL highlight the active tab with highlighted text and a bottom color block, and SHALL render only the active tab's list while preserving existing search filtering and empty-state behavior for that category.

#### Scenario: Selecting forwarding targets

- **WHEN** the user opens the forwarding target page and chooses recent or searched sessions
- **THEN** the page enforces valid target selection and blocks broken or stale conversations

#### Scenario: Recent forwarding history fails to load

- **WHEN** the forwarding target page cannot load its recent-forward history before showing recent entries
- **THEN** the page distinguishes that failure from a true empty state and provides a retry action

#### Scenario: Rendering recent-forward shortcuts above tabs

- **WHEN** the forwarding target page has valid recent-forward targets
- **THEN** it MUST render a Recent Forward shortcut module above the target-category tabs
- **AND** tapping a recent-forward shortcut MUST select the same target as the corresponding recent chat, friend, or group row
- **AND** recent-forward targets MUST come from the persisted forwarding history, not from the recent-chat list, so a valid forwarded-to friend or group MAY appear even when it is absent from Recent Chats

#### Scenario: Hiding empty recent-forward shortcuts

- **WHEN** the forwarding target page has no valid recent-forward targets and is not loading or retrying that module
- **THEN** it MUST hide the Recent Forward module instead of showing an empty section above the tabs

#### Scenario: Switching forwarding target tabs

- **WHEN** the user taps Recent Chats, My Friends, or My Groups below the search field
- **THEN** the page marks that tab active and renders only the corresponding target list
- **AND** selected targets remain selected when the user switches between tabs

#### Scenario: Rendering forwarding target rows

- **WHEN** the forwarding target page renders recent chats, friends, groups, or discussion groups
- **THEN** the target list background and target rows MUST use a white background
- **AND** target rows MUST NOT show secondary descriptions such as account id, group label, or member-count subtitle
- **AND** group and discussion titles MUST show a visible member count suffix in the form `(x)`, keeping that suffix visible after title truncation when the title exceeds one line

#### Scenario: Searching within forwarding target tabs

- **WHEN** the user enters a search keyword on the forwarding target page
- **THEN** the active tab filters its corresponding targets by title, subtitle, or target id
- **AND** if the active tab has no matches, the page shows the existing no-result or category empty state without stacking the other categories below it
