# contacts-home Specification

## Purpose
TBD - created by archiving change port-im-kit-react-ui-h5. Update Purpose after archive.
## Requirements
### Requirement: Contacts Home Structure

The app SHALL provide a contacts home page that exposes the friend directory, verification center, blacklist, my-team-list, and add-friend entry points required by the tests.

#### Scenario: Viewing contacts home

- **WHEN** the user opens the Contacts tab
- **THEN** the page shows the required shortcuts, unread badge, and friend directory structure

### Requirement: Friend Directory Rendering

The contacts home page SHALL render friend rows using the alias, nickname, avatar, and account precedence rules defined by the tests and SHALL support the empty-state and sort behavior required by the workbook.

#### Scenario: Rendering a friend row

- **WHEN** a friend has both alias and nickname data
- **THEN** the row shows the expected display name according to the precedence rules

#### Scenario: Rendering friend list edge states

- **WHEN** the user has no friends or the friend list requires sorting
- **THEN** the list shows the expected empty-state or sorted order required by the tests

#### Scenario: Rendering pinyin-sorted friend groups

- **WHEN** the friend directory contains Chinese, English, and symbol-prefixed display names
- **THEN** the contacts home page groups friends by pinyin initial from `A` to `Z`, places non-letter entries under `#`, and sorts rows inside each group by display name

### Requirement: Contacts Navigation

The contacts home page SHALL navigate correctly from each shortcut or row into friend card, verification center, blacklist, joined-team list, add-friend flow, and individual friend chat surfaces.

#### Scenario: Opening a contact surface from Contacts

- **WHEN** the user taps a supported shortcut or friend row
- **THEN** the app routes into the corresponding page or conversation with the expected initial state

