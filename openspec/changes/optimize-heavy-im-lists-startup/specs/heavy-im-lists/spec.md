## MODIFIED Requirements

### Requirement: Large friend accounts remain interactive after login

RN login, conversation, and friend-related list screens MUST avoid repeated synchronous full-list derivation and oversized debug-log formatting during render so large accounts remain responsive after IM data sync.

#### Scenario: Login with thousands of friends

- **WHEN** an Android device logs in to an account with thousands of friends and main IM data sync completes
- **THEN** refreshing local friend state updates a stable sorted friend snapshot only when friend data changes
- **AND** observer renders do not repeatedly rebuild and sort the full friend list without a friend data change
- **AND** the page remains able to respond to button taps while background IM refresh work completes

#### Scenario: Render many conversations after large-account sync

- **WHEN** the conversation list renders many local or im-store-v2 conversations
- **THEN** the bridge reuses stable conversation and display-conversation snapshots between data changes
- **AND** im-store-v2 debug logging does not format full conversation, friend, message, or AI-user payloads on the JS thread
- **AND** header actions, row presses, and swipe actions remain responsive during background sync
- **AND** fast scrolling does not expose persistent blank list regions

#### Scenario: Render friend-derived screens after large-account sync

- **WHEN** contacts home, conversation search, friend pickers, blacklist picker, or forward target screens derive rows from the friend list
- **THEN** they reuse stable friend-list snapshots and memoized derived rows between unrelated renders
- **AND** existing ordering, filtering, search, selection, and navigation behavior remains unchanged

### Requirement: Online-status subscription avoids large-account rate limits

RN online-status subscription MUST batch and de-duplicate account subscriptions so large friend or conversation lists do not flood the SDK with repeated `subscribeEvent` calls.

#### Scenario: Subscribe friend online status for thousands of friends

- **WHEN** the local friend list changes for an account with thousands of friends
- **THEN** the RN UIKit online-status manager subscribes friend accounts in SDK-limited batches of at most 100 accounts per request
- **AND** it filters accounts that are already subscribed before calling the SDK
- **AND** it does not listen to or derive the friend subscription source from im-store-v2 `rootStore.friendStore`

#### Scenario: Subscribe conversation online status while scrolling

- **WHEN** the conversation list contains many P2P conversations
- **THEN** the page subscribes an initial bounded P2P account batch and the currently visible P2P account window
- **AND** it does not subscribe every P2P conversation account solely because the full conversation array rendered
- **AND** repeated viewability changes are debounced and de-duplicated before SDK subscription calls

#### Scenario: Server returns online-status rate limit

- **WHEN** the SDK returns error code 416 for online-status subscription
- **THEN** RN pauses further online-status subscribe calls for a cooldown interval before retrying the latest desired account set
- **AND** the page remains interactive while online status may be temporarily stale
