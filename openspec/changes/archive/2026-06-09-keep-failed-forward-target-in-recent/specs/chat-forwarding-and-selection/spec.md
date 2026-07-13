## MODIFIED Requirements

### Requirement: Forward Target Selection

The forwarding flow SHALL provide recent-forward sessions, search, single-target selection, multi-target selection up to the supported limit, and stale-target rejection for invalid teams or P2P targets without a retained local conversation. The forwarding target page SHALL place Recent Forward as a top shortcut module above the Recent Chats, My Friends, and My Groups tabs when recent-forward targets exist, SHALL keep Recent Chats, My Friends, and My Groups as white-background tabs below the search field and recent-forward module, SHALL place the selected-conversations strip between the search field and recent-forward module in multi-select mode, SHALL highlight the active tab with highlighted text and a bottom color block, and SHALL render only the active tab's list while preserving existing search filtering and empty-state behavior for that category. Recent Chats, My Friends, and My Groups SHALL each maintain an independent vertical scroll position so scrolling one tab does not change the visible position of another tab. The Recent Forward module SHALL record locally confirmed forward targets before the remote send result returns, and SHALL continue to show a persisted P2P target even if forwarding to that target later fails because the current account is deleted or blocked by that peer. P2P conversations that remain in the local conversation list SHALL remain valid forwarding targets even when the peer account is no longer a friend.

#### Scenario: Failed P2P forwarding target remains in Recent Forward

- **GIVEN** the current account has been deleted or blocked by P2P account A
- **WHEN** the user forwards a message to account A and the send fails
- **AND** the user reopens the forwarding target page
- **THEN** the Recent Forward module MUST show account A
- **AND** selecting account A from Recent Forward MUST use account A's P2P conversation id
- **AND** the regular Recent Chats tab MAY continue to filter account A if no retained local conversation exists
