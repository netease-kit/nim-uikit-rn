## ADDED Requirements

### Requirement: Setting page exposes system authorization management

The `/user/setting` page MUST expose a system authorization management entry alongside notification, cloud-conversation, read-receipt, language, and logout settings.

#### Scenario: User opens system authorization management

- **WHEN** the user navigates to `/user/setting`
- **THEN** the page shows a row labeled `系统授权管理`
- **AND** tapping the row routes to the system authorization management page
