## MODIFIED Requirements

### Requirement: Personal Information Overview

The app SHALL provide the personal-information overview page with account copy action, the required editable field rows in the test-defined order, immediate visible updates after the user successfully saves editable profile fields such as nickname, mobile, email, or signature, and direct child edit pages that expose a visible in-page `cancel / title / save` top bar instead of relying only on a navigation-bar affordance.

#### Scenario: Opening personal information

- **WHEN** the user enters the personal-information page
- **THEN** the page shows avatar, nickname, account, gender, birthday, mobile, email, and signature rows

#### Scenario: Returning after editing a profile field

- **WHEN** the user saves nickname, mobile, email, or signature successfully and returns to the personal-information page
- **THEN** the corresponding row shows the updated value immediately without requiring a manual refresh or later re-entry

#### Scenario: Editing profile fields with a visible in-page top bar

- **WHEN** the user opens a profile text edit page or the gender selection page
- **THEN** the page shows a visible in-page `取消 / 标题 / 保存` top bar so the user can complete or cancel the edit even if the system navigation header action is unavailable
