## MODIFIED Requirements

### Requirement: About And Product Introduction Navigation

The app SHALL provide the About page and product-introduction entry reachable from the My tab and SHALL render the page structure required by the tests.

#### Scenario: Opening the About surface

- **WHEN** the user navigates from My to About and then to Product Introduction
- **THEN** the About page shows the workbook-required logo, product name, version row, and product-introduction entry
- **AND** the Product Introduction page opens with the expected title, back action, and embedded H5 content container

#### Scenario: Opening the Yunxin H5 product introduction page

- **WHEN** the user taps the `产品介绍` entry from the About page
- **THEN** the app opens `/user/product-intro`
- **AND** `/user/product-intro` loads `https://netease.im/m/` inside the app
