## ADDED Requirements

### Requirement: Contacts top modules scroll with the contacts list

The contacts page MUST place the top shortcut modules and the summary strip inside the same vertical scroll context as the friend list.

#### Scenario: Scrolling the contacts page

- **WHEN** the user scrolls the contacts page vertically
- **THEN** the shortcut modules scroll together with the summary strip and friend list
- **AND** the page does not keep the shortcut modules fixed outside the list scroll area

#### Scenario: Jumping by section index

- **WHEN** the user taps a section letter in the contacts index rail
- **THEN** the page scrolls to the corresponding friend section
- **AND** the shortcut modules and summary strip remain part of the same list scroll context
