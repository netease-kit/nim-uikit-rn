## 1. Implementation

- [x] 1.1 Remove eager full team-member loading from team chat entry.
- [x] 1.2 Load the current user's team member record by account ID for chat role checks.
- [x] 1.3 Add in-flight de-duplication for full team-member loads.
- [x] 1.4 Add in-flight de-duplication for member-by-id loads.
- [x] 1.5 Ensure partial member updates do not mark the full member list as loaded.
- [x] 1.6 Apply full member pages incrementally instead of writing only after all pages finish.
- [x] 1.7 Fetch team member page visible-row profiles instead of all member profiles.
- [x] 1.8 Tune team member list virtualization and row rendering for fast scrolling.
- [x] 1.9 Switch team member browsing to Android-aligned full member loading with virtualized rendering.
- [x] 1.10 Preload one bounded 150-member page on team chat entry without marking full members loaded.
- [x] 1.11 Tune mention picker virtualization and visible-candidate profile fetching for large teams.

## 2. Validation

- [x] 2.1 Run TypeScript typecheck.
- [x] 2.2 Run lint.
- [x] 2.3 Validate the OpenSpec change.
- [x] 2.4 Confirm Metro status on port 8081.
