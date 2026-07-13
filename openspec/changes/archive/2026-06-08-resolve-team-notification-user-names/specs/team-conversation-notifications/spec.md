## MODIFIED Requirements

### Requirement: Team Notification Messages In Conversations

The app SHALL render human-readable team notification messages in conversation views.

#### Scenario: Inviting non-friend members into a group

- **GIVEN** A and B are friends
- **AND** A and C are friends
- **AND** B and C are not friends and do not share another group
- **WHEN** B is viewing the group chat page
- **AND** A invites C into that group
- **THEN** B's chat page MUST display the invite notification using C's nickname
- **AND** the notification MUST NOT display C's account id as the member name when C's user profile can be fetched
- **AND** the notification SHOULD avoid first rendering C's account id and then replacing it with the nickname in a visible flicker
