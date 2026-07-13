## MODIFIED Requirements

### Requirement: Contacts Home Structure

The app SHALL provide a contacts home page that exposes the friend directory, verification center, blacklist, my-team-list, my-AI-user-list, and add-friend entry points required by the tests.

#### Scenario: Viewing contacts home

- **WHEN** the user opens the Contacts tab
- **THEN** the page shows the required shortcuts, unread badge, and friend directory structure
- **AND** the `我的数字人` shortcut appears below `我的群聊`

### Requirement: Contacts Navigation

The contacts home page SHALL navigate correctly from each shortcut or row into friend card, verification center, blacklist, joined-team list, AI-user list, add-friend flow, and individual friend chat surfaces.

#### Scenario: Opening a contact surface from Contacts

- **WHEN** the user taps a supported shortcut or friend row
- **THEN** the app routes into the corresponding page or conversation with the expected initial state

#### Scenario: Opening a shortcut target without freezing

- **WHEN** the user taps the verification center, blacklist, joined-team, or my-AI-user shortcut from the Contacts tab
- **THEN** the app completes the navigation into the corresponding target page
- **AND** the current UI does not remain stuck in a pressed or non-interactive state

#### Scenario: Opening my AI users

- **WHEN** the user taps `我的数字人`
- **THEN** the app opens a page listing AI users returned by the UIKit AI user store
- **AND** tapping an AI user opens or creates the corresponding p2p conversation
