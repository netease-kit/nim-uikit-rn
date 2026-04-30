## ADDED Requirements

### Requirement: My page excludes the collection menu item

The "我的" page MUST NOT render a `收藏` menu item in its primary menu section.

#### Scenario: User opens the my page

- **WHEN** the user navigates to the "我的" page
- **THEN** the primary menu shows `关于云信` and `设置`
- **AND** the page does not show a `收藏` menu row in that menu section
