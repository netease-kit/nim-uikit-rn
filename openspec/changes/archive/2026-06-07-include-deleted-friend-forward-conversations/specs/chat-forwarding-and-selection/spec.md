## MODIFIED Requirements

### Requirement: Forward Target Selection

The forwarding flow SHALL provide recent-forward sessions, search, single-target selection, multi-target selection up to the supported limit, and stale-target rejection for invalid teams or P2P targets without a retained local conversation. The forwarding target page SHALL place Recent Forward as a top shortcut module above the Recent Chats, My Friends, and My Groups tabs when recent-forward targets exist, SHALL keep Recent Chats, My Friends, and My Groups as white-background tabs below the search field and recent-forward module, SHALL place the selected-conversations strip between the search field and recent-forward module in multi-select mode, SHALL highlight the active tab with highlighted text and a bottom color block, and SHALL render only the active tab's list while preserving existing search filtering and empty-state behavior for that category. P2P conversations that remain in the local conversation list SHALL remain valid forwarding targets even when the peer account is no longer a friend.

#### Scenario: Selecting forwarding targets

- **WHEN** the user opens the forwarding target page and chooses recent or searched sessions
- **THEN** the page enforces valid target selection and blocks broken or stale conversations

#### Scenario: Showing deleted-friend retained conversations

- **GIVEN** a P2P conversation with account A is visible in the main conversation list
- **AND** account A has been deleted from the current friend list
- **WHEN** the user opens the forwarding target page
- **THEN** the Recent Chats tab MUST still show account A's retained conversation
- **AND** the Recent Forward module MUST still show account A's retained conversation when its conversation id exists in recent-forward history
- **AND** selecting account A's retained conversation MUST use the existing P2P conversation id

#### Scenario: Filtering stale P2P forwarding targets

- **GIVEN** a P2P account is no longer a friend
- **AND** the app has no retained local conversation for that P2P account
- **WHEN** the user opens the forwarding target page
- **THEN** that stale P2P target MUST NOT be shown as a forwarding target
