## MODIFIED Requirements

### Requirement: Contacts Home Structure

The app SHALL provide a contacts home page that exposes the friend directory, verification center, blacklist, my-team-list, and add-friend entry points required by the tests.

#### Scenario: Viewing contacts home

- **WHEN** the user opens the Contacts tab
- **THEN** the page shows the required shortcuts, unread badge, and friend directory structure

#### Scenario: Showing unread verification applicants

- **WHEN** the current account has unread friend verification applications from one or more applicants
- **THEN** the Contacts shortcut badge reflects the number of unique applicants with unread pending applications
