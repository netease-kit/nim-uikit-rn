## ADDED Requirements

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
