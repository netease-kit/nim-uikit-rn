## MODIFIED Requirements

### Requirement: Team Notification Messages In Conversations

The app SHALL render human-readable team notification messages in conversation views. Participant names in membership notifications SHALL prefer friend alias when available, then personal nickname, message-carried nickname, and account id; they MUST NOT use stale team nicknames for users who left and later rejoined.

#### Scenario: Inviting non-friend members into a group

- **GIVEN** A and B are friends
- **AND** A and C are friends
- **AND** B and C are not friends and do not share another group
- **WHEN** B is viewing the group chat page
- **AND** A invites C into that group
- **THEN** B's chat page MUST display the invite notification using C's nickname
- **AND** the notification MUST NOT display C's account id as the member name when C's user profile can be fetched
- **AND** the notification SHOULD avoid first rendering C's account id and then replacing it with the nickname in a visible flicker

#### Scenario: Rejoined member notification ignores old team nickname

- **GIVEN** account A had a team nickname in team T
- **AND** account A left team T or was removed from team T
- **WHEN** account A later rejoins team T and membership notifications are rendered
- **THEN** notification participant names for account A MUST NOT use A's old team nickname from before leaving
- **AND** the name MUST fall back to friend alias, personal nickname, message-carried nickname, or account id
