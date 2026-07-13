## ADDED Requirements

### Requirement: Friend Card Reflects Deleted Relationship

The friend card SHALL reflect a deleted friend relationship without requiring the app process to restart.

#### Scenario: Other device deletes friend while chat page is open

- **GIVEN** the current account is logged in on multiple devices
- **AND** another device deletes account A from the friend list
- **WHEN** this RN client receives the friend-deleted relationship event
- **THEN** RN MUST remove account A from both the local friend state and the UIKit/rootStore friend state immediately
- **AND** tapping account A's avatar from the chat page MUST open the card in stranger state
- **AND** RN MUST continue to refresh the full friend state in the background

#### Scenario: Same account deletes friend from another RN device while chat page is open

- **GIVEN** account A and account B are friends
- **AND** account A is logged in on RN Android and RN iOS at the same time
- **AND** both RN clients are on the chat detail page with account B
- **WHEN** either RN client deletes account B as a friend
- **AND** the other RN client taps account B's avatar before a process restart
- **THEN** RN MUST verify the current friend relationship before rendering the card
- **AND** RN MUST clear stale local and UIKit/rootStore friend state when the relationship no longer exists
- **AND** RN MUST render account B's card in stranger state
