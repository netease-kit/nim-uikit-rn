# conversation-list Specification

## Purpose

TBD - created by archiving change unify-conversation-list-time-format. Update Purpose after archive.

## Requirements

### Requirement: Fixed Conversation List Time Format

RN conversation list timestamps SHALL render with a fixed format that is independent of the device locale and 12-hour/24-hour system preference.

#### Scenario: Today's conversation timestamp

- **GIVEN** a conversation timestamp is on the same local calendar day as the current time
- **WHEN** the conversation list renders the row
- **THEN** the timestamp MUST display as `HH:mm` using 24-hour time

#### Scenario: Current-year conversation timestamp

- **GIVEN** a conversation timestamp is in the same local calendar year as the current time but not today
- **WHEN** the conversation list renders the row
- **THEN** the timestamp MUST display as `MM月dd日 HH:mm` using 24-hour time

#### Scenario: Cross-year conversation timestamp

- **GIVEN** a conversation timestamp is not in the same local calendar year as the current time
- **WHEN** the conversation list renders the row
- **THEN** the timestamp MUST display as `yyyy年MM月dd日`

### Requirement: Conversation Online Status Refresh

The system SHALL refresh P2P friend online/offline status in the conversation list when subscribed user status changes are received.

#### Scenario: Friend login updates conversation list

- **WHEN** a subscribed P2P friend logs in
- **THEN** the conversation list updates that friend's online indicator without requiring a manual refresh

#### Scenario: Friend logout updates conversation list

- **WHEN** a subscribed P2P friend logs out or terminates the app
- **THEN** the conversation list updates that friend's offline indicator without requiring a manual refresh

### Requirement: Fallback User Avatar Uses Nickname Before Account

When a user does not have a preset avatar, the RN app MUST derive the fallback text avatar from the user's nickname before falling back to the account id.

#### Scenario: Friend alias does not affect fallback avatar text

- **WHEN** a P2P user has no preset avatar and the current account has set a friend alias
- **THEN** the visible user name may still show the friend alias where required
- **AND** the fallback avatar text must not use the friend alias
- **AND** the fallback avatar text must use the user's nickname, or the account id when no nickname exists

#### Scenario: Team nickname does not affect fallback avatar text

- **WHEN** a team member has no preset avatar and has a team nickname
- **THEN** the visible user name may still show alias or team nickname where required
- **AND** the fallback avatar text must not use the team nickname
- **AND** the fallback avatar text must use the user's nickname, or the account id when no nickname exists

#### Scenario: Shared RN user-avatar entry points stay consistent

- **WHEN** conversation list, contacts, chat, friend card, mention list, member list, blacklist, or selector pages render a user without a preset avatar
- **THEN** all those RN entry points must use the same fallback text avatar rule
- **AND** they must not diverge because some pages build avatar text manually while others use UIKit helpers
