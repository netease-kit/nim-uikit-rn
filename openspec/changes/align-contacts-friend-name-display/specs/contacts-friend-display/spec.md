## ADDED Requirements

### Requirement: Contacts friend rows show nickname without account identifiers

The contacts page MUST prioritize the friend's nickname for the row title and MUST NOT expose the friend's `accountId` in the visible row text.

#### Scenario: Friend row renders after nickname data loads

- **WHEN** a friend has a loaded nickname in profile data
- **THEN** the contacts row title shows that nickname
- **AND** the row does not display the friend's `accountId`
- **AND** the row does not render a separate subtitle containing the account identifier

#### Scenario: Friend row renders without nickname

- **WHEN** a friend does not have a loaded nickname
- **THEN** the contacts row falls back to non-account display text such as alias or a generic placeholder
- **AND** the row still does not display the friend's `accountId`
