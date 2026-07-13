## MODIFIED Requirements

### Requirement: Friend Directory Rendering

The contacts home page SHALL render friend rows using the alias, nickname, avatar, and account precedence rules defined by the tests and SHALL support the empty-state and sort behavior required by the workbook.

#### Scenario: Displaying friend row identity

- **WHEN** a friend row renders in the contacts friend list
- **THEN** the displayed name uses remark first, profile nickname second, and account ID last
- **AND** the row avatar uses the profile avatar when present
- **AND** when no avatar is present, the fallback label is derived from the same remark, nickname, or account ID precedence

#### Scenario: Sorting and grouping friend rows

- **WHEN** the contacts friend list contains multiple friends
- **THEN** friend rows are grouped and sorted by the pinyin initial of remark first, profile nickname second, and account ID last
- **AND** non-letter groups are placed after letter groups

#### Scenario: Empty friend list

- **WHEN** the current account has no visible friends
- **THEN** the friend-list area shows an empty state with `暂无好友`
