## ADDED Requirements

### Requirement: About Netease page matches the Web information structure

The `/user/aboutNetease` page MUST present the same primary information structure as the local Web implementation.

#### Scenario: User opens the about page

- **WHEN** the user navigates to `/user/aboutNetease`
- **THEN** the logo section displays the app title `云信IM H5`
- **AND** the page shows a `版本号` row
- **AND** the page shows an `IM版本号` row
- **AND** the page shows a `产品介绍` row that opens the Yunxin website

#### Scenario: Product intro link is activated

- **WHEN** the user taps the `产品介绍` row
- **THEN** the app opens `https://yunxin.163.com/`
